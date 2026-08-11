import React, { useState, useCallback, useRef } from 'react';
import { getBehaviorSuggestions, getRewardSuggestions, getCalmDownSuggestions, playEncouragement } from '../services/geminiService';
import { Task, Reward, CalmDownActivity, UserSettings } from '../types';
import { Loader2, Plus, Sparkles, Heart, Brain, Zap, Volume2, Download, Upload } from 'lucide-react';
import { exportAppData, importAppData, applyImportedData } from '../utils/dataBackup';

interface ParentZoneProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onAddTask: (t: Task) => void;
  onAddReward: (r: Reward) => void;
  onAddCalmActivity: (a: CalmDownActivity) => void;
}

type AI_MODE = 'TASK' | 'REWARD' | 'CALM';

interface AISuggestion {
  title: string;
  emoji: string;
  stars?: number;
  cost?: number;
  type?: Reward['type'];
  reason?: string;
  description?: string;
}

const isAISuggestion = (value: unknown): value is AISuggestion => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.title === 'string' && typeof candidate.emoji === 'string';
};

export const ParentZone = React.memo<ParentZoneProps>(({ 
  settings, 
  onUpdateSettings, 
  onAddTask,
  onAddReward,
  onAddCalmActivity 
}) => {
  const [mode, setMode] = useState<AI_MODE>('TASK');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{ mode: AI_MODE; input: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getErrorHint = useCallback((message: string) => {
    if (message.includes('API')) return '请检查 .env.local 中的 GEMINI_API_KEY 是否正确';
    if (message.includes('网络')) return '请检查网络后重试';
    if (message.includes('解析') || message.includes('JSON')) return 'AI 返回格式异常，建议重试';
    return '可以稍后再试或点击重试';
  }, []);

  const fetchSuggestions = useCallback(async (nextMode: AI_MODE, nextInput: string) => {
    if (!nextInput.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setErrorMessage(null);
    setErrorHint(null);
    setLastRequest({ mode: nextMode, input: nextInput });
    try {
      let responseStr = '';
      if (nextMode === 'TASK') responseStr = await getBehaviorSuggestions(nextInput);
      if (nextMode === 'REWARD') responseStr = await getRewardSuggestions(nextInput);
      if (nextMode === 'CALM') responseStr = await getCalmDownSuggestions(nextInput);

      const cleanJson = responseStr.replace(/```json/g, '').replace(/```/g, '');
      const data: unknown = JSON.parse(cleanJson);
      if (!Array.isArray(data)) {
        throw new Error('AI 返回格式异常，请重试');
      }
      const validSuggestions = data.filter(isAISuggestion);
      if (validSuggestions.length === 0) {
        throw new Error('AI 没有返回可用建议，请重试');
      }
      setSuggestions(validSuggestions);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "AI 助手正在休息，请稍后再试";
      setErrorMessage(errorMsg);
      setErrorHint(getErrorHint(errorMsg));
      console.error('AI suggestion error:', e);
    } finally {
      setLoading(false);
    }
  }, [getErrorHint]);

  const handleGetAdvice = useCallback(async () => {
    if (!input.trim()) return;
    await fetchSuggestions(mode, input);
  }, [fetchSuggestions, input, mode]);

  const handleRetry = useCallback(async () => {
    if (!lastRequest) return;
    setMode(lastRequest.mode);
    setInput(lastRequest.input);
    await fetchSuggestions(lastRequest.mode, lastRequest.input);
  }, [fetchSuggestions, lastRequest]);

  const handleTestVoice = useCallback(async () => {
    if (testingVoice) return;
    setTestingVoice(true);
    setErrorMessage(null);
    setErrorHint(null);
    try {
      await playEncouragement(settings.childName, "Test", true);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "语音测试失败";
      setErrorMessage(errorMsg);
      setErrorHint(getErrorHint(errorMsg));
    } finally {
      setTestingVoice(false);
    }
  }, [testingVoice, settings.childName, getErrorHint]);

  const handleAdd = useCallback((item: AISuggestion) => {
    if (mode === 'TASK') {
      onAddTask({
        id: Date.now().toString(),
        title: item.title,
        emoji: item.emoji,
        stars: Math.max(1, Math.min(5, item.stars || 1)),
        category: 'behavior'
      });
    } else if (mode === 'REWARD') {
      onAddReward({
        id: Date.now().toString(),
        title: item.title,
        emoji: item.emoji,
        cost: Math.max(1, Math.min(100, item.cost || 5)),
        type: item.type === 'experience' || item.type === 'affection' || item.type === 'privilege'
          ? item.type
          : 'material'
      });
    } else if (mode === 'CALM') {
      onAddCalmActivity({
        id: Date.now().toString(),
        title: item.title,
        emoji: item.emoji,
        description: item.description || '一起慢慢呼吸，等心情平静下来。'
      });
    }
    setSuggestions(prev => prev.filter(s => s !== item));
  }, [mode, onAddTask, onAddReward, onAddCalmActivity]);

  const getPlaceholder = () => {
    if (mode === 'TASK') return "遇到什么行为问题？(如：不肯吃饭、打人)";
    if (mode === 'REWARD') return "孩子喜欢什么？(如：恐龙、艾莎公主)";
    if (mode === 'CALM') return "为什么发脾气？(如：不想分享、睡觉困难)";
    return "";
  };

  const handleExport = useCallback(() => {
    try {
      exportAppData();
      setErrorMessage(null);
      // Show success message temporarily
      const originalError = errorMessage;
      setErrorMessage('✅ 数据导出成功！');
      setTimeout(() => setErrorMessage(originalError), 3000);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "数据导出失败";
      setErrorMessage(errorMsg);
    }
  }, [errorMessage]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const data = await importAppData(file);

      if (confirm(`确定要导入备份数据吗？\n\n备份时间: ${new Date(data.exportDate).toLocaleString()}\n任务数量: ${data.tasks.length}\n奖励数量: ${data.rewards.length}\n\n当前数据将被覆盖！`)) {
        applyImportedData(data);
        setErrorMessage('✅ 数据导入成功！请刷新页面查看。');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "数据导入失败";
      setErrorMessage(errorMsg);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-100">
        <h3 className="text-xl font-bold text-purple-800 mb-4">设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">宝贝昵称</label>
            <input
              type="text"
              value={settings.childName}
              onChange={(e) => {
                const newValue = e.target.value.slice(0, 20);
                onUpdateSettings({...settings, childName: newValue});
              }}
              maxLength={20}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-400"
              placeholder="例如：宝宝"
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings.childName.length}/20 字符
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <input 
                type="checkbox"
                id="voiceToggle"
                checked={settings.voiceEnabled}
                onChange={(e) => onUpdateSettings({...settings, voiceEnabled: e.target.checked})}
                className="w-5 h-5 text-purple-600 rounded"
               />
               <label htmlFor="voiceToggle" className="text-gray-700">启用 AI 语音鼓励</label>
            </div>
            {settings.voiceEnabled && (
              <button 
                onClick={handleTestVoice}
                disabled={testingVoice}
                className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 disabled:opacity-50"
              >
                {testingVoice ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                测试语音
              </button>
            )}
          </div>
        </div>

        {/* Data Backup Section */}
        <div className="mt-6 pt-6 border-t border-purple-100">
          <h4 className="text-sm font-bold text-purple-700 mb-3">数据备份</h4>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-200 transition-colors"
            >
              <Download size={18} />
              导出数据
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-2.5 rounded-xl font-bold hover:bg-green-200 transition-colors"
            >
              <Upload size={18} />
              导入数据
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 定期备份数据，避免数据丢失
          </p>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
          <Sparkles className="text-yellow-500" />
          AI 育儿助手
        </h3>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button 
            onClick={() => { setMode('TASK'); setSuggestions([]); setInput(''); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 whitespace-nowrap ${mode === 'TASK' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
          >
            <Zap size={14} /> 新任务
          </button>
          <button 
            onClick={() => { setMode('REWARD'); setSuggestions([]); setInput(''); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 whitespace-nowrap ${mode === 'REWARD' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}
          >
            <Heart size={14} /> 奖励灵感
          </button>
          <button 
            onClick={() => { setMode('CALM'); setSuggestions([]); setInput(''); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 whitespace-nowrap ${mode === 'CALM' ? 'bg-teal-500 text-white' : 'bg-white text-gray-600'}`}
          >
            <Brain size={14} /> 冷静角
          </button>
        </div>
        
        <div className="flex gap-2 mb-6">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 p-3 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-400"
          />
          <button 
            onClick={handleGetAdvice}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader2 className="animate-spin" /> : '询问 AI'}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div>⚠️ {errorMessage}</div>
                {errorHint && <div className="text-xs text-red-600 mt-1">{errorHint}</div>}
              </div>
              {lastRequest && (
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap disabled:opacity-60"
                >
                  {loading ? '重试中...' : '重试'}
                </button>
              )}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-bold text-gray-800">{s.title}</span>
                    {s.stars && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold">+{s.stars} 星</span>}
                    {s.cost && <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-bold">-{s.cost}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.reason || s.description}</p>
                </div>
                <button 
                  onClick={() => handleAdd(s)}
                  className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ParentZone.displayName = 'ParentZone';
