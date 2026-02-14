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
      <div className="bg-gray-900/40 rounded-3xl p-8 border border-white/5 h-full flex flex-col items-center justify-center min-h-[400px] backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 bg-indigo-500/30 rounded-full animate-ping"></div>
            <div className="relative z-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full p-5 shadow-2xl shadow-indigo-500/30">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Consulting Gemini...</h3>
          <p className="text-indigo-200/70 text-center max-w-xs font-light">
            Analyzing context, extracting topics, and generating summary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 rounded-3xl border border-white/10 overflow-hidden h-full flex flex-col shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
             <Brain className="w-6 h-6 text-white" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white tracking-tight">AI Analysis</h3>
             <p className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">Gemini 3 Flash</p>
           </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        
        {/* Summary Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <div className="relative bg-[#0a0a0c] rounded-2xl p-6 border border-white/10">
            <h4 className="text-xs font-bold text-indigo-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <Lightbulb className="w-4 h-4" />
              TL;DR Summary
            </h4>
            <p className="text-gray-200 leading-relaxed text-lg font-light">
              {analysis.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Topics */}
           <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/5 shadow-inner flex flex-col">
              <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Hash className="w-4 h-4 text-purple-400" />
                Key Topics
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {analysis.topics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-sm border border-white/10 transition-colors cursor-default">
                    {topic}
                  </span>
                ))}
              </div>
           </div>
           
           {/* Questions */}
           <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/5 shadow-inner flex flex-col">
              <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <MessageCircleQuestion className="w-4 h-4 text-emerald-400" />
                Curious Questions
              </h4>
              <ul className="space-y-4">
                {analysis.suggestedQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-3 group">
                    <span className="text-emerald-500/50 group-hover:text-emerald-400 mt-1 transition-colors">●</span>
                    <span className="leading-snug group-hover:text-white transition-colors">{q}</span>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};