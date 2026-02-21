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
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const runAiAnalysis = async (metadata: VideoMetadata) => {
    setIsAiLoading(true);
    try {
      const analysis = await analyzeVideoContext(
        metadata.title,
        metadata.author_name,
        metadata.description
      );
      setAiAnalysis(analysis);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);
    setAiAnalysis(null);

    try {
      const metadata = await fetchVideoMetadata(url);
      setVideoData(metadata);

      if (isAiEnabled) {
        await runAiAnalysis(metadata);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAi = async () => {
    setError(null);
    setIsAiEnabled((prev) => !prev);

    if (!isAiEnabled && videoData && !aiAnalysis) {
      await runAiAnalysis(videoData);
    }
  };

  const handleReset = () => {
    setVideoData(null);
    setAiAnalysis(null);
    setError(null);
    setIsAiLoading(false);
    setKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-red-500/30 selection:text-red-200">
      <Header onReset={handleReset} />

      <main className="pb-12 md:pb-20 px-2 sm:px-0">
        {!videoData && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <UrlInput key={key} onSearch={handleSearch} isLoading={isLoading} isAiEnabled={isAiEnabled} onToggleAi={handleToggleAi} />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-6 md:mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {videoData && (
          <div className="max-w-6xl mx-auto mt-6 md:mt-8 px-3 md:px-8 space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/10"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Search Another Video
              </button>

              <button
                onClick={handleToggleAi}
                disabled={isAiLoading}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                  isAiEnabled
                    ? 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                } ${isAiLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isAiLoading ? 'Loading AI…' : `AI Summary: ${isAiEnabled ? 'On' : 'Off'}`}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              <div className={`${isAiEnabled ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4 md:space-y-6`}>
                <VideoPreview metadata={videoData} />
                <DownloadSection metadata={videoData} />
              </div>

              {isAiEnabled && (
                <div className="lg:col-span-2">
                  <AiInsights
                    analysis={aiAnalysis ?? { summary: '', topics: [], suggestedQuestions: [] }}
                    isLoading={isAiLoading || !aiAnalysis}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 md:py-8 text-center text-gray-600 text-xs md:text-sm border-t border-white/5 mt-auto bg-[#0a0a0c] px-4">
        <p>© 2026 TubeGems By BiniFn</p>
      </footer>
    </div>
  );
};

export default App;
