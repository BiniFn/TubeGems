from flask import Flask, request, Response, stream_with_context, jsonify, send_from_directory
from flask_cors import CORS
from yt_dlp import YoutubeDL
import requests
import re
import os
import subprocess

# Determine absolute path to dist folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')

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


def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name)


def stream_proxy(url, headers=None):
    request_headers = headers or {}
    try:
        with requests.get(url, stream=True, headers=request_headers, timeout=30) as external_req:
            external_req.raise_for_status()
            for chunk in external_req.iter_content(chunk_size=16384):
                if chunk:
                    yield chunk
    except Exception as stream_err:
        print(f"Stream Error: {stream_err}")


def resolve_with_yt_dlp(url, type_, quality):
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
        if not download_url:
            return None

        title = info.get('title', 'video')
        ext = info.get('ext', 'mp4' if type_ == 'video' else 'm4a')
        filename_ext = 'mp4' if type_ == 'video' else ext
        filename = f"{sanitize_filename(title)}.{filename_ext}"
        content_type = 'video/mp4' if type_ == 'video' else ('audio/webm' if ext == 'webm' else 'audio/mp4')

        return {
            'download_url': download_url,
            'filename': filename,
            'ext': filename_ext,
            'content_type': content_type,
            'headers': info.get('http_headers', {}),
            'source': 'yt-dlp',
        }


def resolve_with_cobalt(url, type_, quality):
    v_quality = '1080' if quality == '1080p' else ('720' if quality == '720p' else '480')
    body = {
        'url': url,
        'vQuality': v_quality,
        'isAudioOnly': type_ == 'audio',
        'aFormat': 'mp3' if type_ == 'audio' else None,
        'filenamePattern': 'basic',
    }

    for api in COBALT_INSTANCES[:6]:
        try:
            resp = requests.post(
                api,
                json=body,
                headers={'Accept': 'application/json', 'Content-Type': 'application/json'},
                timeout=12,
            )
            if not resp.ok:
                continue

            data = resp.json()
            media_url = None
            if data.get('status') in ('stream', 'redirect') and data.get('url'):
                media_url = data['url']
            elif data.get('status') == 'picker' and data.get('picker'):
                media_url = data['picker'][0].get('url')

            if media_url:
                filename = f"download.{'mp3' if type_ == 'audio' else 'mp4'}"
                content_type = 'audio/mpeg' if type_ == 'audio' else 'video/mp4'
                return {
                    'download_url': media_url,
                    'filename': filename,
                    'ext': 'mp3' if type_ == 'audio' else 'mp4',
                    'content_type': content_type,
                    'headers': {},
                    'source': 'cobalt',
                }
        except Exception as cobalt_err:
            print(f"Cobalt mirror failed ({api}): {cobalt_err}")

    return None


def resolve_download_source(url, type_, quality):
    try:
        print(f"Attempting yt-dlp for {url}")
        result = resolve_with_yt_dlp(url, type_, quality)
        if result:
            return result
    except Exception as yt_err:
        print(f"yt-dlp failed: {yt_err}")

    print("Falling back to Cobalt mirrors from backend")
    return resolve_with_cobalt(url, type_, quality)


@app.route('/download', methods=['GET'])
def download():
    url = request.args.get('url')
    type_ = request.args.get('type', 'video')
    quality = request.args.get('quality', '1080p')
    probe = request.args.get('probe') == '1'

    if not url:
        return jsonify({"error": "Missing URL"}), 400

    result = resolve_download_source(url, type_, quality)
    if not result:
        return jsonify({"error": "Unable to resolve media URL via yt-dlp or Cobalt mirrors."}), 502

    if probe:
        return jsonify({
            'ok': True,
            'filename': result['filename'],
            'ext': result['ext'],
            'source': result['source'],
        })

    resp_headers = {
        'Content-Disposition': f'attachment; filename="{result["filename"]}"',
        'Content-Type': result['content_type'],
    }
    return Response(
        stream_with_context(stream_proxy(result['download_url'], result.get('headers'))),
        headers=resp_headers,
    )


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
