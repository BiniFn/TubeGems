import React, { useState } from 'react';
import { Search, Link as LinkIcon, Loader2, ClipboardPaste } from 'lucide-react';

interface UrlInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSearch, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-4 relative">
      <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full opacity-20 pointer-events-none transform scale-75"></div>
      
      <div className="relative text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Analyze & Download <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            YouTube Content
          </span>
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Paste a link to get AI-powered insights, summaries, and high-quality download options instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group z-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative flex items-center bg-gray-900 rounded-2xl p-2 shadow-2xl border border-white/10">
          <div className="pl-4 text-gray-500 hidden sm:block">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 px-4 py-3 text-lg"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          
          {/* Paste Button for Mobile/Convenience */}
          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="mr-2 p-2 text-gray-500 hover:text-white transition-colors"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !url}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-xl font-medium hover:from-red-500 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing</span>
              </>
            ) : (
              <>
                <span>Start</span>
                <Search className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};