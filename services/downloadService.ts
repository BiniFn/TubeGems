interface CobaltResponse {
  status: string;
  url?: string;
  text?: string;
  picker?: any[];
}

// Extensive list of public Cobalt instances to ensure high availability
const COBALT_INSTANCES = [
  'https://api.cobalt.tools/api/json',        // Official
  'https://co.wuk.sh/api/json',               // Reliable
  'https://api.wuk.sh/api/json',              // Reliable
  'https://cobalt.kwiatekmiki.pl/api/json',
  'https://cobalt.steamodded.com/api/json',
  'https://dl.khub.ky/api/json',
  'https://api.succoon.com/api/json',
  'https://cobalt.rayrad.net/api/json',
  'https://cobalt.slpy.one/api/json',
  'https://cobalt.soapless.dev/api/json'
];

export const processDownload = async (
  url: string, 
  type: 'video' | 'audio', 
  quality: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  
  // ---------------------------------------------------------
  // 1. PRIORITY: Try Own Backend (Flask)
  // This works if deployed as a full-stack app or running locally
  // ---------------------------------------------------------
  try {
    // Attempt to hit the health endpoint on the same origin
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000); 
    
    // In dev, Vite is on 5173, Backend on 5000. In Prod, same origin.
    // We try relative first (Prod), then localhost:5000 (Dev fallback)
    let apiUrl = '';
    
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
        // Try direct localhost first
        apiUrl = 'http://localhost:5000';
    }

    const endpoint = apiUrl ? `${apiUrl}/health` : '/health';

    const health = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(id);

    if (health.ok) {
      console.log('Using Python Backend');
      const prefix = apiUrl || '';
      const downloadUrl = `${prefix}/download?url=${encodeURIComponent(url)}&type=${type}&quality=${quality}`;
      return { success: true, url: downloadUrl };
    }
  } catch (_e) {
    // Backend not available, fall through to Cobalt
  }

  // ---------------------------------------------------------
  // 2. FALLBACK/PRIMARY: Use Cobalt API Mirrors
  // This is what makes the "Published Website" work without a backend
  // ---------------------------------------------------------
  
  // Map quality labels to Cobalt expectations
  const vQuality = quality === '1080p' ? '1080' : quality === '720p' ? '720' : '480';
  
  const body = {
    url,
    vQuality,
    isAudioOnly: type === 'audio',
    aFormat: type === 'audio' ? 'mp3' : undefined,
    filenamePattern: 'classic'
  };

  // Shuffle instances slightly to distribute load (simple randomization)
  const reliable = COBALT_INSTANCES.slice(0, 3);
  const others = COBALT_INSTANCES.slice(3).sort(() => Math.random() - 0.5);
  const instancesToTry = [...reliable, ...others];

  // Try each instance until one works
  for (const api of instancesToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

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

      if (!response.ok) {
        continue;
      }

      const data: CobaltResponse = await response.json();

      // Handle successful stream/redirect
      if (data.status === 'stream' || data.status === 'redirect') {
        return { success: true, url: data.url };
      }
      
      // Handle picker response (multiple options)
      if (data.status === 'picker' && data.picker && data.picker.length > 0) {
        return { success: true, url: data.picker[0].url };
      }

      // Handle API-specific errors
      if (data.status === 'error') {
        if (data.text && (data.text.includes('limit') || data.text.includes('found'))) {
           console.warn(`API Error from ${api}:`, data.text);
        }
        continue;
      }

    } catch (error) {
      console.warn(`Connection failed to ${api}`, error);
      continue;
    }
  }

  return { success: false, error: 'Servers are busy. Please try again or check the URL.' };
};

export const downloadBlob = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};