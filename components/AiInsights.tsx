import React from 'react';
import { AiAnalysisResult } from '../types';
import { Sparkles, Brain, MessageCircleQuestion, Lightbulb, Hash } from 'lucide-react';

interface AiInsightsProps {
  analysis: AiAnalysisResult;
  isLoading: boolean;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900/40 rounded-3xl p-6 md:p-8 border border-white/5 h-full flex flex-col items-center justify-center min-h-[240px] md:min-h-[400px] backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full p-4 mb-4 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Consulting Gemini...</h3>
          <p className="text-indigo-200/70 text-sm md:text-base max-w-xs font-light">
            Analyzing context and generating a short summary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 rounded-3xl border border-white/10 overflow-hidden h-full flex flex-col shadow-xl backdrop-blur-md">
      <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">AI Analysis</h3>
            <p className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">Gemini 3 Flash</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
        <div className="relative group">
          <div className="relative bg-[#0a0a0c] rounded-2xl p-4 md:p-6 border border-white/10">
            <h4 className="text-xs font-bold text-indigo-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <Lightbulb className="w-4 h-4" />
              TL;DR Summary
            </h4>
            <p className="text-gray-200 leading-relaxed text-base md:text-lg font-light">{analysis.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-[#0a0a0c] rounded-2xl p-4 md:p-6 border border-white/5 shadow-inner flex flex-col">
            <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Hash className="w-4 h-4 text-purple-400" />
              Key Topics
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {analysis.topics.map((topic, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm border border-white/10">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#0a0a0c] rounded-2xl p-4 md:p-6 border border-white/5 shadow-inner flex flex-col">
            <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <MessageCircleQuestion className="w-4 h-4 text-emerald-400" />
              Curious Questions
            </h4>
            <ul className="space-y-3">
              {analysis.suggestedQuestions.map((q, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">●</span>
                  <span className="leading-snug">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
