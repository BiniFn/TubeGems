import React from 'react';
import { AiAnalysisResult } from '../types';
import { Sparkles, Brain, MessageCircleQuestion, Lightbulb } from 'lucide-react';

interface AiInsightsProps {
  analysis: AiAnalysisResult;
  isLoading: boolean;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#111218] rounded-3xl p-6 border border-white/10 h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 bg-indigo-500/30 rounded-full animate-ping"></div>
          <div className="relative z-10 bg-indigo-600 rounded-full p-4 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Content</h3>
        <p className="text-indigo-200 text-center max-w-xs">
          Gemini AI is watching the video metadata to generate summaries and questions...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111218] rounded-3xl border border-white/10 overflow-hidden h-full flex flex-col shadow-2xl">
      <div className="p-8 space-y-8">
        
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
             <Brain className="w-8 h-8 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-2xl font-bold text-white tracking-tight">AI Insights</h3>
             <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mt-1">Powered by Gemini 3 Flash</p>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/5 shadow-inner">
            <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Summary
            </h4>
            <p className="text-gray-200 leading-relaxed text-base">
              {analysis.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/5 shadow-inner">
                <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-950/50 text-indigo-300 rounded-lg text-sm font-medium border border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-default">
                      {topic}
                    </span>
                  ))}
                </div>
             </div>
             
             <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/5 shadow-inner">
                <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <MessageCircleQuestion className="w-4 h-4 text-emerald-500" />
                  Suggested Questions
                </h4>
                <ul className="space-y-3">
                  {analysis.suggestedQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                      <span className="text-emerald-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="leading-snug hover:text-white transition-colors cursor-default">{q}</span>
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};