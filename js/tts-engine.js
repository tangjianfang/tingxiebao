/**
 * 小学生听写宝 — 教育级 TTS 语音引擎
 * 
 * 核心设计原则：
 * 1. 智能中文女声优先选择（普通话标准发音）
 * 2. 多浏览器兼容：Chrome/Edge/Safari/Firefox
 * 3. 朗读频率控制防止语音重叠
 * 4. 教育模式：清晰 > 自然，速度可调
 * 5. 降级策略：浏览器TTS → 提示用户安装TTS
 */

class TTSEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.85;          // 默认语速（教育模式偏慢）
    this.pitch = 1.0;          // 音调
    this.volume = 1.0;
    this.wordRate = 0.75;      // 朗读词语时更慢
    this.sentenceRate = 0.90;  // 朗读例句时稍快
    this.repeatRate = 0.70;    // 复读时更慢更清晰
    this._speaking = false;
    this._queue = [];
    this._paused = false;
    this._currentUtterance = null;
    this.onStateChange = null; // 状态变化回调
    this.onWordStart = null;
    this.onWordEnd = null;
    this._retryCount = 0;
    this._init();
  }

  _init() {
    if (!this.synth) {
      console.warn('[TTS] 浏览器不支持 Web Speech API');
      return;
    }

    // Chrome/Edge 需要等待 onvoiceschanged 事件
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      this._selectBestVoice();
    };

    loadVoices();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }

    // 后备：延迟加载（某些浏览器延迟触发）
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1500);
  }

  /**
   * 智能选择最佳中文女声
   * 优先级：
   * 1. 微软 Xiaoxiao/Xiaoyi (Edge 高质量神经语音)
   * 2. Google 普通话女声
   * 3. 系统中文女声
   * 4. 任何中文声音
   * 5. 降级到默认
   */
  _selectBestVoice(preferName = null) {
    if (!this.voices.length) return;

    const chineseVoices = this.voices.filter(v =>
      v.lang.startsWith('zh') || v.lang.includes('cmn')
    );

    // 如果用户指定了声音名称
    if (preferName) {
      const named = chineseVoices.find(v => v.name === preferName);
      if (named) { this.selectedVoice = named; return named; }
    }

    // 优先级规则
    const PRIORITY_PATTERNS = [
      // Edge / Windows 神经语音
      v => /Microsoft.*Xiaoxiao/i.test(v.name),
      v => /Microsoft.*Xiaoyi/i.test(v.name),
      v => /Microsoft.*Xiaomo/i.test(v.name),
      v => /Microsoft.*Yunxi/i.test(v.name),
      v => /Microsoft.*Yun/i.test(v.name) && v.lang.startsWith('zh'),
      // macOS
      v => /Tingting|Meijia/i.test(v.name),
      // Google
      v => /Google.*Chinese.*Female/i.test(v.name),
      v => /Google.*Mandarin/i.test(v.name),
      // 通用中文女声
      v => chineseVoices.includes(v) && /female|woman|girl|xiao|fang|ting/i.test(v.name),
      // 任意在线中文声音（在线通常更自然）
      v => chineseVoices.includes(v) && !v.localService,
      // 任意中文声音
      v => chineseVoices.includes(v),
    ];

    for (const pattern of PRIORITY_PATTERNS) {
      const match = this.voices.find(pattern);
      if (match) {
        this.selectedVoice = match;
        return match;
      }
    }

    // 最终降级：使用任何声音
    this.selectedVoice = this.voices[0] || null;
    return this.selectedVoice;
  }

  /** 获取所有可用中文声音列表 */
  getChineseVoices() {
    return this.voices.filter(v =>
      v.lang.startsWith('zh') || v.lang.includes('cmn') || v.lang.includes('yue')
    );
  }

  /** 是否支持TTS */
  isSupported() {
    return !!this.synth && this.voices.length > 0;
  }

  /** 是否有中文声音 */
  hasChinese() {
    return this.getChineseVoices().length > 0;
  }

  /**
   * 核心朗读方法
   * @param {string} text - 要朗读的文字
   * @param {object} options - { rate, pitch, volume, mode }
   * @returns {Promise<void>}
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) { resolve(); return; }

      // 清理文字（去除多余空格，保留标点）
      const cleanText = text.replace(/\s+/g, ' ').trim();
      if (!cleanText) { resolve(); return; }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // 根据模式设置语速
      const modeRates = {
        word:     this.wordRate,
        sentence: this.sentenceRate,
        repeat:   this.repeatRate,
        announce: this.rate,
        slow:     0.65,
        normal:   this.rate,
      };
      utterance.rate   = options.rate   ?? modeRates[options.mode] ?? this.rate;
      utterance.pitch  = options.pitch  ?? this.pitch;
      utterance.volume = options.volume ?? this.volume;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang  = this.selectedVoice.lang;
      } else {
        utterance.lang = 'zh-CN';
      }

      this._currentUtterance = utterance;
      this._speaking = true;

      utterance.onstart = () => {
        this._speaking = true;
        this.onStateChange?.('speaking', cleanText);
        if (options.mode === 'word') this.onWordStart?.(cleanText);
      };

      utterance.onend = () => {
        this._speaking = false;
        this._currentUtterance = null;
        if (options.mode === 'word') this.onWordEnd?.(cleanText);
        this.onStateChange?.('idle', '');
        resolve();
      };

      utterance.onerror = (e) => {
        this._speaking = false;
        // 忽略 'interrupted' 错误（主动停止）
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          console.warn('[TTS] 朗读错误:', e.error, cleanText);
          resolve(); // 出错时也resolve，避免阻塞听写流程
        }
      };

      // Chrome 有时卡死，需要先取消
      if (this.synth.speaking) {
        this.synth.cancel();
        // 短暂延迟再开始
        setTimeout(() => this.synth.speak(utterance), 80);
      } else {
        this.synth.speak(utterance);
      }
    });
  }

  /** 停止朗读 */
  stop() {
    this._paused = false;
    this._speaking = false;
    this.synth?.cancel();
    this.onStateChange?.('stopped', '');
  }

  /** 暂停 */
  pause() {
    if (this.synth?.speaking && !this._paused) {
      this.synth.pause();
      this._paused = true;
      this.onStateChange?.('paused', '');
    }
  }

  /** 恢复 */
  resume() {
    if (this._paused) {
      this.synth?.resume();
      this._paused = false;
      this.onStateChange?.('speaking', '');
    }
  }

  get isSpeaking() { return this._speaking; }
  get isPaused()   { return this._paused; }

  /** 等待指定毫秒 */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 朗读词语（带前后停顿）
   * 专为教育听写优化的朗读序列
   */
  async speakWord(word) {
    await this.speak(word, { mode: 'word' });
  }

  async speakSentence(sentence) {
    await this.speak(sentence, { mode: 'sentence' });
  }

  async speakAnnounce(text) {
    await this.speak(text, { mode: 'announce' });
  }

  async speakRepeat(word) {
    await this.speak(word, { mode: 'repeat' });
  }

  /** 更新语速设置 */
  setRate(rate) {
    this.rate = parseFloat(rate);
    this.wordRate = this.rate * 0.88;
    this.sentenceRate = this.rate * 1.05;
    this.repeatRate = this.rate * 0.82;
  }

  /** 设置声音 */
  setVoice(voiceName) {
    this._selectBestVoice(voiceName);
  }

  /** 测试朗读 */
  async test() {
    await this.speak('你好，我是你的听写助手，请同学们准备好本子和笔。', { mode: 'announce' });
  }
}

// 全局单例
window.ttsEngine = new TTSEngine();
