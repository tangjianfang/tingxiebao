/**
 * 小学生听写宝 — 听写节奏引擎
 *
 * 还原真实课堂老师听写流程：
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  [准备] "同学们，现在开始听写…"                      │
 * ├─────────────────────────────────────────────────────┤
 * │  每个词语流程：                                      │
 * │  1. 报号   → "第X个词语"                            │
 * │  2. 初读   → 朗读词语（稍慢）                        │
 * │  3. 例句   → "请听例句：…"（配上下文理解）           │
 * │  4. 循环   → 按设置重复朗读词语                      │
 * │  5. 等待   → [倒计时 — 按字数动态调整]               │
 * ├─────────────────────────────────────────────────────┤
 * │  [结束] "听写结束，请同学们停笔…"                    │
 * └─────────────────────────────────────────────────────┘
 *
 * 节拍可配置：间隔、是否朗读例句、重复次数、等待时间
 */

class DictationRhythm {
  constructor(ttsEngine) {
    this.tts = ttsEngine;
    this.words = [];
    this.currentIndex = -1;
    this._running = false;
    this._paused = false;
    this._stopped = false;
    this._pauseResolve = null;

    // 节奏配置
    this.config = {
      readSentence:    true,   // 是否朗读例句
      readCompound:    true,   // 是否组词朗读（字→组词交替）
      intraRepeatCount: 3,     // 每个词总共朗读几遍
      intraRepeatGap:   3000,  // 同一个词两次朗读之间的间隔（ms）
      waitPerChar:     800,    // 每个字的等待时间（ms）
      minWordInterval: 20000,  // 每个词语至少保留的书写时间（ms）
      minWaitTime:     2500,   // 最短等待时间（ms）
      maxWaitTime:     8000,   // 最长等待时间（ms）
      gapBetweenWords: 600,    // 词语之间的间隙（ms）
      announceIntro:   true,   // 是否朗读开场白
      announceOutro:   true,   // 是否朗读结束语
      showWordOnStage: false,  // 是否在听写时显示词语（练习模式）
      numberStyle:     'full', // 'full' | 'short' — 报号方式
    };

    // 回调
    this.onStart      = null; // 听写开始
    this.onWordBegin  = null; // 当前词语开始 (index, word)
    this.onPhaseChange = null; // 阶段变化 (phase: 'number'|'word'|'sentence'|'repeat'|'wait')
    this.onWaitTick   = null; // 等待倒计时 (remaining_ms)
    this.onWordDone   = null; // 当前词语结束 (index)
    this.onFinish     = null; // 全部完成
    this.onPause      = null;
    this.onResume     = null;
    this.onStop       = null;

    // 统计
    this.stats = {
      startTime: null,
      endTime: null,
      totalWords: 0,
    };
  }

  /** 更新节奏配置 */
  setConfig(cfg) {
    Object.assign(this.config, cfg);
  }

  /** 设置词语列表 */
  setWords(words) {
    this.words = words;
    this.currentIndex = -1;
    this.stats.totalWords = words.length;
  }

  /** 计算该词语需要等待多少毫秒（智能动态等待）*/
  _calcWaitTime(word) {
    const charCount = word.length;
    // 基础等待：每字 waitPerChar ms + 基础 buffer
    let waitMs = charCount * this.config.waitPerChar + 1200;
    // 如果有例句，再加一点点思考时间
    waitMs = Math.max(waitMs, this.config.minWaitTime);
    waitMs = Math.max(waitMs, this.config.minWordInterval || 0);
    waitMs = Math.min(waitMs, Math.max(this.config.maxWaitTime, this.config.minWordInterval || 0));
    return waitMs;
  }

  /** 生成报号文字 */
  _buildNumberText(index, total) {
    const n = index + 1;
    const cnNumbers = ['一','二','三','四','五','六','七','八','九','十',
                       '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                       '二十一','二十二','二十三','二十四','二十五'];
    const cnN = cnNumbers[n - 1] || String(n);

    if (this.config.numberStyle === 'short') {
      return `第${cnN}个`;
    }
    return `第${cnN}个词语`;
  }

  /** 暂停辅助 */
  async _checkPause() {
    if (this._stopped) throw new Error('STOPPED');
    if (this._paused) {
      this.onPause?.();
      await new Promise(resolve => { this._pauseResolve = resolve; });
      this.onResume?.();
    }
    if (this._stopped) throw new Error('STOPPED');
  }

  /** 等待 + 倒计时回调 + 支持暂停 */
  async _waitWithTick(ms) {
    const step = 200;
    let remaining = ms;
    while (remaining > 0) {
      await this._checkPause();
      if (this._stopped) return;
      const sleepTime = Math.min(step, remaining);
      await new Promise(r => setTimeout(r, sleepTime));
      remaining -= sleepTime;
      this.onWaitTick?.(Math.ceil(remaining / 1000));
    }
  }

  /**
   * 开始听写
   * @param {Array} words - 词语列表（可选，也可先调用 setWords）
   */
  async start(words = null) {
    if (words) this.setWords(words);
    if (!this.words.length) return;

    this._running = true;
    this._paused = false;
    this._stopped = false;
    this.currentIndex = -1;
    this.stats.startTime = Date.now();

    this.onStart?.();

    try {
      // ── 1. 开场白 ──────────────────────────────────────────
      if (this.config.announceIntro) {
        this.onPhaseChange?.('intro');
        const intro = `同学们，现在开始听写，共${this.words.length}个词语，请拿好本子和笔。`;
        await this.tts.speakAnnounce(intro);
        await this._checkPause();
        await this.tts.wait(800);
      }

      // ── 2. 逐词听写 ────────────────────────────────────────
      for (let i = 0; i < this.words.length; i++) {
        await this._checkPause();
        if (this._stopped) break;

        this.currentIndex = i;
        const item = this.words[i];
        this.onWordBegin?.(i, item);

        // 2a. 报号
        this.onPhaseChange?.('number');
        const numText = this._buildNumberText(i, this.words.length);
        await this.tts.speakAnnounce(numText);
        await this.tts.wait(400);
        await this._checkPause();

        // 2b. 初读词语
        this.onPhaseChange?.('word');
        await this.tts.speakWord(item.word);
        await this.tts.wait(300);
        await this._checkPause();

        // 2b2. 组词朗读（可选）
        if (this.config.readCompound && item.compound) {
          this.onPhaseChange?.('compound');
          await this.tts.wait(400);
          await this.tts.speakWord(item.compound);
          await this.tts.wait(300);
          await this._checkPause();
        }

        // 2c. 例句（可选）
        if (this.config.readSentence && item.sentence) {
          this.onPhaseChange?.('sentence');
          await this.tts.speak('请听例句：', { mode: 'announce' });
          await this.tts.wait(200);
          await this.tts.speakSentence(item.sentence);
          await this.tts.wait(600);
          await this._checkPause();
        }

        // 2d. 同词循环朗读（可配置总次数与间隔）
        const totalReads = Math.max(1, parseInt(this.config.intraRepeatCount, 10) || 1);
        const intraGap = Math.max(0, parseInt(this.config.intraRepeatGap, 10) || 0);

        for (let r = 1; r < totalReads; r++) {
          this.onPhaseChange?.('repeat');
          await this.tts.wait(intraGap);
          await this._checkPause();
          await this.tts.speakRepeat(item.word);
          await this.tts.wait(200);
          await this._checkPause();

          // 组词朗读（可选）
          if (this.config.readCompound && item.compound) {
            this.onPhaseChange?.('compound');
            await this.tts.wait(400);
            await this.tts.speakWord(item.compound);
            await this.tts.wait(300);
            await this._checkPause();
          }
        }

        // 2e. 等待书写
        this.onPhaseChange?.('wait');
        const waitMs = this._calcWaitTime(item.word);
        await this._waitWithTick(waitMs);
        await this._checkPause();

        // 词语完成
        this.onWordDone?.(i, item);

        // 词语间隔
        if (i < this.words.length - 1) {
          this.onPhaseChange?.('gap');
          await this.tts.wait(this.config.gapBetweenWords);
        }
      }

      if (!this._stopped) {
        // ── 3. 结束语 ───────────────────────────────────────
        if (this.config.announceOutro) {
          this.onPhaseChange?.('outro');
          await this.tts.speakAnnounce('听写结束，请同学们停笔，我们来核对答案。');
        }

        this.stats.endTime = Date.now();
        this._running = false;
        this.onFinish?.();
      }

    } catch (e) {
      if (e.message === 'STOPPED') {
        this._running = false;
        this.tts.stop();
        this.onStop?.();
      } else {
        console.error('[DictationRhythm] 错误:', e);
        this._running = false;
      }
    }
  }

  /** 暂停听写 */
  pause() {
    if (this._running && !this._paused) {
      this._paused = true;
      this.tts.pause();
      // onPause 会在 _checkPause 中调用
    }
  }

  /** 恢复听写 */
  resume() {
    if (this._paused) {
      this._paused = false;
      this.tts.resume();
      this._pauseResolve?.();
      this._pauseResolve = null;
    }
  }

  /** 停止听写 */
  stop() {
    this._stopped = true;
    this._paused = false;
    this._running = false;
    this.tts.stop();
    this._pauseResolve?.();
    this._pauseResolve = null;
  }

  /** 跳过当前词语（立即进入下一个）*/
  skip() {
    // 停止当前语音，等待结束后自动继续
    this.tts.stop();
  }

  get isRunning() { return this._running; }
  get isPaused()  { return this._paused; }
  get isStopped() { return this._stopped; }
  get progress()  {
    if (!this.words.length) return 0;
    return (this.currentIndex + 1) / this.words.length;
  }

  /** 获取总用时（秒）*/
  get elapsed() {
    if (!this.stats.startTime) return 0;
    const end = this.stats.endTime || Date.now();
    return Math.round((end - this.stats.startTime) / 1000);
  }
}

// ── 阶段信息映射（用于UI显示）──
const PHASE_INFO = {
  intro:    { label: '开场白', icon: '📢', color: '#4f7ef8' },
  number:   { label: '报题号', icon: '🔢', color: '#64748b' },
  word:     { label: '朗读词语', icon: '🔊', color: '#f5a623' },
  sentence: { label: '朗读例句', icon: '📖', color: '#60a5fa' },
  compound: { label: '组词朗读', icon: '🔤', color: '#7c3aed' },
  repeat:   { label: '复读词语', icon: '🔁', color: '#ff7043' },
  wait:     { label: '书写等待', icon: '✍️', color: '#26a65b' },
  gap:      { label: '间隔', icon: '⏱️', color: '#94a3b8' },
  outro:    { label: '结束', icon: '🎉', color: '#7c3aed' },
};

window.DictationRhythm = DictationRhythm;
window.PHASE_INFO = PHASE_INFO;
