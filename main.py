from flask import Flask, request, Response, stream_with_context, jsonify, send_from_directory
from flask_cors import CORS
from yt_dlp import YoutubeDL
import requests
import re
import os
import subprocess
import random

# Determine absolute path to dist folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')


def ensure_frontend_build():
    """Build the frontend if dist/index.html is missing."""
    index_path = os.path.join(DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return

    print("dist/index.html not found. Attempting to build frontend...")
    try:
        subprocess.run(["npm", "run", "build"], cwd=BASE_DIR, check=True)
    except Exception as build_err:
        print(f"Frontend build failed: {build_err}")


ensure_frontend_build()

COBALT_INSTANCES = [
    'https://cobalt.steamodded.com/api/json',
    'https://dl.khub.ky/api/json',
    'https://api.succoon.com/api/json',
    'https://cobalt.rayrad.net/api/json',
    'https://cobalt.slpy.one/api/json',
    'https://cobalt.soapless.dev/api/json',
    'https://api.wuk.sh/api/json',
    'https://co.wuk.sh/api/json',
    'https://api.cobalt.tools/api/json',
]

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
    if path.startswith('api') or path in ['health', 'download', 'fallback-download']:
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


def resolve_with_cobalt(url, type_, quality):
    v_quality = '1080' if quality == '1080p' else '720' if quality == '720p' else '480'
    payload = {
        'url': url,
        'vQuality': v_quality,
        'isAudioOnly': type_ == 'audio',
        'aFormat': 'mp3' if type_ == 'audio' else None,
        'filenamePattern': 'basic',
    }

    mirrors = COBALT_INSTANCES.copy()
    random.shuffle(mirrors)

    for api in mirrors:
        try:
            response = requests.post(
                api,
                json=payload,
                headers={'Accept': 'application/json', 'Content-Type': 'application/json'},
                timeout=8,
            )
            if not response.ok:
                continue

            data = response.json()
            status = data.get('status')
            if status in ('stream', 'redirect') and data.get('url'):
                return data.get('url')

            picker = data.get('picker') or []
            if status == 'picker' and len(picker) > 0 and picker[0].get('url'):
                return picker[0].get('url')
        except Exception:
            continue

    return None


@app.route('/fallback-download', methods=['GET'])
def fallback_download():
    url = request.args.get('url')
    type_ = request.args.get('type', 'video')
    quality = request.args.get('quality', '1080p')

    if not url:
        return jsonify({"ok": False, "error": "Missing URL"}), 400

    candidate = resolve_with_cobalt(url, type_, quality)
    if candidate:
        return jsonify({"ok": True, "url": candidate})

    return jsonify({"ok": False, "error": "All download servers are busy. Please try another video or check back later."}), 503

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name)

def stream_proxy(url, headers=None):
    try:
        with requests.get(url, stream=True, headers=headers) as external_req:
            external_req.raise_for_status()
            for chunk in external_req.iter_content(chunk_size=16384):
                if chunk:
                    yield chunk
    except Exception as stream_err:
        print(f"Stream Error: {stream_err}")

@app.route('/download', methods=['GET'])
def download():
    url = request.args.get('url')
    type_ = request.args.get('type', 'video')
    quality = request.args.get('quality', '1080p')
    probe = request.args.get('probe') == '1'
    
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    # Use yt-dlp metadata extraction from the official project:
    # https://github.com/yt-dlp/yt-dlp
    try:
        print(f"Attempting yt-dlp for {url}")
        quality_map = {'1080p': '1080', '720p': '720', '480p': '480'}
        max_height = quality_map.get(quality, '1080')

        ydl_opts = {
            'quiet': True,
            'noplaylist': True,
            'format': (
                f"best[ext=mp4][height<={max_height}]/best[height<={max_height}]"
                if type_ == 'video'
                else 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio'
            ),
        }

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            download_url = info.get('url')
            
            if download_url:
                title = info.get('title', 'video')
                ext = info.get('ext', 'mp4' if type_ == 'video' else 'm4a')
                filename_ext = 'mp4' if type_ == 'video' else ext
                filename = f"{sanitize_filename(title)}.{filename_ext}"

                if probe:
                    return jsonify({
                        "ok": True,
                        "filename": filename,
                        "ext": filename_ext,
                    })

                if type_ == 'video':
                    content_type = 'video/mp4'
                else:
                    content_type = 'audio/webm' if ext == 'webm' else 'audio/mp4'
                req_headers = info.get('http_headers', {})

                resp_headers = {
                    'Content-Disposition': f'attachment; filename="{filename}"',
                    'Content-Type': content_type
                }
                return Response(stream_with_context(stream_proxy(download_url, req_headers)), headers=resp_headers)
            
            return jsonify({"error": "yt-dlp did not return a downloadable media URL."}), 502
    
    except Exception as e:
        print(f"yt-dlp failed: {e}")
        error_msg = str(e)
        if "Sign in" in error_msg or "403" in error_msg:
            return jsonify({
                "error": "Server is currently blocked by YouTube. Please use the 'Cobalt' option or try again later."
            }), 403

        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
