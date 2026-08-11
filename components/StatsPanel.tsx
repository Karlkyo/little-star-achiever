import React from 'react';
import { BarChart3, TrendingUp, Award } from 'lucide-react';
import { getTaskStats, getAllAchievements } from '../utils/statistics';

export const StatsPanel = React.memo(() => {
  const stats = getTaskStats();
  const achievements = getAllAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 pb-20">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<TrendingUp size={24} className="text-blue-600" />}
          label="今日完成"
          value={stats.todayCompleted}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<BarChart3 size={24} className="text-green-600" />}
          label="本周完成"
          value={stats.weekCompleted}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Award size={24} className="text-purple-600" />}
          label="总计完成"
          value={stats.totalCompleted}
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<span className="text-2xl">⭐</span>}
          label="累计星星"
          value={stats.totalStarsEarned}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* 成就墙 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-orange-800 flex items-center gap-2">
            <Award className="text-orange-600" />
            成就墙
          </h3>
          <span className="text-sm text-gray-600">
            {unlockedCount}/{achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {achievements.map(achievement => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* 最近完成 */}
      {stats.taskHistory.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-800 mb-4">最近完成</h3>
          <div className="space-y-2">
            {stats.taskHistory.slice(0, 5).map((completion, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{completion.taskTitle}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(completion.completedAt).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-bold">
                  +{completion.starsEarned}⭐
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}

const StatCard = React.memo<StatCardProps>(({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-2xl border-b-4 border-gray-200`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
    </div>
    <p className="text-sm text-gray-600 font-semibold">{label}</p>
    <p className="text-3xl font-black text-gray-800">{value}</p>
  </div>
));

StatCard.displayName = 'StatCard';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    emoji: string;
    unlocked: boolean;
  };
}

const AchievementBadge = React.memo<AchievementBadgeProps>(({ achievement }) => (
  <div
    className={`
      aspect-square rounded-2xl flex flex-col items-center justify-center p-3 border-2
      ${achievement.unlocked
        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 shadow-md'
        : 'bg-gray-100 border-gray-200 opacity-60'
      }
    `}
    title={achievement.description}
  >
    <span className={`text-4xl mb-1 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
      {achievement.emoji}
    </span>
    <p className={`text-xs text-center font-bold leading-tight ${achievement.unlocked ? 'text-orange-800' : 'text-gray-500'}`}>
      {achievement.title}
    </p>
  </div>
));

AchievementBadge.displayName = 'AchievementBadge';
