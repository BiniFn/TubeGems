import React, { useState, useRef } from 'react';
import { Search, Link as LinkIcon, Loader2, ClipboardPaste, X, Sparkles } from 'lucide-react';

interface UrlInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
  isAiEnabled: boolean;
  onToggleAi: () => void;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSearch, isLoading, isAiEnabled, onToggleAi }) => {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  const handlePaste = async () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      inputRef.current?.focus();
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      } else {
        inputRef.current?.focus();
      }
    } catch (_err) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 md:mt-12 px-3 sm:px-4 relative z-20">
      <div className="absolute inset-0 bg-red-600/10 blur-[64px] rounded-full opacity-40 pointer-events-none transform -translate-y-1/2" />

      <div className="relative text-center mb-7 md:mb-10 space-y-3 md:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-medium mb-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          System Online
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Download
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
            YouTube Content
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light px-2">
          Fast downloads with a cleaner workflow and optional AI summaries.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group space-y-3">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-300" />

        <div className="relative bg-[#0a0a0c] rounded-2xl p-3 md:p-4 shadow-2xl border border-white/10 focus-within:border-white/20 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <div className="pl-3 text-gray-500 hidden sm:block">
              <LinkIcon className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 px-3 sm:px-4 py-3 text-base md:text-lg font-medium outline-none"
              placeholder="Paste YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <div className="flex items-center gap-1 self-end sm:self-auto">
              {url ? (
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    inputRef.current?.focus();
                  }}
                  className="p-2 text-gray-600 hover:text-white transition-colors"
                  title="Clear URL"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="p-2 text-gray-600 hover:text-white transition-colors"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-5 h-5" />
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !url}
                className="bg-white text-black px-6 md:px-7 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[124px] justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Working</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <Search className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">Tip: Use a full YouTube watch URL for best compatibility.</p>
            <button
              type="button"
              onClick={onToggleAi}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors duration-200 ${
                isAiEnabled
                  ? 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Summary {isAiEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
