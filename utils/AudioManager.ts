/**
 * AudioManager - 管理音频播放队列和 AudioContext 生命周期
 * 防止多次点击导致音频重叠，提供更好的错误处理
 */

interface AudioTask {
  id: string;
  audioBuffer: AudioBuffer;
  priority: number;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private queue: AudioTask[] = [];
  private isProcessing: boolean = false;

  /**
   * 获取或创建 AudioContext
   */
  getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 24000 });
    }
    return this.audioContext;
  }

  /**
   * 确保 AudioContext 已准备就绪（需要用户交互解锁）
   */
  async ensureReady(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        throw new Error('无法初始化音频系统，请检查浏览器权限');
      }
    }
  }

  /**
   * 播放音频缓冲区
   */
  async play(audioBuffer: AudioBuffer, priority: number = 0): Promise<void> {
    try {
      await this.ensureReady();

      // 如果正在播放且新任务优先级不高，加入队列
      if (this.isPlaying && priority <= 0) {
        this.addToQueue(audioBuffer, priority);
        return;
      }

      // 如果优先级高，停止当前播放
      if (this.isPlaying && priority > 0) {
        this.stop();
      }

      await this.playImmediately(audioBuffer);
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  /**
   * 立即播放音频
   */
  private async playImmediately(audioBuffer: AudioBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ctx = this.getAudioContext();
        const source = ctx.createBufferSource();

        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        this.currentSource = source;
        this.isPlaying = true;

        source.onended = () => {
          this.isPlaying = false;
          this.currentSource = null;
          this.processQueue(); // 处理队列中的下一个任务
          resolve();
        };

        source.start(0);
      } catch (error) {
        this.isPlaying = false;
        this.currentSource = null;
        reject(error);
      }
    });
  }

  /**
   * 添加到播放队列
   */
  private addToQueue(audioBuffer: AudioBuffer, priority: number): void {
    const task: AudioTask = {
      id: Date.now().toString() + Math.random(),
      audioBuffer,
      priority
    };

    // 按优先级插入队列
    const index = this.queue.findIndex(t => t.priority < priority);
    if (index === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(index, 0, task);
    }

    // 限制队列长度，避免堆积
    if (this.queue.length > 5) {
      this.queue = this.queue.slice(0, 5);
    }
  }

  /**
   * 处理队列中的下一个任务
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || this.isPlaying) {
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    if (task) {
      try {
        await this.playImmediately(task.audioBuffer);
      } catch (error) {
        console.error('Error processing audio queue:', error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * 停止当前播放
   */
  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (error) {
        // 已经停止或已断开连接，忽略错误
        console.warn('Error stopping audio source:', error);
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * 获取播放状态
   */
  getPlayingState(): boolean {
    return this.isPlaying;
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 销毁 AudioContext（清理资源）
   */
  async dispose(): Promise<void> {
    this.stop();
    this.clearQueue();

    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.warn('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }
  }
}

// 单例模式导出
export const audioManager = new AudioManager();
