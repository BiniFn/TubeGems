import React from 'react';
import { Languages, Sparkles, Timer, Wand2 } from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  const cards = [
    {
      icon: Sparkles,
      title: 'AI Summaries',
      text: 'Get quick takeaways in seconds from long videos.',
    },
    {
      icon: Timer,
      title: 'Fast Downloads',
      text: 'Video/audio fallback routes are optimized for reliability.',
    },
    {
      icon: Languages,
      title: 'Roadmap Ready',
      text: 'Multi-language and timestamp features are planned next.',
    },
    {
      icon: Wand2,
      title: 'Cleaner UX',
      text: 'Streamlined controls with fewer clicks and less clutter.',
    },
  ];

  return (
    <section className="max-w-5xl mx-auto mt-8 md:mt-12 px-3 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm hover:bg-black/35 transition-colors"
          >
            <card.icon className="w-5 h-5 text-red-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
