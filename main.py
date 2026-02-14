from flask import Flask, request, Response, stream_with_context, jsonify, send_from_directory
from flask_cors import CORS
from yt_dlp import YoutubeDL
import requests
import re
import os

# Determine absolute path to dist folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')

# Initialize Flask App serving the 'dist' folder built by Vite
app = Flask(__name__, static_folder=DIST_DIR, static_url_path='')
CORS(app)

@app.route('/')
def serve_index():
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return "Index not found", 404

@app.route('/assets/<path:path>')
def serve_assets(path):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), path)

@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api') or path in ['health', 'download']:
        return "Not Found", 404
    
    full_path = os.path.join(app.static_folder, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(app.static_folder, path)

    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
        
    return "Not Found", 404

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "yt-dlp-downloader"})

@app.route('/download', methods=['GET'])
def download():
    url = request.args.get('url')
    type_ = request.args.get('type', 'video')
    
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    try:
        # Configuration for yt-dlp
        # We use the 'android' client to bypass "Sign in to confirm you're not a bot" errors
        # which are common on data center IPs (like Render).
        ydl_opts = {
            'quiet': True,
            'noplaylist': True,
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'web']
                }
            },
            'format': 'best[ext=mp4]/best' if type_ == 'video' else 'bestaudio[ext=m4a]/bestaudio/best',
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        }

        with YoutubeDL(ydl_opts) as ydl:
            # extract_info(download=False) fetches metadata including the direct stream URL
            info = ydl.extract_info(url, download=False)
            
            download_url = info.get('url')
            if not download_url:
                return jsonify({"error": "Could not retrieve direct download link"}), 404

            title = info.get('title', 'video')
            ext = info.get('ext', 'mp4')
            
            # Sanitize filename
            safe_title = re.sub(r'[\\/*?:"<>|]', "", title)
            filename = f"{safe_title}.{ext}"

            # Prepare content type
            content_type = 'video/mp4' if type_ == 'video' else f'audio/{ext}'

            # Get headers from info or default
            req_headers = info.get('http_headers') or ydl_opts['http_headers']

            # Generator to stream the content from YouTube to the client
            def generate():
                try:
                    with requests.get(download_url, stream=True, headers=req_headers) as external_req:
                        external_req.raise_for_status()
                        for chunk in external_req.iter_content(chunk_size=16384):
                            if chunk:
                                yield chunk
                except Exception as stream_err:
                    print(f"Stream Error: {stream_err}")

            resp_headers = {
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Type': content_type
            }

            return Response(stream_with_context(generate()), headers=resp_headers)

    except Exception as e:
        error_msg = str(e)
        print(f"Error: {error_msg}")
        
        # Friendly error mapping
        if "Sign in" in error_msg:
            return jsonify({"error": "YouTube blocked the server request. Please try the 'Cobalt' mirrors automatically provided by the UI."}), 403
            
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
