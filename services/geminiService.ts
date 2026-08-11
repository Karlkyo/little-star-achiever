import { GoogleGenAI, Modality } from "@google/genai";
import { audioManager } from "../utils/AudioManager";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set GEMINI_API_KEY in .env.local");
  }
  return new GoogleGenAI({ apiKey });
};

// --- 重试工具函数 ---

interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

/**
 * 带指数退避的重试函数
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delayMs: 1000, backoffMultiplier: 2 }
): Promise<T> {
  let lastError: Error;
  const totalAttempts = options.maxRetries + 1;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 如果是最后一次重试，直接抛出错误
      if (attempt === options.maxRetries) {
        break;
      }

      // 计算延迟时间（指数退避）
      const delay = options.delayMs * Math.pow(options.backoffMultiplier, attempt);
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const retryNote = options.maxRetries > 0 ? `（已自动重试${options.maxRetries}次）` : '';
  const finalMessage = lastError?.message ? `${lastError.message}${retryNote}` : `请求失败${retryNote}`;
  const finalError = new Error(finalMessage);
  (finalError as any).attempts = totalAttempts;
  (finalError as any).retryCount = options.maxRetries;
  throw finalError;
}

// --- Audio Context Management ---

/**
 * 确保音频上下文已准备好（需要用户交互）
 */
export const ensureAudioContextReady = async (): Promise<void> => {
  try {
    await audioManager.ensureReady();
  } catch (error) {
    console.error('Failed to initialize audio context:', error);
    throw error;
  }
};

// --- Text Generation (Parent Coach) ---

const generateJSON = async (prompt: string): Promise<string> => {
  return retryWithBackoff(async () => {
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text || text.trim() === '') {
        throw new Error('AI 返回了空响应');
      }

      return text;
    } catch (error) {
      console.error("Gemini Suggestion Error:", error);

      // 区分不同类型的错误
      if (error instanceof Error) {
        if (error.message.includes('API')) {
          throw new Error('API 调用失败，请检查 API Key 是否正确');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('网络连接失败，请检查网络');
        }
      }

      throw error;
    }
  }, { maxRetries: 2, delayMs: 1000, backoffMultiplier: 2 });
};

export const getBehaviorSuggestions = async (situation: string, childAge: number = 3): Promise<string> => {
  if (!situation || situation.trim().length === 0) {
    throw new Error('请输入具体情况');
  }

  if (situation.trim().length > 500) {
    throw new Error('输入内容过长，请简化描述（最多500字）');
  }

  const prompt = `
    I have a ${childAge}-year-old child.
    Situation: "${situation}".
    Suggest 3 simple positive reinforcement "rules/tasks".
    Please return the content in Simplified Chinese (Mandarin).
    Return JSON: [{"title": "Task Name in Chinese", "emoji": "🌟", "stars": 1, "reason": "brief reason in Chinese"}]
  `;
  return generateJSON(prompt);
};

export const getRewardSuggestions = async (interest: string, childAge: number = 3): Promise<string> => {
  if (!interest || interest.trim().length === 0) {
    throw new Error('请输入孩子的兴趣');
  }

  if (interest.trim().length > 500) {
    throw new Error('输入内容过长，请简化描述（最多500字）');
  }

  const prompt = `
    I have a ${childAge}-year-old child who likes "${interest}".
    Suggest 3 diverse rewards (material, experience, or affection).
    Please return the content in Simplified Chinese (Mandarin).
    Return JSON: [{"title": "Reward Name in Chinese", "emoji": "🎁", "cost": 5, "type": "material" | "experience" | "affection", "reason": "brief reason in Chinese"}]
  `;
  return generateJSON(prompt);
};

export const getCalmDownSuggestions = async (trigger: string, childAge: number = 3): Promise<string> => {
  if (!trigger || trigger.trim().length === 0) {
    throw new Error('请输入触发情绪的原因');
  }

  if (trigger.trim().length > 500) {
    throw new Error('输入内容过长，请简化描述（最多500字）');
  }

  const prompt = `
    I have a ${childAge}-year-old child. They are upset because: "${trigger}".
    Suggest 3 simple "calm down" activities or games we can do in a "quiet corner".
    Please return the content in Simplified Chinese (Mandarin).
    Return JSON: [{"title": "Activity Name in Chinese", "emoji": "🧘", "description": "Simple instruction for child in Chinese"}]
  `;
  return generateJSON(prompt);
};

// --- Audio Generation (TTS Cheerleader) ---

/**
 * 解码 Base64 音频数据为 AudioBuffer
 */
const decodeAudioData = async (
  base64String: string,
  ctx: AudioContext
): Promise<AudioBuffer> => {
  try {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const dataInt16 = new Int16Array(bytes.buffer);
    const numChannels = 1;
    const sampleRate = 24000;

    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    return buffer;
  } catch (error) {
    console.error('Audio decoding failed:', error);
    throw new Error('音频解码失败');
  }
};

/**
 * 播放 AI 语音鼓励
 */
export const playEncouragement = async (
  childName: string,
  taskName: string,
  isTest: boolean = false
): Promise<void> => {
  return retryWithBackoff(async () => {
    try {
      // 确保音频上下文已就绪
      await ensureAudioContextReady();

      const ai = getAIClient();
      let promptText = "";

      if (isTest) {
        promptText = `Say "Hello ${childName}, the audio test is successful!" in Simplified Chinese enthusiastically.`;
      } else {
        promptText = `
          You are a cheerful encouraging parent assistant.
          Say a very short (max 3 seconds) congratulations to 3-year-old ${childName} for "${taskName}".
          Speak in Simplified Chinese.
          Example: "Wow, ${childName}, you brushed your teeth! Great job!" (but in Chinese).
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("AI 没有返回音频数据");
      }

      // 使用 AudioManager 的 AudioContext
      const ctx = audioManager.getAudioContext();
      const audioBuffer = await decodeAudioData(base64Audio, ctx);

      // 通过 AudioManager 播放（带队列管理）
      await audioManager.play(audioBuffer, 0);

    } catch (error) {
      console.error("Gemini TTS Error:", error);

      // 提供更友好的错误提示
      if (error instanceof Error) {
        if (error.message.includes('API')) {
          throw new Error('语音生成失败：API 密钥错误');
        } else if (error.message.includes('network')) {
          throw new Error('语音生成失败：网络连接问题');
        } else if (error.message.includes('音频')) {
          throw new Error('语音播放失败：' + error.message);
        }
      }

      throw new Error('语音播放失败，请稍后再试');
    }
  }, { maxRetries: 1, delayMs: 1000, backoffMultiplier: 1 });
};
