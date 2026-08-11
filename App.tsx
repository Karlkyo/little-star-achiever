import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { Star, Gift, Settings, Check, Coins, CloudSun, Trophy } from 'lucide-react';
import { Task, Reward, CalmDownActivity, UserSettings, Tab } from './types';
import { DEFAULT_TASKS, DEFAULT_REWARDS, DEFAULT_CALM_ACTIVITIES, ANIMATION_DURATION } from './constants';
import { StarJar } from './components/StarJar';
import { ConfirmModal, AlertModal } from './components/Modal';
import { playEncouragement, ensureAudioContextReady } from './services/geminiService';
import { useLocalStorage, useLocalStorageNumber } from './hooks/useLocalStorage';
import { recordTaskCompletion, checkAchievements } from './utils/statistics';

const ParentZone = React.lazy(() =>
  import('./components/ParentZone').then(module => ({ default: module.ParentZone }))
);
const CalmDownCorner = React.lazy(() =>
  import('./components/CalmDownCorner').then(module => ({ default: module.CalmDownCorner }))
);
const StatsPanel = React.lazy(() =>
  import('./components/StatsPanel').then(module => ({ default: module.StatsPanel }))
);

export default function App() {
  // State with error handling and debounced localStorage
  const [stars, setStars] = useLocalStorageNumber('stars', 0);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', DEFAULT_TASKS);
  const [rewards, setRewards] = useLocalStorage<Reward[]>('rewards', DEFAULT_REWARDS);
  const [calmActivities, setCalmActivities] = useLocalStorage<CalmDownActivity[]>('calmActivities', DEFAULT_CALM_ACTIVITIES);
  const [settings, setSettings] = useLocalStorage<UserSettings>('settings', { childName: '宝贝', voiceEnabled: true });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);
  const [showCalmCorner, setShowCalmCorner] = useState(false);
  const [animatingTask, setAnimatingTask] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Handlers with useCallback for performance
  const handleTaskComplete = useCallback(async (task: Task) => {
    try {
      // Initialize Audio immediately on user interaction
      await ensureAudioContextReady();

      setAnimatingTask(task.id);
      setTimeout(() => {
        setStars(prev => prev + task.stars);
        setAnimatingTask(null);

        // Record task completion and check achievements
        const stats = recordTaskCompletion(task.id, task.title, task.stars);
        const unlockedAchievements = checkAchievements(stats);

        if (unlockedAchievements.length > 0) {
          // Show achievement notification
          setTimeout(() => {
            setAlertModal({
              isOpen: true,
              title: '解锁新成就！',
              message: `恭喜${settings.childName}解锁了：${unlockedAchievements.map(a => a.emoji + ' ' + a.title).join('、')}`,
              type: 'success'
            });
          }, ANIMATION_DURATION + 100);
        }
      }, ANIMATION_DURATION);

      if (settings.voiceEnabled) {
        // This is async, audio will play when ready
        setIsPlayingVoice(true);
        playEncouragement(settings.childName, task.title)
          .catch(error => {
            console.warn('Voice encouragement failed:', error);
          })
          .finally(() => {
            setIsPlayingVoice(false);
          });
      }
    } catch (error) {
      console.error('Task completion error:', error);
      setAnimatingTask(null);
    }
  }, [settings.voiceEnabled, settings.childName, setStars]);

  const handleRedeem = useCallback((reward: Reward) => {
    if (stars >= reward.cost) {
      setConfirmModal({
        isOpen: true,
        title: '兑换奖励',
        message: `确定花费 ${reward.cost} 颗星星兑换 "${reward.title}" 吗？`,
        onConfirm: () => {
          setStars(prev => prev - reward.cost);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setAlertModal({
            isOpen: true,
            title: '兑换成功！',
            message: `恭喜获得：${reward.title} ${reward.emoji}`,
            type: 'success'
          });
        }
      });
    } else {
      setAlertModal({
        isOpen: true,
        title: '星星不够',
        message: '星星还不够哦，继续加油！',
        type: 'warning'
      });
    }
  }, [stars, setStars]);

  const handleAddTask = useCallback((newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  }, [setTasks]);

  const handleAddReward = useCallback((newReward: Reward) => {
    setRewards(prev => [...prev, newReward]);
  }, [setRewards]);

  const handleAddCalmActivity = useCallback((newActivity: CalmDownActivity) => {
    setCalmActivities(prev => [...prev, newActivity]);
  }, [setCalmActivities]);

  // Memoized render helpers
  const renderTasks = useMemo(() => (
    <div className="grid grid-cols-2 gap-4 pb-24">
      {tasks.map(task => (
        <button
          key={task.id}
          onClick={() => handleTaskComplete(task)}
          disabled={!!animatingTask}
          className={`
            relative flex flex-col items-center justify-center p-4 h-40 rounded-3xl transition-all duration-200
            ${animatingTask === task.id ? 'scale-95 bg-green-100 ring-4 ring-green-300' : 'bg-white shadow-md hover:shadow-lg hover:-translate-y-1'}
            border-b-8 border-r-4
            ${task.category === 'daily' ? 'border-blue-200' : task.category === 'behavior' ? 'border-purple-200' : 'border-orange-200'}
          `}
          aria-label={`完成任务：${task.title}，获得${task.stars}颗星`}
        >
          <div className="text-5xl mb-2 wiggle">{task.emoji}</div>
          <span className="text-gray-700 font-bold text-lg leading-tight text-center">{task.title}</span>
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 font-bold px-2 rounded-full text-sm flex items-center gap-1">
            +{task.stars} <Star size={12} fill="currentColor" />
          </div>
          {animatingTask === task.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-3xl z-10">
              <Check className="text-green-500 w-12 h-12 animate-bounce" />
            </div>
          )}
        </button>
      ))}
    </div>
  ), [tasks, animatingTask, handleTaskComplete]);

  const renderRewards = useMemo(() => (
    <div className="space-y-6 pb-24">
      {['privilege', 'affection', 'experience', 'material'].map((type) => {
        const typeRewards = rewards.filter(r => r.type === type);
        if (typeRewards.length === 0) return null;

        let typeLabel = '';
        let typeColor = '';
        if (type === 'privilege') { typeLabel = '特别优待券'; typeColor = 'text-purple-600'; }
        else if (type === 'affection') { typeLabel = '爱的鼓励'; typeColor = 'text-pink-600'; }
        else if (type === 'experience') { typeLabel = '有趣体验'; typeColor = 'text-blue-600'; }
        else { typeLabel = '实物奖励'; typeColor = 'text-orange-600'; }

        return (
          <div key={type}>
            <h3 className={`font-bold ${typeColor} mb-2 ml-1 text-sm uppercase tracking-wide flex items-center gap-2`}>
              {type === 'privilege' && <SparklesIcon />}
              {typeLabel}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {typeRewards.map(reward => {
                const canAfford = stars >= reward.cost;
                return (
                  <button
                    key={reward.id}
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl border-b-4 transition-all
                      ${canAfford ? 'bg-white border-pink-200 shadow-sm hover:bg-pink-50' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'}
                    `}
                    aria-label={`兑换奖励：${reward.title}，需要${reward.cost}颗星`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{reward.emoji}</span>
                      <span className="font-bold text-gray-700 text-lg">{reward.title}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 ${canAfford ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-500'}`}>
                      {reward.cost} <Coins size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  ), [rewards, stars, handleRedeem]);

  return (
    <div className="min-h-screen bg-[#FEFCE8] max-w-md mx-auto relative overflow-hidden flex flex-col">

      {/* Calm Down Overlay */}
      {showCalmCorner && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/10" />}>
          <CalmDownCorner
            activities={calmActivities}
            onClose={() => setShowCalmCorner(false)}
          />
        </Suspense>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <header className="p-6 pb-2 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            你好, {settings.childName}! 👋
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalmCorner(true)}
            className="bg-teal-100 text-teal-700 p-2 rounded-xl hover:bg-teal-200 shadow-sm"
            aria-label="冷静角"
          >
            <CloudSun size={24} />
          </button>
          <div className="flex items-center gap-2">
            {isPlayingVoice && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-xl font-bold flex items-center gap-2 shadow-sm animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-4 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-4 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs">播放中</span>
              </div>
            )}
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-xl font-bold flex items-center gap-1 shadow-sm">
              <Star fill="currentColor" size={18} />
              {stars}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pt-4">
        {activeTab === Tab.TASKS && <StarJar count={stars} />}
        {activeTab === Tab.TASKS && renderTasks}
        {activeTab === Tab.REWARDS && renderRewards}
        {activeTab === Tab.STATS && (
          <Suspense fallback={<div className="text-center text-sm text-gray-400">加载中...</div>}>
            <StatsPanel />
          </Suspense>
        )}
        {activeTab === Tab.PARENT && (
          <Suspense fallback={<div className="text-center text-sm text-gray-400">加载中...</div>}>
            <ParentZone
              settings={settings}
              onUpdateSettings={setSettings}
              onAddTask={handleAddTask}
              onAddReward={handleAddReward}
              onAddCalmActivity={handleAddCalmActivity}
            />
          </Suspense>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 shadow-2xl rounded-t-3xl z-40">
        <div className="flex justify-around items-center">
          <NavButton active={activeTab === Tab.TASKS} onClick={() => setActiveTab(Tab.TASKS)} icon={<Star size={24} />} label="任务" />
          <NavButton active={activeTab === Tab.REWARDS} onClick={() => setActiveTab(Tab.REWARDS)} icon={<Gift size={24} />} label="奖励" />
          <NavButton active={activeTab === Tab.STATS} onClick={() => setActiveTab(Tab.STATS)} icon={<Trophy size={24} />} label="成就" />
          <NavButton active={activeTab === Tab.PARENT} onClick={() => setActiveTab(Tab.PARENT)} icon={<Settings size={24} />} label="家长" />
        </div>
      </nav>
    </div>
  );
}

const SparklesIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/>
  </svg>
));

SparklesIcon.displayName = 'SparklesIcon';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement<{ fill?: string; strokeWidth?: number }>;
  label: string;
}

const NavButton = React.memo<NavButtonProps>(({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}
    aria-label={label}
    aria-pressed={active}
  >
    <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-indigo-50 scale-110' : ''}`}>
      {React.cloneElement(icon, {
        fill: active ? "currentColor" : "none",
        strokeWidth: active ? 2.5 : 2
      })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
));

NavButton.displayName = 'NavButton';
