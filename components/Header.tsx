import React from 'react';
import { Youtube } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <Youtube className="w-8 h-8 text-red-500 fill-current group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TubeGems
          </h1>
        </div>
      </div>
    </header>
  );
};