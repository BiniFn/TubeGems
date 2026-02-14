import React from 'react';
import { AiAnalysisResult } from '../types';
import { Sparkles, BrainCircuit, MessageCircleQuestion, Lightbulb } from 'lucide-react';

interface AiInsightsProps {
  analysis: AiAnalysisResult;
  isLoading: boolean;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl p-6 border border-indigo-500/20 h-full flex flex-col items-center justify-center min-h-[400px]">
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
    <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 rounded-3xl p-1 border border-indigo-500/20 h-full flex flex-col">
      <div className="p-6 md:p-8 space-y-8">
        
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-indigo-500/10 rounded-lg">
             <BrainCircuit className="w-6 h-6 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-white">AI Insights</h3>
             <p className="text-xs text-indigo-300 font-medium tracking-wide uppercase">Powered by Gemini 3 Flash</p>
           </div>
        </div>

        <div className="space-y-4">
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              SUMMARY
            </h4>
            <p className="text-gray-200 leading-relaxed text-sm md:text-base">
              {analysis.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-sm border border-indigo-500/10">
                      {topic}
                    </span>
                  ))}
                </div>
             </div>
             
             <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-emerald-500" />
                  SUGGESTED QUESTIONS
                </h4>
                <ul className="space-y-2">
                  {analysis.suggestedQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-emerald-500/50 mt-1">•</span>
                      {q}
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
