from flask import Flask, request, Response, stream_with_context, jsonify, send_from_directory
from flask_cors import CORS
from pytubefix import YouTube
import requests
import re
import os

# Initialize Flask App serving the 'dist' folder built by Vite
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

@app.route('/')
def serve_index():
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return "App is building... please wait or run 'npm run build'", 200

@app.route('/assets/<path:path>')
def serve_assets(path):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), path)

@app.route('/<path:path>')
def catch_all(path):
    # Support client-side routing
    if path.startswith('api') or path in ['health', 'download']:
        return "Not Found", 404
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return "Not Found", 404

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "pytube-downloader"})

@app.route('/download', methods=['GET'])
def download():
    url = request.args.get('url')
    type_ = request.args.get('type', 'video')
    
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    try:
        # Use pytubefix for better reliability
        yt = YouTube(url)
        
        if type_ == 'audio':
            stream = yt.streams.filter(only_audio=True).order_by('abr').desc().first()
            ext = 'mp3'
            content_type = 'audio/mpeg'
        else:
            stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
            ext = 'mp4'
            content_type = 'video/mp4'

        if not stream:
            return jsonify({"error": "No suitable stream found"}), 404

        # Clean filename
        safe_title = re.sub(r'[\\/*?:"<>|]', "", yt.title)
        filename = f"{safe_title}.{ext}"

        # Stream generator
        def generate():
            external_req = requests.get(stream.url, stream=True)
            for chunk in external_req.iter_content(chunk_size=4096):
                yield chunk

        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Type': content_type
        }

        return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Server on port {port}...")
    app.run(host='0.0.0.0', port=port)
