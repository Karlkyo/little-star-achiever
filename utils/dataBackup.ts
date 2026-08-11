import type { CalmDownActivity, Reward, Task, UserSettings } from '../types';
import { getTaskStats, type TaskStats } from './statistics';

export interface AppData {
  stars: number;
  tasks: Task[];
  rewards: Reward[];
  calmActivities: CalmDownActivity[];
  settings: UserSettings;
  taskStats?: TaskStats;
  unlockedAchievements?: string[];
  exportDate: string;
  version: string;
}

/**
 * 导出应用数据到 JSON 文件
 */
export const exportAppData = (): void => {
  try {
    const data: AppData = {
      stars: parseInt(localStorage.getItem('stars') || '0'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      rewards: JSON.parse(localStorage.getItem('rewards') || '[]'),
      calmActivities: JSON.parse(localStorage.getItem('calmActivities') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings') || '{}'),
      taskStats: getTaskStats(),
      unlockedAchievements: JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'),
      exportDate: new Date().toISOString(),
      version: '1.1.0'
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `little-star-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('数据导出失败');
  }
};

/**
 * 从 JSON 文件导入应用数据
 */
export const importAppData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: AppData = JSON.parse(content);

        // 验证数据格式
        if (!data.stars && data.stars !== 0) {
          throw new Error('无效的备份文件：缺少星星数据');
        }
        if (!Array.isArray(data.tasks)) {
          throw new Error('无效的备份文件：任务数据格式错误');
        }
        if (!Array.isArray(data.rewards)) {
          throw new Error('无效的备份文件：奖励数据格式错误');
        }
        if (data.calmActivities !== undefined && !Array.isArray(data.calmActivities)) {
          throw new Error('无效的备份文件：冷静活动数据格式错误');
        }
        if (!data.settings || typeof data.settings !== 'object') {
          throw new Error('无效的备份文件：设置数据格式错误');
        }
        if (data.unlockedAchievements !== undefined && !Array.isArray(data.unlockedAchievements)) {
          throw new Error('无效的备份文件：成就数据格式错误');
        }

        resolve(data);
      } catch (error) {
        console.error('Import parsing failed:', error);
        reject(error instanceof Error ? error : new Error('文件解析失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file);
  });
};

/**
 * 应用导入的数据到 localStorage
 */
export const applyImportedData = (data: AppData): void => {
  try {
    localStorage.setItem('stars', data.stars.toString());
    localStorage.setItem('tasks', JSON.stringify(data.tasks));
    localStorage.setItem('rewards', JSON.stringify(data.rewards));
    localStorage.setItem('calmActivities', JSON.stringify(data.calmActivities || []));
    localStorage.setItem('settings', JSON.stringify(data.settings));
    if (data.taskStats) {
      localStorage.setItem('taskStats', JSON.stringify(data.taskStats));
    } else {
      localStorage.removeItem('taskStats');
    }
    if (data.unlockedAchievements) {
      localStorage.setItem('unlockedAchievements', JSON.stringify(data.unlockedAchievements));
    } else {
      localStorage.removeItem('unlockedAchievements');
    }
  } catch (error) {
    console.error('Apply data failed:', error);
    throw new Error('数据应用失败');
  }
};
