interface CobaltResponse {
  status: string;
  url?: string;
  text?: string;
  picker?: any[];
}

// Extensive list of public Cobalt instances
const COBALT_INSTANCES = [
  'https://cobalt.steamodded.com/api/json',  
  'https://dl.khub.ky/api/json',             
  'https://api.succoon.com/api/json',
  'https://cobalt.rayrad.net/api/json',
  'https://cobalt.slpy.one/api/json',
  'https://cobalt.soapless.dev/api/json',
  'https://api.wuk.sh/api/json',
  'https://co.wuk.sh/api/json',
  'https://api.cobalt.tools/api/json', 
];

export const processDownload = async (
  url: string, 
  type: 'video' | 'audio', 
  quality: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  
  // 1. PRIORITY: Cobalt API Mirrors (Client-Side)
  // Map our quality to Cobalt quality
  const vQuality = quality === '1080p' ? '1080' : quality === '720p' ? '720' : '480';
  
  const body = {
    url,
    vQuality,
    isAudioOnly: type === 'audio',
    aFormat: type === 'audio' ? 'mp3' : undefined,
    filenamePattern: 'basic', 
  };

  // Shuffle instances to load balance
  const shuffled = [...COBALT_INSTANCES].sort(() => Math.random() - 0.5);

  // Try up to 6 instances 
  for (const api of shuffled.slice(0, 6)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data: CobaltResponse = await response.json();

      if (data.status === 'stream' || data.status === 'redirect') {
        return { success: true, url: data.url };
      }
      
      if (data.status === 'picker' && data.picker && data.picker.length > 0) {
        return { success: true, url: data.picker[0].url };
      }

    } catch (error) {
      continue;
    }
  }

  // 2. FALLBACK: Python Backend (yt-dlp + pytubefix)
  try {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let apiUrl = isDev ? 'http://localhost:5000' : '';
    
    // Check health first 
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000); 
    const health = await fetch(`${apiUrl}/health`, { signal: controller.signal });
    clearTimeout(id);

    if (health.ok) {
      const downloadUrl = `${apiUrl}/download?url=${encodeURIComponent(url)}&type=${type}&quality=${quality}`;
      // Just return the URL, the browser will handle the stream download
      return { success: true, url: downloadUrl };
    }
  } catch (_e) {
    console.warn("Backend fallback failed or unreachable");
  }

  return { success: false, error: 'All download servers are busy. Please try another video or check back later.' };
};

export const downloadBlob = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};