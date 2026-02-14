import React from 'react';
import { VideoMetadata } from '../types';
import { Play, Clock, User } from 'lucide-react';

interface VideoPreviewProps {
  metadata: VideoMetadata;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ metadata }) => {
  return (
    <div className="bg-gray-800/50 rounded-3xl overflow-hidden border border-white/10 shadow-xl backdrop-blur-sm">
      <div className="relative aspect-video group cursor-pointer overflow-hidden">
        <img 
          src={metadata.thumbnail_url} 
          alt={metadata.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <Play className="w-6 h-6 text-white ml-1 fill-white" />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight">
          {metadata.title}
        </h3>
        
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <User className="w-4 h-4" />
            <span className="font-medium text-gray-200">{metadata.author_name}</span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Mock data for duration since noembed doesn't provide it always */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>~10:05</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
