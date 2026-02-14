import React, { useState } from 'react';
import { VideoMetadata } from '../types';
import { Download, FileVideo, Music, Image as ImageIcon, Check, Loader2, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
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
      { label: 'MP3', ext: 'mp3', sub: 'Highest Quality', icon: Music, quality: 'best' },
    ],
    thumbnail: [
      { label: 'Max Res', ext: 'jpg', sub: '1920x1080', icon: ImageIcon, url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
      { label: 'High Quality', ext: 'jpg', sub: '480x360', icon: ImageIcon, url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
    ]
  };

  const handleDownload = async (item: any) => {
    setProcessing(item.label);
    setError(null);
    
    try {
      // 1. Handle Thumbnail Downloads
      if (activeTab === 'thumbnail' && item.url) {
        try {
          const response = await fetch(item.url);
          if (!response.ok) throw new Error('Thumbnail not found');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          downloadBlob(url, `${metadata.title.substring(0, 30).trim()}_${item.label}.jpg`);
          window.URL.revokeObjectURL(url);
        } catch (_e) {
          window.open(item.url, '_blank');
        }
        setProcessing(null);
        return;
      }

      // 2. Handle Video/Audio
      const result = await processDownload(metadata.url, activeTab as 'video' | 'audio', item.quality);
      
      if (result.success && result.url) {
        // Direct safe link
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
      setError('Connection failed. Please check your internet.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-gray-900/60 rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-md flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-red-500" />
            Download
          </h3>
          <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
            Safe & Secure
          </span>
        </div>
        
        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
          {(['video', 'audio', 'thumbnail'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 capitalize flex items-center justify-center gap-2 ${
                activeTab === tab 
                  ? 'bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25' 
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

      {/* List */}
      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar relative">
        {error && (
            <div className="mx-4 mt-2 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  activeTab === 'audio' ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20' : 
                  activeTab === 'thumbnail' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 
                  'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">{item.label}</span>
                  </div>
                  <div className="text-sm text-gray-500">{item.sub}</div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(item)}
                disabled={!!processing}
                className={`
                  relative px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 min-w-[120px] justify-center overflow-hidden shadow-lg
                  ${processing === item.label 
                    ? 'bg-white/5 text-gray-400 cursor-wait' 
                    : 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95'
                  }
                `}
              >
                {processing === item.label ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Get</span>
                    <Download className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center">
         <div className="flex gap-2 items-center opacity-40 hover:opacity-100 transition-opacity">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-400">Scanned & Safe</span>
         </div>
      </div>
    </div>
  );
};