import React, { useState } from 'react';
import { VideoMetadata } from '../types';
import { Download, FileVideo, Music, Image as ImageIcon, Check, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { extractVideoId } from '../services/youtubeService';
import { processDownload, downloadBlob } from '../services/downloadService';

interface DownloadSectionProps {
  metadata: VideoMetadata;
}

type TabType = 'video' | 'audio' | 'thumbnail';

export const DownloadSection: React.FC<DownloadSectionProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoId = extractVideoId(metadata.url);

  const downloadFormats = {
    video: [
      { label: '1080p', ext: 'mp4', sub: 'High Definition', icon: FileVideo, quality: '1080p' },
      { label: '720p', ext: 'mp4', sub: 'HD Ready', icon: FileVideo, quality: '720p' },
      { label: '480p', ext: 'mp4', sub: 'Standard', icon: FileVideo, quality: '480p' },
    ],
    audio: [
      { label: 'MP3', ext: 'mp3', sub: 'Universal Audio', icon: Music, quality: 'best' },
    ],
    thumbnail: [
      { label: 'Max Res', ext: 'jpg', sub: '1920x1080 (If available)', icon: ImageIcon, url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
      { label: 'High Quality', ext: 'jpg', sub: '480x360', icon: ImageIcon, url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
      { label: 'Standard', ext: 'jpg', sub: '320x180', icon: ImageIcon, url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
    ]
  };

  const handleDownload = async (item: any) => {
    setProcessing(item.label);
    setError(null);
    
    try {
      // 1. Handle Thumbnail Downloads (Client-side fetch)
      if (activeTab === 'thumbnail' && item.url) {
        try {
          const response = await fetch(item.url);
          if (!response.ok) throw new Error('Thumbnail not found');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          downloadBlob(url, `${metadata.title.substring(0, 30).trim()}_${item.label}.jpg`);
          window.URL.revokeObjectURL(url);
        } catch (_e) {
          // Fallback to opening in new tab if fetch fails (CORS or 404)
          window.open(item.url, '_blank');
        }
        setProcessing(null);
        return;
      }

      // 2. Handle Video/Audio Downloads (Via Service)
      const result = await processDownload(metadata.url, activeTab as 'video' | 'audio', item.quality);
      
      if (result.success && result.url) {
        // Use a new tab approach for safer downloads in published environments
        const link = document.createElement('a');
        link.href = result.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(result.error || 'Failed to generate link');
      }

    } catch (_err) {
      setError('An unexpected error occurred');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-sm flex flex-col h-full min-h-[400px]">
      {/* Tab Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <h3 className="text-xl font-bold text-white">Download Options</h3>
        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
          {(['video', 'audio', 'thumbnail'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 capitalize flex items-center justify-center gap-2 ${
                activeTab === tab 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'video' && <FileVideo className="w-4 h-4" />}
              {tab === 'audio' && <Music className="w-4 h-4" />}
              {tab === 'thumbnail' && <ImageIcon className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar relative">
        {error && (
            <div className="mx-4 mt-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
        )}

        <div className="space-y-1">
          {downloadFormats[activeTab].map((item, index) => (
            <div 
              key={index}
              className="group flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all duration-200 border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  activeTab === 'audio' ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20' : 
                  activeTab === 'thumbnail' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 
                  'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono uppercase border border-white/5">
                      {item.ext}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{item.sub}</div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(item)}
                disabled={!!processing}
                className={`
                  relative px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300 min-w-[130px] justify-center overflow-hidden
                  ${processing === item.label 
                    ? 'bg-white/5 text-gray-400 cursor-wait border border-white/5' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95'
                  }
                `}
              >
                {processing === item.label ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Disclaimer */}
      <div className="p-4 bg-black/20 border-t border-white/5">
         <div className="flex gap-3 items-start opacity-60">
            <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Downloads powered by secure public media APIs.
            </p>
         </div>
      </div>
    </div>
  );
};