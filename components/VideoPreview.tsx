import React, { useMemo, useState } from 'react';
import { VideoMetadata } from '../types';
import { Play, Clock, User } from 'lucide-react';
import { extractVideoId } from '../services/youtubeService';

interface VideoPreviewProps {
  metadata: VideoMetadata;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ metadata }) => {
  const videoId = useMemo(() => extractVideoId(metadata.url), [metadata.url]);
  const fallbackThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : metadata.thumbnail_url;
  const [thumbnailSrc, setThumbnailSrc] = useState(metadata.thumbnail_url);

  return (
    <div className="bg-gray-800/50 rounded-3xl overflow-hidden border border-white/10 shadow-xl backdrop-blur-sm">
      <a href={metadata.url} target="_blank" rel="noreferrer" className="relative aspect-video group cursor-pointer overflow-hidden block">
        <img
          src={thumbnailSrc}
          alt={metadata.title}
          loading="lazy"
          onError={() => {
            if (thumbnailSrc !== fallbackThumbnail) {
              setThumbnailSrc(fallbackThumbnail);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
            <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1 fill-white" />
          </div>
        </div>
      </a>

      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight">{metadata.title}</h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-400 text-sm">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 w-fit max-w-full">
            <User className="w-4 h-4 shrink-0" />
            <span className="font-medium text-gray-200 truncate">{metadata.author_name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>~10:05</span>
          </div>
        </div>
      </div>
    </div>
  );
};
