import { Task, Reward, CalmDownActivity } from './types';

export const DEFAULT_TASKS: Task[] = [
  // Daily Habits - 超简单日常（1星）- 3-4岁可以独立完成
  { id: '1', title: '早上刷牙', emoji: '🪥', stars: 1, category: 'daily' },
  { id: '2', title: '洗手洗脸', emoji: '💧', stars: 1, category: 'daily' },
  { id: '3', title: '穿好鞋子', emoji: '👟', stars: 1, category: 'daily' },
  { id: '13', title: '喝一杯水', emoji: '💧', stars: 1, category: 'daily' },
  { id: '14', title: '自己吃饭', emoji: '🍚', stars: 1, category: 'daily' },

  // Daily Habits - 需要配合（2星）
  { id: '4', title: '收拾玩具', emoji: '🧸', stars: 2, category: 'daily' },
  { id: '5', title: '吃完蔬菜', emoji: '🥦', stars: 2, category: 'daily' },
  { id: '6', title: '按时睡觉', emoji: '😴', stars: 2, category: 'daily' },
  { id: '15', title: '午睡起床', emoji: '🌅', stars: 2, category: 'daily' },

  // Behavior / Character - 基础礼貌（1星）
  { id: '7', title: '说请/谢谢', emoji: '🙏', stars: 1, category: 'behavior' },
  { id: '16', title: '打招呼', emoji: '👋', stars: 1, category: 'behavior' },
  { id: '17', title: '轻声说话', emoji: '🤫', stars: 1, category: 'behavior' },

  // Behavior - 情绪管理（2星）
  { id: '8', title: '和朋友分享', emoji: '🤝', stars: 2, category: 'behavior' },
  { id: '9', title: '不打人不咬人', emoji: '✋', stars: 2, category: 'behavior' },
  { id: '18', title: '耐心等待', emoji: '⏰', stars: 2, category: 'behavior' },
  { id: '19', title: '帮忙做家务', emoji: '🧹', stars: 2, category: 'behavior' },

  // Learning / Growth - 适龄学习（2-3星）
  { id: '10', title: '听完一个故事', emoji: '📚', stars: 2, category: 'learning' },
  { id: '20', title: '唱一首歌', emoji: '🎵', stars: 2, category: 'learning' },
  { id: '11', title: '自己穿衣服', emoji: '👕', stars: 3, category: 'learning' },
  { id: '12', title: '自己上厕所', emoji: '🚽', stars: 3, category: 'learning' },
];

export const DEFAULT_REWARDS: Reward[] = [
  // Affection - 即时亲子互动（1-2星）- 高频低成本，培养亲子关系
  { id: '401', title: '击掌鼓励', emoji: '✋', cost: 1, type: 'affection' },
  { id: '405', title: '亲亲额头', emoji: '😘', cost: 1, type: 'affection' },
  { id: '406', title: '举高高', emoji: '🙌', cost: 1, type: 'affection' },
  { id: '402', title: '大大的拥抱', emoji: '🤗', cost: 2, type: 'affection' },
  { id: '403', title: '转圈圈游戏', emoji: '🔄', cost: 2, type: 'affection' },
  { id: '407', title: '骑大马', emoji: '🐴', cost: 2, type: 'affection' },
  { id: '404', title: '睡前故事', emoji: '🌙', cost: 3, type: 'affection' },
  { id: '408', title: '唱喜欢的歌', emoji: '🎤', cost: 3, type: 'affection' },

  // Material - 小零食小礼物（3-5星）- 适度物质奖励
  { id: '301', title: '奖励贴纸', emoji: '⭐', cost: 3, type: 'material' },
  { id: '302', title: '小饼干', emoji: '🍪', cost: 3, type: 'material' },
  { id: '309', title: '水果零食', emoji: '🍓', cost: 3, type: 'material' },
  { id: '303', title: '果汁一瓶', emoji: '🧃', cost: 4, type: 'material' },
  { id: '305', title: '彩色糖果', emoji: '🍬', cost: 4, type: 'material' },
  { id: '310', title: '酸奶一杯', emoji: '🥛', cost: 4, type: 'material' },
  { id: '304', title: '小玩具', emoji: '🎁', cost: 5, type: 'material' },
  { id: '311', title: '新绘本', emoji: '📖', cost: 5, type: 'material' },

  // Experience - 有趣活动（5-8星）- 调整为更容易达成的目标
  { id: '201', title: '吹泡泡', emoji: '🫧', cost: 5, type: 'experience' },
  { id: '212', title: '玩沙子', emoji: '🏖️', cost: 5, type: 'experience' },
  { id: '213', title: '玩水游戏', emoji: '💦', cost: 5, type: 'experience' },
  { id: '203', title: '画画时间', emoji: '🎨', cost: 6, type: 'experience' },
  { id: '214', title: '捏橡皮泥', emoji: '🎨', cost: 6, type: 'experience' },
  { id: '204', title: '玩积木', emoji: '🧱', cost: 6, type: 'experience' },
  { id: '202', title: '玩滑梯', emoji: '🛝', cost: 7, type: 'experience' },
  { id: '215', title: '骑小车车', emoji: '🚲', cost: 7, type: 'experience' },
  { id: '205', title: '去公园玩', emoji: '🌳', cost: 8, type: 'experience' },

  // Privilege - 特别优待（6-12星）- 降低门槛，增加可达成性
  { id: '107', title: '选择今天穿什么', emoji: '👗', cost: 6, type: 'privilege' },
  { id: '108', title: '选择吃什么水果', emoji: '🍎', cost: 6, type: 'privilege' },
  { id: '101', title: '多玩10分钟', emoji: '⏰', cost: 7, type: 'privilege' },
  { id: '109', title: '自己选玩具', emoji: '🎯', cost: 7, type: 'privilege' },
  { id: '103', title: '晚餐点餐权', emoji: '🍝', cost: 8, type: 'privilege' },
  { id: '102', title: '看动画片', emoji: '📺', cost: 8, type: 'privilege' },
  { id: '110', title: '今天当小帮手', emoji: '👷', cost: 10, type: 'privilege' },
  { id: '106', title: '邀请朋友来玩', emoji: '👯', cost: 12, type: 'privilege' },
];

export const DEFAULT_CALM_ACTIVITIES: CalmDownActivity[] = [
  { id: '1', title: '深呼吸', emoji: '🌬️', description: '像闻花一样深吸气，像吹蜡烛一样慢慢吐气。' },
  { id: '2', title: '数到 5', emoji: '🖐️', description: '伸出小手，慢慢数：1, 2, 3, 4, 5...' },
  { id: '3', title: '小乌龟', emoji: '🐢', description: '像小乌龟一样，把头缩进壳里休息一下。' },
  { id: '4', title: '挤压放松', emoji: '✊', description: '用力握紧拳头，然后慢慢松开。' },
  { id: '5', title: '抱抱玩具', emoji: '🧸', description: '找一个最喜欢的玩具，给它一个大大的拥抱。' },
  { id: '6', title: '看云朵', emoji: '☁️', description: '抬头看天上的云，想象它们像什么。' },
  { id: '7', title: '蝴蝶呼吸', emoji: '🦋', description: '张开手臂像蝴蝶翅膀，吸气时打开，呼气时合上。' },
  { id: '8', title: '说出感受', emoji: '💭', description: '告诉妈妈你现在的感觉：开心、难过、还是生气？' },
];

export const TOTAL_STARS_CAPACITY = 30; // Visual cap for the jar

// --- Animation & Timing Constants ---
export const ANIMATION_DURATION = 600; // Task completion animation duration (ms)
export const LOCALSTORAGE_DEBOUNCE_DELAY = 500; // Debounce delay for localStorage writes (ms)

// --- Audio Constants ---
export const TTS_SAMPLE_RATE = 24000; // Gemini TTS audio sample rate (Hz)
export const AUDIO_QUEUE_MAX_LENGTH = 5; // Maximum audio queue length

// --- UI Constants ---
export const STAR_POSITION_RANGE = {
  min: 10,
  max: 80
}; // Random position range for stars in jar (percentage)

export const STAR_SCALE_RANGE = {
  min: 0.8,
  max: 1.2
}; // Random scale range for stars

// --- Validation Constants ---
export const MAX_INPUT_LENGTH = 500; // Maximum input length for AI prompts
export const MAX_CHILD_NAME_LENGTH = 20; // Maximum child name length

// --- Retry Constants ---
export const AI_RETRY_CONFIG = {
  maxRetries: 2,
  delayMs: 1000,
  backoffMultiplier: 2
};

export const TTS_RETRY_CONFIG = {
  maxRetries: 1,
  delayMs: 1000,
  backoffMultiplier: 1
};
