/**
 * 任务统计工具
 */

export interface TaskStats {
  totalCompleted: number;
  todayCompleted: number;
  weekCompleted: number;
  totalStarsEarned: number;
  lastCompletedDate: string;
  taskHistory: TaskCompletion[];
}

export interface TaskCompletion {
  taskId: string;
  taskTitle: string;
  starsEarned: number;
  completedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: (stats: TaskStats) => boolean;
}

const createEmptyStats = (): TaskStats => ({
  totalCompleted: 0,
  todayCompleted: 0,
  weekCompleted: 0,
  totalStarsEarned: 0,
  lastCompletedDate: '',
  taskHistory: []
});

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDateKey = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

/**
 * 获取任务统计数据
 */
export const getTaskStats = (): TaskStats => {
  try {
    const stats = localStorage.getItem('taskStats');
    if (stats) {
      const parsed = JSON.parse(stats) as TaskStats;
      const now = new Date();
      const today = getLocalDateKey(now);
      const lastDate = parseLocalDateKey(parsed.lastCompletedDate);

      if (parsed.lastCompletedDate !== today) {
        parsed.todayCompleted = 0;
      }
      if (!lastDate || isNewWeek(lastDate, now)) {
        parsed.weekCompleted = 0;
      }

      return parsed;
    }
  } catch (error) {
    console.error('Failed to load task stats:', error);
  }

  return createEmptyStats();
};

/**
 * 保存任务统计数据
 */
export const saveTaskStats = (stats: TaskStats): void => {
  try {
    localStorage.setItem('taskStats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save task stats:', error);
  }
};

/**
 * 记录任务完成
 */
export const recordTaskCompletion = (
  taskId: string,
  taskTitle: string,
  starsEarned: number
): TaskStats => {
  const stats = getTaskStats();
  const now = new Date();
  const today = getLocalDateKey(now);

  // 检查是否需要重置今日计数
  if (stats.lastCompletedDate !== today) {
    stats.todayCompleted = 0;
  }

  // 检查是否需要重置本周计数（周一重置）
  const lastDate = parseLocalDateKey(stats.lastCompletedDate);
  if (lastDate && isNewWeek(lastDate, now)) {
    stats.weekCompleted = 0;
  }

  // 更新统计
  stats.totalCompleted += 1;
  stats.todayCompleted += 1;
  stats.weekCompleted += 1;
  stats.totalStarsEarned += starsEarned;
  stats.lastCompletedDate = today;

  // 添加到历史记录（只保留最近50条）
  const completion: TaskCompletion = {
    taskId,
    taskTitle,
    starsEarned,
    completedAt: now.toISOString()
  };
  stats.taskHistory.unshift(completion);
  if (stats.taskHistory.length > 50) {
    stats.taskHistory = stats.taskHistory.slice(0, 50);
  }

  saveTaskStats(stats);
  return stats;
};

/**
 * 判断是否是新的一周
 */
const isNewWeek = (lastDate: Date, currentDate: Date): boolean => {
  const lastMonday = getMonday(lastDate);
  const currentMonday = getMonday(currentDate);
  return lastMonday.getTime() !== currentMonday.getTime();
};

/**
 * 获取本周周一的日期
 */
const getMonday = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * 预定义成就列表
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    title: '初次尝试',
    description: '完成第一个任务',
    emoji: '🌟',
    unlocked: false,
    condition: (stats) => stats.totalCompleted >= 1
  },
  {
    id: 'five_tasks',
    title: '小小能手',
    description: '累计完成5个任务',
    emoji: '⭐',
    unlocked: false,
    condition: (stats) => stats.totalCompleted >= 5
  },
  {
    id: 'ten_tasks',
    title: '勤劳宝贝',
    description: '累计完成10个任务',
    emoji: '🌠',
    unlocked: false,
    condition: (stats) => stats.totalCompleted >= 10
  },
  {
    id: 'daily_five',
    title: '今日之星',
    description: '一天内完成5个任务',
    emoji: '💫',
    unlocked: false,
    condition: (stats) => stats.todayCompleted >= 5
  },
  {
    id: 'fifty_stars',
    title: '星星收集家',
    description: '累计获得50颗星星',
    emoji: '✨',
    unlocked: false,
    condition: (stats) => stats.totalStarsEarned >= 50
  },
  {
    id: 'week_warrior',
    title: '本周冠军',
    description: '本周完成20个任务',
    emoji: '🏆',
    unlocked: false,
    condition: (stats) => stats.weekCompleted >= 20
  },
  {
    id: 'hundred_tasks',
    title: '超级明星',
    description: '累计完成100个任务',
    emoji: '🌈',
    unlocked: false,
    condition: (stats) => stats.totalCompleted >= 100
  }
];

/**
 * 检查并解锁成就
 */
export const checkAchievements = (stats: TaskStats): Achievement[] => {
  const unlockedAchievements = localStorage.getItem('unlockedAchievements');
  const unlocked: Set<string> = unlockedAchievements
    ? new Set(JSON.parse(unlockedAchievements))
    : new Set();

  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!unlocked.has(achievement.id) && achievement.condition(stats)) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      unlocked.add(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  // 保存已解锁成就
  if (newlyUnlocked.length > 0) {
    localStorage.setItem('unlockedAchievements', JSON.stringify([...unlocked]));
  }

  return newlyUnlocked;
};

/**
 * 获取所有成就（包括已解锁和未解锁）
 */
export const getAllAchievements = (): Achievement[] => {
  const unlockedAchievements = localStorage.getItem('unlockedAchievements');
  const unlocked: Set<string> = unlockedAchievements
    ? new Set(JSON.parse(unlockedAchievements))
    : new Set();

  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: unlocked.has(achievement.id)
  }));
};
