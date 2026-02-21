import React, { Suspense, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoPreview } from './components/VideoPreview';
import { DownloadSection } from './components/DownloadSection';
import { FeatureHighlights } from './components/FeatureHighlights';
import { fetchVideoMetadata } from './services/youtubeService';
import { VideoMetadata, AiAnalysisResult } from './types';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const LazyAiInsights = React.lazy(() => import('./components/AiInsights').then((module) => ({ default: module.AiInsights })));

type ThemeMode = 'obsidian' | 'nebula';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('obsidian');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('tubegems-theme') as ThemeMode | null;
    if (savedTheme === 'obsidian' || savedTheme === 'nebula') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('tubegems-theme', theme);
  }, [theme]);

  const runAiAnalysis = async (metadata: VideoMetadata) => {
    setIsAiLoading(true);
    try {
      const { analyzeVideoContext } = await import('./services/geminiService');
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

  const themeClasses =
    theme === 'obsidian'
      ? 'bg-[#0f0f12] bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_35%)]'
      : 'bg-[#0b1020] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_40%)]';

  return (
    <div className={`min-h-screen ${themeClasses} text-white selection:bg-red-500/30 selection:text-red-200`}>
      <Header onReset={handleReset} theme={theme} onToggleTheme={() => setTheme((prev) => (prev === 'obsidian' ? 'nebula' : 'obsidian'))} />

      <main className="pb-12 md:pb-20 px-2 sm:px-0">
        {!videoData && (
          <>
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <UrlInput key={key} onSearch={handleSearch} isLoading={isLoading} isAiEnabled={isAiEnabled} onToggleAi={handleToggleAi} />
            </div>
            <FeatureHighlights />
          </>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-6 md:mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-bottom-4 shadow-lg shadow-red-950/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {videoData && (
          <div className="max-w-6xl mx-auto mt-6 md:mt-8 px-3 md:px-6 lg:px-8 space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/20 border border-white/5 rounded-2xl p-3 md:p-4">
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
                  <Suspense
                    fallback={
                      <div className="h-full min-h-[260px] rounded-3xl border border-white/10 bg-gray-900/40 flex items-center justify-center text-gray-300 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading AI module…</span>
                      </div>
                    }
                  >
                    <LazyAiInsights
                      analysis={aiAnalysis ?? { summary: '', topics: [], suggestedQuestions: [] }}
                      isLoading={isAiLoading || !aiAnalysis}
                    />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 md:py-8 text-center text-gray-500 text-xs md:text-sm border-t border-white/5 mt-auto bg-black/25 px-4 backdrop-blur-sm">
        <p>© 2026 TubeGems By BiniFn</p>
      </footer>
    </div>
  );
};

export default App;
