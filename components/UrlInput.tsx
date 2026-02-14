import React, { useState, useRef } from 'react';
import { Search, Link as LinkIcon, Loader2, ClipboardPaste, X } from 'lucide-react';

interface UrlInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSearch, isLoading }) => {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  const handlePaste = async () => {
    // Check if Clipboard API is supported
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
    } catch (err) {
      // Fallback for browsers that block clipboard access (e.g. non-HTTPS, Firefox default settings)
      // Just focus the input so the user can Ctrl+V immediately
      console.warn('Clipboard access denied or failed, focusing input for manual paste.');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-4 relative z-20">
      <div className="absolute inset-0 bg-red-600/10 blur-[100px] rounded-full opacity-50 pointer-events-none transform -translate-y-1/2"></div>
      
      <div className="relative text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-medium mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          System Online
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">
          Download <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient">
            YouTube Content
          </span>
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed font-light">
          Get AI summaries, insights, and high-speed downloads in one click.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-[#0a0a0c] rounded-2xl p-2 shadow-2xl border border-white/10 focus-within:border-white/20 transition-colors">
          <div className="pl-4 text-gray-500 hidden sm:block">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 px-4 py-4 text-lg font-medium outline-none"
            placeholder="Paste YouTube Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          
          {url && (
            <button
              type="button"
              onClick={() => {
                setUrl('');
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-600 hover:text-white transition-colors mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="mr-2 p-2 text-gray-600 hover:text-white transition-colors"
              title="Paste from Clipboard"
            >
              <ClipboardPaste className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !url}
            className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
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
      </form>
    </div>
  );
};