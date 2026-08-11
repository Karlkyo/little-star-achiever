import React, { useState } from 'react';
import { CalmDownActivity } from '../types';
import { ArrowRight, X } from 'lucide-react';

interface CalmDownCornerProps {
  activities: CalmDownActivity[];
  onClose: () => void;
}

export const CalmDownCorner = React.memo<CalmDownCornerProps>(({ activities, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (activities.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#E0F7FA] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <span className="text-7xl" aria-hidden="true">🌿</span>
        <h2 className="mt-6 text-3xl font-bold text-teal-800">冷静一下</h2>
        <p className="mt-3 text-lg text-teal-700">还没有冷静活动，请让家长先添加一个。</p>
        <button
          onClick={onClose}
          className="mt-8 bg-teal-600 text-white px-8 py-3 rounded-full shadow-lg font-bold hover:bg-teal-700 active:scale-95"
        >
          返回
        </button>
      </div>
    );
  }

  const nextActivity = () => {
    setCurrentIndex((prev) => (prev + 1) % activities.length);
  };

  const current = activities[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#E0F7FA] flex flex-col items-center justify-center p-6 animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/50 rounded-full text-teal-700 hover:bg-white"
        aria-label="关闭冷静角"
      >
        <X size={32} />
      </button>

      {/* Breathing Guide */}
      <div className="relative mb-12">
        <div className="w-64 h-64 bg-teal-300 rounded-full opacity-30 breathing-circle absolute inset-0 blur-xl"></div>
        <div className="w-64 h-64 bg-teal-200 rounded-full opacity-40 breathing-circle absolute inset-0"></div>
        <div className="w-64 h-64 flex items-center justify-center relative z-10">
           <span className="text-8xl">{current.emoji}</span>
        </div>
      </div>

      <div className="text-center max-w-sm space-y-4">
        <h2 className="text-3xl font-bold text-teal-800 tracking-tight">{current.title}</h2>
        <p className="text-xl text-teal-700 font-medium leading-relaxed">
          {current.description}
        </p>
      </div>

      <div className="mt-12 flex gap-4">
        <button 
          onClick={nextActivity}
          className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg text-teal-600 font-bold hover:bg-teal-50 transition-transform active:scale-95"
        >
          换一个 <ArrowRight size={20} />
        </button>
        
        <button 
          onClick={onClose}
          className="bg-teal-600 text-white px-8 py-3 rounded-full shadow-lg font-bold hover:bg-teal-700 transition-transform active:scale-95"
        >
          做好了！
        </button>
      </div>
    </div>
  );
});

CalmDownCorner.displayName = 'CalmDownCorner';
