import React, { useState } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoPreview } from './components/VideoPreview';
import { AiInsights } from './components/AiInsights';
import { DownloadSection } from './components/DownloadSection';
import { fetchVideoMetadata } from './services/youtubeService';
import { analyzeVideoContext } from './services/geminiService';
import { VideoMetadata, AiAnalysisResult } from './types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Force remount of UrlInput to clear text on reset if needed
  const [key, setKey] = useState(0); 

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);
    setAiAnalysis(null);

    try {
      // 1. Fetch Metadata (including description via proxy)
      const metadata = await fetchVideoMetadata(url);
      setVideoData(metadata);

      // 2. Fetch AI Analysis with the new rich context
      const analysis = await analyzeVideoContext(
        metadata.title, 
        metadata.author_name,
        metadata.description
      );
      setAiAnalysis(analysis);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVideoData(null);
    setAiAnalysis(null);
    setError(null);
    setKey(prev => prev + 1); // Reset UrlInput state
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-red-500/30 selection:text-red-200">
      <Header onReset={handleReset} />
      
      <main className="pb-20">
        {!videoData && (
           <div className="animate-in fade-in slide-in-from-top-4 duration-500">
             <UrlInput key={key} onSearch={handleSearch} isLoading={isLoading} />
           </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {videoData && (
          <div className="max-w-6xl mx-auto mt-8 px-4 md:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <button 
              onClick={handleReset}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300 border border-white/5 hover:border-white/10"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Search Another Video
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Preview & Download */}
              <div className="lg:col-span-1 space-y-8">
                <VideoPreview metadata={videoData} />
                <DownloadSection metadata={videoData} />
              </div>

              {/* Right Column: AI Analysis */}
              <div className="lg:col-span-2">
                 {aiAnalysis ? (
                   <AiInsights analysis={aiAnalysis} isLoading={false} />
                 ) : (
                   <AiInsights 
                     analysis={{ summary: '', topics: [], suggestedQuestions: [] }} 
                     isLoading={true} 
                   />
                 )}
              </div>
            </div>

          </div>
        )}
      </main>
      
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 mt-auto bg-[#0a0a0c]">
        <p>© 2026 TubeGems By BiniFn</p>
      </footer>
    </div>
  );
};

export default App;