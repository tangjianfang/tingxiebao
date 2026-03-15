/**
 * 小学生听写宝 — 主控制器 (app.js)
 * 负责UI状态管理、事件绑定、模块协调
 */

// ════════════════════════════════════════════════════════
// 全局应用状态
// ════════════════════════════════════════════════════════
const STORAGE_KEYS = {
  settings: 'tingxie_settings',
  customWords: 'tingxie_custom_words',
};

const DEFAULT_SETTINGS = {
  curriculum: 'shenzhen-primary-grade1-semester2',
  theme: 'day',
  grade: 'grade1',
  semester: '2',
  wordSource: 'grade',
  wordCount: 10,
  intraRepeatCount: 3,
  intraRepeatGapSeconds: 3,
  wordIntervalSeconds: 20,
  speed: 0.75,
  readSentence: false,
  readCompound: true,
  waitPerChar: 800,
  scoringMode: 'normal',
  showWordOnStage: false,
  voice: '',
};

const SHARE_URL = 'https://tangjianfang.github.io/tingxiebao/';

const App = {
  // 核心模块
  tts:       null,
  rhythm:    null,

  // 状态
  state: 'idle',    // 'idle' | 'running' | 'paused'
  currentWords: [], // 当前听写词语列表
  customWords:  [], // 用户自定义词语
  currentPhase: '',
  currentWordIndex: -1,
  waitCountdown: 0,

  // 设置（持久化）
  settings: { ...DEFAULT_SETTINGS },
};

// ════════════════════════════════════════════════════════
// 初始化
// ════════════════════════════════════════════════════════
function initApp() {
  App.tts   = window.ttsEngine;
  App.rhythm = new DictationRhythm(App.tts);

  loadSettings();
  applySettings();
  bindEvents();
  renderVoiceList();
  updateBankStats();
  updateWordTagList();
  checkTTSSupport();

  // 设置TTS回调
  App.tts.onStateChange = (state, text) => {
    updateTTSIndicator(state, text);
  };

  // 设置节奏回调
  App.rhythm.onStart = () => {
    App.state = 'running';
    updateControlBar();
    updateProgressBar(0);
    showSection('console');
  };

  App.rhythm.onWordBegin = (index, item) => {
    App.currentWordIndex = index;
    App.waitCountdown = 0;
    updateWordDisplay(item, App.settings.showWordOnStage);
    updateProgressBar(index / App.currentWords.length);
    updateStageCounter(index + 1, App.currentWords.length);
  };

  App.rhythm.onPhaseChange = (phase) => {
    App.currentPhase = phase;
    updateTimeline(phase);
    updateRhythmDots(phase);
    if (phase === 'wait') {
      updateStageStatus('📝 请同学们安静书写');
    } else {
      const info = PHASE_INFO[phase] || {};
      updateStageStatus(`${info.icon || ''} ${info.label || phase}`);
    }
  };

  App.rhythm.onWaitTick = (remaining) => {
    App.waitCountdown = remaining;
    updateStageStatus(`📝 请同学们安静书写，下一题还有 ${remaining}s`);
    updateTimerDisplay(remaining);
  };

  App.rhythm.onWordDone = (index) => {
    updateProgressBar((index + 1) / App.currentWords.length);
  };

  App.rhythm.onFinish = () => {
    App.state = 'idle';
    App.currentPhase = 'outro';
    updateProgressBar(1);
    updateControlBar();
    updateStageStatus('🎉 本轮朗读已完成');
    updateWordDisplay({ word: '本轮完成' }, true);
    updateSentenceDisplay('辛苦了，您可以返回首页再次开始。');
    showToast('本轮朗读已完成，辛苦了', 'success');
    showSection('config');
  };

  App.rhythm.onPause = () => {
    App.state = 'paused';
    updateControlBar();
    updateStageStatus('⏸ 已为您暂停');
    showToast('已暂停朗读', 'info');
  };

  App.rhythm.onResume = () => {
    App.state = 'running';
    updateControlBar();
  };

  App.rhythm.onStop = () => {
    App.state = 'idle';
    updateControlBar();
    showSection('config');
    showToast('已停止本轮朗读', 'info');
  };

  console.log('[App] 初始化完成');
}

// ════════════════════════════════════════════════════════
// 设置管理
// ════════════════════════════════════════════════════════
function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
  } catch (_) {}

  App.customWords = loadCustomWords();

  const migrated = migrateSettings(saved);
  Object.assign(App.settings, DEFAULT_SETTINGS, migrated);

  if (App.settings.wordSource === 'custom' && !App.customWords.length) {
    App.settings.wordSource = 'grade';
  }

  saveSettings();
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(App.settings));
}

function migrateSettings(saved = {}) {
  const next = { ...saved };

  if (!next.curriculum) {
    Object.assign(next, {
      curriculum: DEFAULT_SETTINGS.curriculum,
      theme: DEFAULT_SETTINGS.theme,
      grade: DEFAULT_SETTINGS.grade,
      semester: DEFAULT_SETTINGS.semester,
      wordSource: DEFAULT_SETTINGS.wordSource,
      wordCount: DEFAULT_SETTINGS.wordCount,
      intraRepeatCount: DEFAULT_SETTINGS.intraRepeatCount,
      intraRepeatGapSeconds: DEFAULT_SETTINGS.intraRepeatGapSeconds,
      wordIntervalSeconds: DEFAULT_SETTINGS.wordIntervalSeconds,
      speed: DEFAULT_SETTINGS.speed,
      readSentence: DEFAULT_SETTINGS.readSentence,
      waitPerChar: DEFAULT_SETTINGS.waitPerChar,
      scoringMode: DEFAULT_SETTINGS.scoringMode,
      showWordOnStage: DEFAULT_SETTINGS.showWordOnStage,
    });
  }

  if (typeof next.repeatCount === 'number' && typeof next.intraRepeatCount !== 'number') {
    next.intraRepeatCount = Math.max(1, next.repeatCount + 1);
  }

  return next;
}

function loadCustomWords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.customWords) || '[]');
    return Array.isArray(saved)
      ? saved.filter(item => item && typeof item.word === 'string' && item.word.trim())
      : [];
  } catch (_) {
    return [];
  }
}

function saveCustomWords() {
  localStorage.setItem(STORAGE_KEYS.customWords, JSON.stringify(App.customWords));
}

function applySettings() {
  // 同步到UI
  setVal('word-source', App.settings.wordSource);
  setVal('grade-select', App.settings.grade);
  setVal('semester-select', App.settings.semester);
  setVal('count-input', App.settings.wordCount);
  setVal('intra-repeat-count-input', App.settings.intraRepeatCount);
  setVal('intra-repeat-gap-input', App.settings.intraRepeatGapSeconds);
  setVal('word-interval-input', App.settings.wordIntervalSeconds);
  setVal('speed-range', App.settings.speed);
  syncQuickWordInput();
  const sentenceCheck = document.getElementById('read-sentence');
  if (sentenceCheck) sentenceCheck.checked = App.settings.readSentence;
  const showWordCheck = document.getElementById('show-word');
  if (showWordCheck) showWordCheck.checked = App.settings.showWordOnStage;
  const compoundCheck = document.getElementById('read-compound');
  if (compoundCheck) compoundCheck.checked = App.settings.readCompound !== false;

  document.querySelector('.speed-value').textContent = App.settings.speed;
  App.tts.setRate(App.settings.speed);
  App.tts.setVoice(App.settings.voice || '');
  applyTheme(App.settings.theme || 'day');

  // 应用到节奏引擎
  App.rhythm.setConfig({
    readSentence:    App.settings.readSentence,
    readCompound:    App.settings.readCompound !== false,
    intraRepeatCount: App.settings.intraRepeatCount,
    intraRepeatGap:   App.settings.intraRepeatGapSeconds * 1000,
    waitPerChar:     App.settings.waitPerChar,
    minWordInterval: App.settings.wordIntervalSeconds * 1000,
    showWordOnStage: App.settings.showWordOnStage,
  });

  updateSimplePresetSummary();
}

// ════════════════════════════════════════════════════════
// 事件绑定
// ════════════════════════════════════════════════════════
function bindEvents() {
  // ── 配置区域 ──
  on('word-source', 'change', e => {
    App.settings.wordSource = e.target.value;
    saveSettings();
    updateSimplePresetSummary();
  });

  on('grade-select', 'change', e => {
    App.settings.grade = e.target.value;
    saveSettings();
    updateBankStats();
    updateSimplePresetSummary();
  });

  on('semester-select', 'change', e => {
    App.settings.semester = e.target.value;
    saveSettings();
    updateSimplePresetSummary();
  });

  on('count-input', 'change', e => {
    App.settings.wordCount = Math.min(100, Math.max(1, parseInt(e.target.value) || 10));
    e.target.value = App.settings.wordCount;
    saveSettings();
    updateSimplePresetSummary();
  });

  on('intra-repeat-count-input', 'change', e => {
    App.settings.intraRepeatCount = Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 3));
    e.target.value = App.settings.intraRepeatCount;
    App.rhythm.setConfig({ intraRepeatCount: App.settings.intraRepeatCount });
    saveSettings();
    updateSimplePresetSummary();
  });

  on('intra-repeat-gap-input', 'change', e => {
    App.settings.intraRepeatGapSeconds = Math.min(15, Math.max(1, parseInt(e.target.value, 10) || 3));
    e.target.value = App.settings.intraRepeatGapSeconds;
    App.rhythm.setConfig({ intraRepeatGap: App.settings.intraRepeatGapSeconds * 1000 });
    saveSettings();
    updateSimplePresetSummary();
  });

  on('word-interval-input', 'change', e => {
    App.settings.wordIntervalSeconds = Math.min(60, Math.max(5, parseInt(e.target.value, 10) || 20));
    e.target.value = App.settings.wordIntervalSeconds;
    App.rhythm.setConfig({ minWordInterval: App.settings.wordIntervalSeconds * 1000 });
    saveSettings();
    updateSimplePresetSummary();
  });

  on('speed-range', 'input', e => {
    const v = parseFloat(e.target.value);
    App.settings.speed = v;
    document.querySelector('.speed-value').textContent = v.toFixed(2);
    App.tts.setRate(v);
    saveSettings();
  });

  on('read-sentence', 'change', e => {
    App.settings.readSentence = e.target.checked;
    App.rhythm.setConfig({ readSentence: e.target.checked });
    saveSettings();
    updateSimplePresetSummary();
  });

  on('show-word', 'change', e => {
    App.settings.showWordOnStage = e.target.checked;
    App.rhythm.setConfig({ showWordOnStage: e.target.checked });
    saveSettings();
    updateSimplePresetSummary();
  });

  on('read-compound', 'change', e => {
    App.settings.readCompound = e.target.checked;
    App.rhythm.setConfig({ readCompound: e.target.checked });
    saveSettings();
  });

  document.querySelectorAll('[data-theme-value]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeValue || 'day');
      saveSettings();
    });
  });

  // ── 主控按钮 ──
  on('btn-start', 'click', handleStart);
  on('btn-pause', 'click', handlePause);
  on('btn-resume', 'click', handleResume);
  on('btn-stop', 'click', handleStop);
  on('btn-test-tts', 'click', () => App.tts.test());
  on('btn-share-qr', 'click', openQrModal);
  on('btn-close-qr', 'click', closeQrModal);
  on('qr-modal-backdrop', 'click', closeQrModal);
  on('btn-copy-qr-link', 'click', copyShareLink);
  on('btn-open-qr-link', 'click', () => {
    window.open(getShareUrl(), '_blank', 'noopener,noreferrer');
  });

  // ── 批量导入弹窗 ──
  on('btn-close-import', 'click', closeImportModal);
  on('import-modal-backdrop', 'click', closeImportModal);
  on('btn-confirm-import', 'click', confirmImport);
  on('btn-cancel-import', 'click', closeImportModal);

  // ── 侧边栏标签切换 ──
  document.querySelectorAll('.sidebar-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSidebarTab(btn.dataset.sidebarTab);
    });
  });

  // ── 词库 Tab ──
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.style.display = p.id === `tab-${tab}` ? 'block' : 'none';
      });
      if (tab === 'builtin') renderBuiltinWordList();
    });
  });

  // ── 自定义词语 ──
  on('custom-word-input-field', 'keydown', e => {
    if (e.key === 'Enter' || e.key === '，' || e.key === ',') {
      e.preventDefault();
      addCustomWord();
    }
  });
  on('quick-word-input', 'input', syncCustomWordsFromQuickInput);
  on('btn-add-word', 'click', addCustomWord);
  on('btn-import-words', 'click', importWordList);
  on('btn-use-custom', 'click', useCustomWords);
  on('btn-clear-custom', 'click', clearCustomWords);

  // ── 声音选择 ──
  on('voice-select', 'change', e => {
    App.settings.voice = e.target.value;
    App.tts.setVoice(e.target.value);
    saveSettings();
  });

  document.addEventListener('keydown', handleGlobalShortcut);
}

// ════════════════════════════════════════════════════════
// 听写流程
// ════════════════════════════════════════════════════════
async function handleStart() {
  if (App.state === 'running' || App.state === 'paused') return;

  syncCustomWordsFromQuickInput();

  // 准备词语列表
  let words = [];

  if (App.customWords.length > 0 && App.settings.wordSource === 'custom') {
    words = App.customWords.slice(0, App.settings.wordCount);
  } else {
    words = getGradeWords(App.settings.grade, App.settings.semester, App.settings.wordCount, true);
  }

  if (!words.length) {
    showToast('当前还没有可朗读的内容，请先输入字词或选择内置内容。', 'error');
    return;
  }

  App.currentWords = words;

  // 启动听写
  App.state = 'running';
  updateControlBar();
  showSection('console');

  await App.rhythm.start(words);
}

function handlePause() {
  if (App.state === 'running') {
    App.rhythm.pause();
  }
}

function handleResume() {
  if (App.state === 'paused') {
    App.rhythm.resume();
    App.state = 'running';
    updateControlBar();
  }
}

function handleStop() {
  if (App.state === 'idle') return;
  if (!confirm('确定要停止本次听写吗？')) return;
  App.rhythm.stop();
}

// ════════════════════════════════════════════════════════
// 词库管理
// ════════════════════════════════════════════════════════
function addCustomWord() {
  const input = document.getElementById('custom-word-input-field');
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;

  // 支持批量输入（逗号/空格分隔）
  const words = raw.split(/[，,\s\t]+/).filter(w => w.trim());

  words.forEach(w => {
    const word = w.trim();
    const wordPart = word.split('|')[0].trim();
    if (wordPart && !App.customWords.find(c => c.word === wordPart)) {
      App.customWords.push(buildCustomWord(word));
    }
  });

  input.value = '';
  saveCustomWords();
  syncQuickWordInput();
  updateWordTagList();
  updateSimplePresetSummary();
  showToast(`已添加 ${words.length} 个词语`, 'success');
}

function importWordList() {
  const modal = document.getElementById('import-modal');
  const textarea = document.getElementById('import-textarea');
  if (modal && textarea) {
    textarea.value = '';
    modal.style.display = 'flex';
    modal.removeAttribute('aria-hidden');
    setTimeout(() => textarea.focus(), 100);
  }
}

function confirmImport() {
  const textarea = document.getElementById('import-textarea');
  const text = (textarea?.value || '').trim();
  closeImportModal();
  if (!text) return;
  const words = text.split(/[\n\r，,\s]+/).map(w => w.trim()).filter(Boolean);
  let added = 0;
  words.forEach(w => {
    if (!App.customWords.find(c => c.word === w)) {
      App.customWords.push(buildCustomWord(w));
      added++;
    }
  });
  saveCustomWords();
  syncQuickWordInput();
  updateWordTagList();
  updateSimplePresetSummary();
  const skipped = words.length - added;
  showToast(
    `成功导入 ${added} 个词语${skipped > 0 ? `，${skipped} 个重复已跳过` : ''}`,
    'success'
  );
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
}

function useCustomWords() {
  if (!App.customWords.length) {
    showToast('请先录入需要朗读的字词。', 'error');
    return;
  }
  App.settings.wordSource = 'custom';
  saveSettings();
  document.getElementById('word-source').value = 'custom';
  updateSimplePresetSummary();
  showToast(`将使用 ${App.customWords.length} 个自定义词语`, 'success');
}

function clearCustomWords() {
  App.customWords = [];
  saveCustomWords();
  syncQuickWordInput();
  if (App.settings.wordSource === 'custom') {
    App.settings.wordSource = 'grade';
    App.settings.wordCount = DEFAULT_SETTINGS.wordCount;
    saveSettings();
    setVal('word-source', 'grade');
    setVal('count-input', App.settings.wordCount);
  }
  updateWordTagList();
  updateSimplePresetSummary();
  showToast('已清空自定义内容', 'info');
}

function updateWordTagList() {
  const container = document.getElementById('word-tag-list');
  if (!container) return;
  container.innerHTML = App.customWords.map((w, i) => `
    <span class="word-tag">
      ${escHtml(w.word)}
      <span class="del-btn" onclick="removeCustomWord(${i})">✕</span>
    </span>
  `).join('') || '<span style="color:var(--gray-400);font-size:.85rem">还没有词语，请添加...</span>';
}

function removeCustomWord(index) {
  App.customWords.splice(index, 1);
  saveCustomWords();
  syncQuickWordInput();
  if (!App.customWords.length && App.settings.wordSource === 'custom') {
    App.settings.wordSource = 'grade';
    App.settings.wordCount = DEFAULT_SETTINGS.wordCount;
    saveSettings();
    setVal('word-source', 'grade');
    setVal('count-input', App.settings.wordCount);
  }
  updateWordTagList();
  updateSimplePresetSummary();
}

function renderBuiltinWordList() {
  const grade = App.settings.grade;
  const gradeData = WORD_BANK[grade];
  if (!gradeData) return;

  const container = document.getElementById('builtin-word-list');
  if (!container) return;

  const words = [...(gradeData.semester1 || []), ...(gradeData.semester2 || [])];
  container.innerHTML = words.map(w => `
    <span class="gw-item" title="${escHtml(w.sentence || '')}" onclick="addWordFromBank('${escHtml(w.word)}')">
      ${escHtml(w.word)}
    </span>
  `).join('');
}

function addWordFromBank(word) {
  if (!App.customWords.find(c => c.word === word)) {
    App.customWords.push(buildCustomWord(word));
    saveCustomWords();
    syncQuickWordInput();
    updateWordTagList();
    updateSimplePresetSummary();
  }
}

// ════════════════════════════════════════════════════════
// UI 更新函数
// ════════════════════════════════════════════════════════
function updateWordDisplay(item, show) {
  const wordEl = document.getElementById('stage-word');
  const sentenceEl = document.getElementById('stage-sentence');
  if (!wordEl) return;

  if (show) {
    wordEl.textContent = item.word || '';
    wordEl.classList.remove('hidden-word');
  } else {
    wordEl.textContent = item.word ? '？'.repeat(item.word.length) : '';
    wordEl.classList.add('hidden-word');
  }

  if (sentenceEl) sentenceEl.textContent = '';
}

function updateSentenceDisplay(text) {
  const el = document.getElementById('stage-sentence');
  if (el) el.textContent = text;
}

function updateStageStatus(text) {
  const el = document.getElementById('stage-status');
  if (el) el.textContent = text;
}

function updateStageCounter(current, total) {
  const el = document.getElementById('stage-counter');
  if (el) el.textContent = `${current} / ${total}`;
}

function updateTimerDisplay(seconds) {
  const el = document.getElementById('stage-timer');
  if (el) el.textContent = seconds > 0 ? `${seconds}s` : '';
}

function updateProgressBar(ratio) {
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${Math.round(ratio * 100)}%`;
}

function updateTimeline(phase) {
  const phases = ['number', 'word', 'sentence', 'repeat', 'wait'];
  const currentIdx = phases.indexOf(phase);
  document.querySelectorAll('.timeline-step').forEach((el, i) => {
    el.classList.toggle('current', i === currentIdx);
    el.classList.toggle('done', i < currentIdx);
  });
}

function updateRhythmDots(phase) {
  const PHASE_DOT = { intro:0, number:0, word:1, sentence:2, repeat:3, wait:4 };
  const active = PHASE_DOT[phase] ?? -1;
  document.querySelectorAll('.rhythm-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === active);
    dot.classList.toggle('done', i < active);
  });
}

function updateTTSIndicator(state, text) {
  const wave = document.querySelector('.tts-wave');
  const label = document.getElementById('tts-label');
  if (!wave) return;
  wave.classList.toggle('paused', state !== 'speaking');
  if (label) {
    label.textContent = state === 'speaking' ? `正在朗读：${text.slice(0,8)}...` :
                        state === 'paused'   ? '朗读已暂停' : '朗读待命中';
  }
}

function updateControlBar() {
  const btnStart      = document.getElementById('btn-start');
  const btnPause      = document.getElementById('btn-pause');
  const btnResume     = document.getElementById('btn-resume');
  const btnStop       = document.getElementById('btn-stop');
  const globalBar     = document.getElementById('global-control-bar');

  const isRunning  = App.state === 'running';
  const isPaused   = App.state === 'paused';
  const isIdle     = App.state === 'idle';
  const isActive   = isRunning || isPaused;

  // 全局粘性控制栏：非空闲时始终显示
  if (globalBar) globalBar.style.display = isActive ? 'flex' : 'none';

  if (btnStart)  { btnStart.disabled  = !isIdle; btnStart.style.display = isIdle ? '' : 'none'; }
  if (btnPause)  { btnPause.disabled  = !isRunning; btnPause.style.display = isRunning ? 'inline-flex' : 'none'; }
  if (btnResume) { btnResume.disabled = !isPaused; btnResume.style.display = isPaused ? 'inline-flex' : 'none'; }
  if (btnStop)   { btnStop.disabled   = isIdle; btnStop.style.display = (isRunning||isPaused) ? 'inline-flex' : 'none'; }
}

function renderVoiceList() {
  const sel = document.getElementById('voice-select');
  if (!sel) return;

  const populate = () => {
    const voices = App.tts.getChineseVoices();
    if (!voices.length) {
      sel.innerHTML = '<option value="">（无中文声音）</option>';
      return;
    }
    const preferredVoice = App.settings.voice || '';
    const hasPreferredVoice = preferredVoice && voices.some(v => v.name === preferredVoice);

    if (hasPreferredVoice) {
      App.tts.setVoice(preferredVoice);
    }

    sel.innerHTML = [
      '<option value="">（自动选择最佳中文声音）</option>',
      ...voices.map(v => `
      <option value="${escHtml(v.name)}" ${(hasPreferredVoice && v.name === preferredVoice) || (!hasPreferredVoice && v.name === App.tts.selectedVoice?.name) ? 'selected' : ''}>
        ${escHtml(v.name)} (${v.lang})${v.localService ? '' : ' ☁️'}
      </option>
    `)
    ].join('');

    sel.value = hasPreferredVoice ? preferredVoice : '';
  };

  populate();
  setTimeout(populate, 1000);
  setTimeout(populate, 2500);
}

function checkTTSSupport() {
  const notice = document.getElementById('tts-notice');
  setTimeout(() => {
    if (!App.tts.isSupported()) {
      if (notice) notice.style.display = 'flex';
    } else if (!App.tts.hasChinese()) {
      showToast('暂未检测到合适的中文语音，建议使用 Edge 或 Chrome 浏览器。', 'warning');
    }
  }, 2000);
}

function updateBankStats() {
  const stats = getBankStats();
  const el = document.getElementById('bank-total');
  if (el) el.textContent = `内置词库 ${stats.total} 词`;

  const gradeEl = document.getElementById('grade-word-count');
  const grade = App.settings.grade;
  if (gradeEl && stats.gradeStats[grade]) {
    gradeEl.textContent = `当前年级：${stats.gradeStats[grade]} 词`;
  }
}

function updateSimplePresetSummary() {
  const el = document.getElementById('simple-preset-summary');
  if (!el) return;

  const gradeLabel = WORD_BANK[App.settings.grade]?.label || '一年级';
  const semesterLabel = App.settings.semester === '1'
    ? '上册'
    : App.settings.semester === '2'
      ? '下册'
      : '全册';

  if (App.settings.wordSource === 'custom' && App.customWords.length) {
    el.textContent = `当前已录入 ${App.customWords.length} 个字/词，将按“每词 ${App.settings.intraRepeatCount} 遍、内部 ${App.settings.intraRepeatGapSeconds} 秒、词间 ${App.settings.wordIntervalSeconds} 秒”自动朗读，${App.settings.showWordOnStage ? '并显示当前朗读内容。' : '且不显示当前朗读内容。'}`;
    return;
  }

  el.textContent = `已默认设置为深圳小学语文 · ${gradeLabel}${semesterLabel}字词；当前为每词 ${App.settings.intraRepeatCount} 遍、内部 ${App.settings.intraRepeatGapSeconds} 秒、词间 ${App.settings.wordIntervalSeconds} 秒，${App.settings.showWordOnStage ? '并显示当前朗读内容。' : '且不显示当前朗读内容。'}`;
}

function getWordsFromText(rawText) {
  const values = String(rawText || '')
    .split(/[\n，,、；;\s]+/)
    .map(item => item.trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

function syncQuickWordInput() {
  const el = document.getElementById('quick-word-input');
  if (!el) return;
  el.value = App.customWords.map(item =>
    item.compound ? `${item.word}|${item.compound}` : item.word
  ).join(' ');
}

function parseWordToken(token) {
  const parts = String(token || '').split('|');
  return { word: parts[0].trim(), compound: parts[1]?.trim() || '' };
}

function syncCustomWordsFromQuickInput() {
  const el = document.getElementById('quick-word-input');
  if (!el) return;

  const tokens = getWordsFromText(el.value);
  const previousMap = new Map(App.customWords.map(item => [item.word, item]));
  const seen = new Set();
  App.customWords = [];
  for (const token of tokens) {
    const { word } = parseWordToken(token);
    if (word && !seen.has(word)) {
      seen.add(word);
      const existing = previousMap.get(word);
      App.customWords.push(existing
        ? { ...existing, compound: parseWordToken(token).compound }
        : buildCustomWord(token));
    }
  }
  saveCustomWords();

  if (words.length) {
    App.settings.wordSource = 'custom';
    App.settings.wordCount = words.length;
    setVal('word-source', 'custom');
    setVal('count-input', App.settings.wordCount);
  } else if (App.settings.wordSource === 'custom') {
    App.settings.wordSource = 'grade';
    App.settings.wordCount = DEFAULT_SETTINGS.wordCount;
    setVal('word-source', 'grade');
    setVal('count-input', App.settings.wordCount);
  }

  saveSettings();
  updateWordTagList();
  updateSimplePresetSummary();
}

// ════════════════════════════════════════════════════════
// 界面切换
// ════════════════════════════════════════════════════════
function showSection(name) {
  const map = {
    config:   'config-section',
    console:  'dictation-console',
  };
  document.querySelectorAll('.main-section').forEach(el => {
    el.style.display = 'none';
  });
  const target = map[name];
  if (target) {
    const el = document.getElementById(target);
    if (el) el.style.display = 'block';
  }
}

function toggleSection(name) {
  const map = {
    wordbank:    'wordbank-section',
    'ai-settings': 'ai-settings-section',
  };
  const id = map[name];
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function switchSidebarTab(name) {
  // name: 'wordbank' | 'settings'
  const map = {
    wordbank:  'wordbank-section',
    settings:  'ai-settings-section',
  };
  document.querySelectorAll('.sidebar-tab').forEach(btn => {
    const isActive = btn.dataset.sidebarTab === name;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = key === name ? 'block' : 'none';
  });
  if (name === 'settings' && typeof renderBuiltinWordList === 'function') {
    // nothing extra needed
  }
}

// ════════════════════════════════════════════════════════
// Toast 通知
// ════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'info' ? '' : type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${escHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ════════════════════════════════════════════════════════
// 工具函数
// ════════════════════════════════════════════════════════
function on(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function handleGlobalShortcut(e) {
  if (e.key === 'Escape') {
    closeQrModal();
    closeImportModal();
    return;
  }

  const target = e.target;
  const tagName = target?.tagName;
  const isEditable = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tagName);

  if (isEditable) return;

  if (e.code === 'Space' || e.key === ' ') {
    if (App.state === 'running') {
      e.preventDefault();
      handlePause();
    } else if (App.state === 'paused') {
      e.preventDefault();
      handleResume();
    }
  }
}

function applyTheme(theme = 'day') {
  const nextTheme = theme === 'night' ? 'night' : 'day';
  App.settings.theme = nextTheme;

  if (document.body) {
    document.body.dataset.theme = nextTheme;
  }

  updateThemeControls(nextTheme);
  updateThemeMetaColor(nextTheme);
}

function updateThemeControls(theme) {
  document.querySelectorAll('[data-theme-value]').forEach(btn => {
    const active = btn.dataset.themeValue === theme;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function updateThemeMetaColor(theme) {
  const metaTheme = document.getElementById('meta-theme-color');
  if (!metaTheme) return;
  metaTheme.setAttribute('content', theme === 'night' ? '#0b1220' : '#4f7ef8');
}

function getShareUrl() {
  return SHARE_URL;
}

function buildQrImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(text)}`;
}

function openQrModal() {
  const modal = document.getElementById('qr-modal');
  const image = document.getElementById('qr-code-image');
  const link = document.getElementById('qr-link');
  const shareUrl = getShareUrl();

  if (!modal || !image || !link) return;

  image.src = buildQrImageUrl(shareUrl);
  link.href = shareUrl;
  link.textContent = shareUrl;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}

function closeQrModal() {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

async function copyShareLink() {
  const shareUrl = getShareUrl();

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      const temp = document.createElement('input');
      temp.value = shareUrl;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    showToast('链接已复制，可直接发到手机打开', 'success');
  } catch (_) {
    showToast('复制失败，请手动复制下方链接', 'warning');
  }
}

function resetAllData() {
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.customWords);

  App.customWords = [];
  Object.assign(App.settings, DEFAULT_SETTINGS);
  applySettings();
  updateBankStats();
  updateWordTagList();
  showSection('config');
  updateControlBar();
  showToast('已恢复默认设置', 'success');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ════════════════════════════════════════════════════════
// 启动
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  showSection('config');
  updateControlBar();
});
