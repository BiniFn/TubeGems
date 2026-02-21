import React from 'react';
import { Moon, Sun, Youtube } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  theme: 'obsidian' | 'nebula';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, theme, onToggleTheme }) => {
  return (
    <header className="w-full py-4 md:py-6 px-3 md:px-8 border-b border-white/10 bg-black/35 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div
          onClick={onReset}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onReset?.();
            }
          }}
          className="flex items-center gap-2 group cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Reset and search another video"
        >
          <div className="relative">
            <Youtube className="w-7 h-7 md:w-8 md:h-8 text-red-500 fill-current group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            </div>
          </div>
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TubeGems
          </h1>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Toggle theme"
        >
          {theme === 'obsidian' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{theme === 'obsidian' ? 'Obsidian' : 'Nebula'}</span>
        </button>
      </div>
    </header>
  );
};
