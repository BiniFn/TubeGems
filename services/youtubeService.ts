import { VideoMetadata } from '../types';
import { NOEMBED_URL } from '../constants';

export const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle various YouTube URL formats including Shorts, Mobile, Standard, Embeds
  const patterns = [
    /(?:v=|\/)([0-9A-Za-z_-]{11}).*/,
    /(?:youtu\.be\/)([0-9A-Za-z_-]{11})/,
    /(?:embed\/)([0-9A-Za-z_-]{11})/,
    /(?:shorts\/)([0-9A-Za-z_-]{11})/,
    /^([0-9A-Za-z_-]{11})$/ // Direct ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

// Helper to clean HTML entities
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const fetchVideoMetadata = async (url: string): Promise<VideoMetadata> => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    // 1. Basic Metadata from NoEmbed
    const response = await fetch(`${NOEMBED_URL}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch video metadata');
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // 2. "Hack": Fetch description via a public CORS proxy to make AI smarter
    // This allows us to get the description client-side for GitHub/Cloudflare Pages
    let description = "";
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const pageRes = await fetch(proxyUrl);
      const pageData = await pageRes.json();
      
      if (pageData.contents) {
        // Simple regex to find the description meta tag
        const match = pageData.contents.match(/<meta name="description" content="([^"]*)"/);
        if (match && match[1]) {
          description = decodeHtml(match[1]);
        }
      }
    } catch (e) {
      console.warn("Could not fetch full description, falling back to title context only.");
    }

    return { 
      ...data, 
      url,
      description: description || `Video by ${data.author_name}` // Fallback
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw new Error('Could not find video. Please check the URL.');
  }
};