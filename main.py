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
    
    try:
        current_dir_files = os.listdir(BASE_DIR)
        dist_files = os.listdir(DIST_DIR) if os.path.exists(DIST_DIR) else "dist directory missing"
    except Exception as e:
        dist_files = str(e)
        
    debug_info = f"""
    <h1>Deployment Error</h1>
    <p>index.html not found in {app.static_folder}</p>
    <p>Current Directory ({BASE_DIR}): {current_dir_files}</p>
    <p>Dist Directory ({DIST_DIR}): {dist_files}</p>
    <p>Please check if 'npm run build' executed successfully.</p>
    """
    return debug_info, 503

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
        # Configuration for yt-dlp to extract direct URL without downloading
        ydl_opts = {
            'quiet': True,
            'noplaylist': True,
            # For video: try to get mp4 with audio (progressive) or best available
            # For audio: try to get m4a (aac) or best audio available
            'format': 'best[ext=mp4]/best' if type_ == 'video' else 'bestaudio[ext=m4a]/bestaudio/best',
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

            # Get headers required to access the stream (User-Agent, etc.)
            req_headers = info.get('http_headers', {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })

            # Generator to stream the content from YouTube to the client
            def generate():
                try:
                    with requests.get(download_url, stream=True, headers=req_headers) as external_req:
                        external_req.raise_for_status()
                        for chunk in external_req.iter_content(chunk_size=8192):
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
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Server on port {port}...")
    app.run(host='0.0.0.0', port=port)
