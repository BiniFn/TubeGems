from flask import Flask, request, Response, stream_with_context, jsonify
from flask_cors import CORS
from pytube import YouTube
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
    
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    try:
        yt = YouTube(url)
        
        # Select the best stream based on type
        if type_ == 'audio':
            # Get audio only
            stream = yt.streams.filter(only_audio=True).order_by('abr').desc().first()
            filename = f"{yt.title}.mp3"
        else:
            # Get progressive stream (video + audio in one file)
            # Pytube progressive streams usually top out at 720p. 
            # 1080p requires ffmpeg merging which is complex for a simple script.
            stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
            filename = f"{yt.title}.mp4"

        if not stream:
            return jsonify({"error": "No suitable stream found"}), 404

        # Sanitize filename
        filename = re.sub(r'[\\/*?:"<>|]', "", filename)

        # Stream the data from YouTube's URL to the client
        # This acts as a proxy to avoid CORS issues in the browser
        def generate():
            external_req = requests.get(stream.url, stream=True)
            for chunk in external_req.iter_content(chunk_size=4096):
                yield chunk

        # Set headers to force download in browser
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Type': 'audio/mpeg' if type_ == 'audio' else 'video/mp4'
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
