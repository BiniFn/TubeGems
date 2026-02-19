from flask import Flask, request, Response, stream_with_context, jsonify
from flask_cors import CORS
try:
    from pytube import YouTube
except Exception:
    YouTube = None
import requests
import re
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for the frontend to detect this server."""
    return jsonify({"status": "ok", "service": "pytube-downloader"})

@app.route('/download', methods=['GET'])
def download():
    url = request.args.get('url')
    type_ = request.args.get('type', 'video')
    quality = request.args.get('quality', '1080p')
    
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    if YouTube is None:
        return jsonify({"error": "pytube is not installed on server."}), 503

    try:
        # Use pytube as fallback stream extractor
        yt = YouTube(url)
        
        # Select the best stream based on type
        if type_ == 'audio':
            # Get audio only
            stream = yt.streams.filter(only_audio=True).order_by('abr').desc().first()
            filename = f"{yt.title}.mp3"
            content_type = 'audio/mpeg'
        else:
            # Respect requested quality where possible; fallback to best progressive mp4
            target = quality.replace('p', '') if quality else None
            stream = None
            if target:
                stream = yt.streams.filter(progressive=True, file_extension='mp4', res=f"{target}p").first()
            if not stream:
                stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
            filename = f"{yt.title}.mp4"
            content_type = 'video/mp4'

        if not stream:
            return jsonify({"error": "No suitable stream found"}), 404

        # Sanitize filename
        filename = re.sub(r'[\\/*?:"<>|]', "", filename)
        # Ensure extension exists
        if not filename.endswith(('.mp4', '.mp3')):
             ext = 'mp3' if type_ == 'audio' else 'mp4'
             filename = f"{filename}.{ext}"

        # Stream the data from YouTube's URL to the client
        # This acts as a proxy to avoid CORS issues in the browser
        def generate():
            external_req = requests.get(stream.url, stream=True, timeout=30)
            for chunk in external_req.iter_content(chunk_size=4096):
                yield chunk

        # Set headers to force download in browser
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Type': content_type
        }

        return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use PORT environment variable provided by Render, default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Host must be 0.0.0.0 to be accessible externally
    print(f"Starting Pytube Server on port {port}...")
    app.run(host='0.0.0.0', port=port)
