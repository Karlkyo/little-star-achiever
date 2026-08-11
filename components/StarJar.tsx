import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { TOTAL_STARS_CAPACITY } from '../constants';

interface StarJarProps {
  count: number;
}

interface StarPosition {
  id: number;
  left: number;
  rotation: number;
  scale: number;
}

export const StarJar = React.memo<StarJarProps>(({ count }) => {
  const safeCount = Math.max(0, count);
  const displayCount = Math.min(safeCount, TOTAL_STARS_CAPACITY);
  const fillPercentage = (displayCount / TOTAL_STARS_CAPACITY) * 100;

  // 使用可重复的伪随机布局，让已有星星位置稳定，同时保证数量变化立即触发渲染。
  const starPositions = useMemo<StarPosition[]>(() => {
    const pseudoRandom = (seed: number) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };

    return Array.from({ length: displayCount }, (_, id) => ({
      id,
      left: pseudoRandom(id + 1) * 70 + 10,
      rotation: pseudoRandom(id + 201) * 360,
      scale: 0.8 + pseudoRandom(id + 301) * 0.4
    }));
  }, [displayCount]);

  return (
    <div
      className="relative w-48 h-64 mx-auto mb-6"
      role="img"
      aria-label={`星星罐中有 ${safeCount} 颗星`}
    >
      {/* Jar Glass */}
      <div className="absolute inset-0 border-4 border-slate-300 bg-white/50 rounded-b-3xl rounded-t-lg shadow-xl backdrop-blur-sm z-20 pointer-events-none"></div>

      {/* Jar Lid */}
      <div className="absolute -top-4 left-0 w-full h-4 bg-slate-400 rounded-t-md shadow-md z-20"></div>

      {/* Stars Container */}
      <div className="absolute inset-2 bottom-2 overflow-hidden rounded-b-2xl z-10">
        {/* Animated Stars */}
        {starPositions.map((star, index) => (
          <div
            key={star.id}
            className="absolute text-yellow-400 drop-shadow-md star-animation transition-all duration-500"
            style={{
              left: `${star.left}%`,
              bottom: `${Math.min(((index + 1) / displayCount) * fillPercentage * 0.9, fillPercentage * 0.8)}%`,
              transform: `rotate(${star.rotation}deg) scale(${star.scale})`,
            }}
          >
            <Star fill="currentColor" size={32} />
          </div>
        ))}
      </div>

      {/* Counter Badge */}
      <div className="absolute -bottom-4 right-1/2 translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full shadow-lg z-30 text-xl border-2 border-white whitespace-nowrap">
        {safeCount} 颗星
      </div>
    </div>
  );
});

StarJar.displayName = 'StarJar';
