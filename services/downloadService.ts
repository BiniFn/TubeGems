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

let cachedBackendState: { available: boolean; checkedAt: number } | null = null;
const BACKEND_CACHE_TTL_MS = 30_000;

const isBackendAvailable = async (apiUrl: string): Promise<boolean> => {
  const now = Date.now();
  if (cachedBackendState && now - cachedBackendState.checkedAt < BACKEND_CACHE_TTL_MS) {
    return cachedBackendState.available;
  }

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const health = await fetch(`${apiUrl}/health`, { signal: controller.signal });
    clearTimeout(id);

    const available = health.ok;
    cachedBackendState = { available, checkedAt: now };
    return available;
  } catch (_err) {
    cachedBackendState = { available: false, checkedAt: now };
    return false;
  }
};

const fetchFromCobalt = async (api: string, body: Record<string, unknown>): Promise<string | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
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

    if (!response.ok) return null;

    const data: CobaltResponse = await response.json();
    if ((data.status === 'stream' || data.status === 'redirect') && data.url) {
      return data.url;
    }

    if (data.status === 'picker' && data.picker && data.picker.length > 0) {
      return data.picker[0].url;
    }

    return null;
  } catch (_err) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const processDownload = async (
  url: string, 
  type: 'video' | 'audio', 
  quality: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiUrl = isDev ? 'http://localhost:5000' : '';

  // 1. PRIORITY: Local backend when available (most stable + avoids temporary third-party links)
  const backendAvailable = await isBackendAvailable(apiUrl);
  if (backendAvailable) {
    const downloadUrl = `${apiUrl}/download?url=${encodeURIComponent(url)}&type=${type}&quality=${quality}`;
    return { success: true, url: downloadUrl };
  }

  console.warn('Backend not reachable, trying public mirrors...');
  
  // 2. FALLBACK: Cobalt API Mirrors (Client-Side)
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

  // 2a. Try 3 mirrors in parallel first to reduce waiting/lag.
  const firstWave = shuffled.slice(0, 3);
  const winner = await Promise.any(
    firstWave.map(async (api) => {
      const candidate = await fetchFromCobalt(api, body);
      if (!candidate) throw new Error('No media URL');
      return candidate;
    })
  ).catch(() => null);

  if (winner) {
    return { success: true, url: winner };
  }

  // 2b. Fallback through remaining mirrors.
  for (const api of shuffled.slice(3, 6)) {
    const candidate = await fetchFromCobalt(api, body);
    if (candidate) {
      return { success: true, url: candidate };
    }
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
