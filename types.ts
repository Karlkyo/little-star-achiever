export interface Task {
  id: string;
  title: string;
  emoji: string;
  stars: number;
  category: 'daily' | 'behavior' | 'learning';
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  cost: number;
  type: 'material' | 'experience' | 'affection' | 'privilege'; 
}

export interface CalmDownActivity {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

export interface UserSettings {
  childName: string;
  voiceEnabled: boolean;
}

export enum Tab {
  TASKS = 'tasks',
  REWARDS = 'rewards',
  STATS = 'stats',
  PARENT = 'parent'
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
}