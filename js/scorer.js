/**
 * 小学生听写宝 — 智能评分引擎
 *
 * 支持多种评判模式：
 * - 精确匹配：完全一致才对
 * - 宽松匹配：允许全角/半角、简繁体差异
 * - 模糊匹配：编辑距离容错（适合低年级）
 *
 * 评价等级：
 * 100      → 🏆 完美！
 * 90-99    → 🌟 优秀
 * 75-89    → 👍 良好
 * 60-74    → 📝 一般
 * < 60     → 💪 继续努力
 */

class Scorer {
  constructor() {
    this.mode = 'normal'; // 'strict' | 'normal' | 'fuzzy'
    this.results = [];
    this.words = [];
    this.answers = [];
  }

  setMode(mode) { this.mode = mode; }

  /** 主评分方法 */
  score(words, answers) {
    this.words = words;
    this.answers = answers;
    this.results = [];

    let correct = 0;

    for (let i = 0; i < words.length; i++) {
      const wordItem = words[i];
      const rawAnswer = (answers[i] || '').trim();
      const result = this._judgeWord(wordItem.word, rawAnswer);
      
      this.results.push({
        index: i,
        word: wordItem.word,
        answer: rawAnswer,
        correct: result.correct,
        matchType: result.matchType, // 'exact'|'normalize'|'fuzzy'|'wrong'|'empty'
        score: result.score,
        hint: result.hint,
      });

      if (result.correct) correct++;
    }

    return this._buildReport(correct, words.length);
  }

  /** 单词评判 */
  _judgeWord(standard, answer) {
    if (!answer) {
      return { correct: false, matchType: 'empty', score: 0, hint: '未作答' };
    }

    // 精确匹配
    if (answer === standard) {
      return { correct: true, matchType: 'exact', score: 100, hint: '正确' };
    }

    // 规范化匹配（全角→半角，去除空格，繁体→简体映射）
    const normStd = this._normalize(standard);
    const normAns = this._normalize(answer);
    if (normAns === normStd) {
      return { correct: true, matchType: 'normalize', score: 95, hint: '正确（格式稍差）' };
    }

    if (this.mode === 'strict') {
      return { correct: false, matchType: 'wrong', score: 0, hint: `正确写法：${standard}` };
    }

    // 宽松/模糊模式：编辑距离容错
    if (this.mode === 'fuzzy' || this.mode === 'normal') {
      const dist = this._editDistance(normStd, normAns);
      const maxLen = Math.max(normStd.length, normAns.length);
      const similarity = 1 - dist / maxLen;

      // 单字词不允许错
      if (normStd.length <= 1) {
        return { correct: false, matchType: 'wrong', score: 0, hint: `正确写法：${standard}` };
      }

      // 两字词允许1个错（仅fuzzy模式）
      if (this.mode === 'fuzzy' && normStd.length === 2 && dist <= 1) {
        return { 
          correct: true, matchType: 'fuzzy', score: 70, 
          hint: `接近正确（正确：${standard}）` 
        };
      }

      // 四字及以上允许1个错（fuzzy模式）
      if (this.mode === 'fuzzy' && normStd.length >= 4 && dist <= 1) {
        return {
          correct: true, matchType: 'fuzzy', score: 75,
          hint: `接近正确（正确：${standard}）`
        };
      }

      // 相似度参考输出（不算正确）
      return { 
        correct: false, matchType: 'wrong', score: 0, 
        hint: `正确写法：${standard}` 
      };
    }

    return { correct: false, matchType: 'wrong', score: 0, hint: `正确写法：${standard}` };
  }

  /** 字符串规范化 */
  _normalize(str) {
    return str
      .trim()
      .replace(/\s+/g, '')
      // 全角转半角
      .replace(/[\uff01-\uff5e]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      // 简单繁简映射（常见字）
      .replace(/後/g, '后').replace(/裡/g, '里').replace(/邊/g, '边')
      .replace(/歡/g, '欢').replace(/興/g, '兴').replace(/這/g, '这')
      .replace(/們/g, '们').replace(/時/g, '时').replace(/國/g, '国')
      .replace(/來/g, '来').replace(/說/g, '说').replace(/愛/g, '爱')
      .toLowerCase();
  }

  /** Levenshtein 编辑距离 */
  _editDistance(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    );
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  }

  /** 生成成绩报告 */
  _buildReport(correct, total) {
    const percent = total > 0 ? Math.round(correct / total * 100) : 0;
    const grade = this._gradeLabel(percent);
    const wrongItems = this.results.filter(r => !r.correct);
    const emptyItems = this.results.filter(r => r.matchType === 'empty');
    const fuzzyItems = this.results.filter(r => r.matchType === 'fuzzy');

    return {
      correct,
      total,
      percent,
      grade,
      results: this.results,
      wrongItems,
      emptyItems,
      fuzzyItems,
      perfectScore: percent === 100,
      passed: percent >= 60,
      elapsed: 0, // 由调用方填入
      timestamp: Date.now(),
    };
  }

  /** 评价等级 */
  _gradeLabel(percent) {
    if (percent === 100) return { text: '完美满分！',     emoji: '🏆', color: '#f5a623', css: 'perfect' };
    if (percent >= 90)  return { text: '优秀',           emoji: '🌟', color: '#4ade80', css: 'excellent' };
    if (percent >= 75)  return { text: '良好',           emoji: '👍', color: '#60a5fa', css: 'good' };
    if (percent >= 60)  return { text: '及格',           emoji: '📝', color: '#94a3b8', css: 'pass' };
    return               { text: '继续努力',             emoji: '💪', color: '#f87171', css: 'fail' };
  }

  /** 生成错误分析（供复习使用）*/
  getReviewList() {
    return this.results
      .filter(r => !r.correct)
      .map(r => ({
        word: r.word,
        yourAnswer: r.answer || '（未作答）',
        hint: r.hint,
      }));
  }

  /** 历史成绩管理 */
  static saveHistory(report, gradeLabel) {
    const key = 'tingxie_history';
    const history = Scorer.getHistory();
    history.unshift({
      id: Date.now(),
      grade: gradeLabel,
      percent: report.percent,
      correct: report.correct,
      total: report.total,
      gradeLabel: report.grade,
      timestamp: report.timestamp,
      wrongWords: report.wrongItems.map(r => r.word),
    });
    // 只保留最近 50 条
    localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
  }

  static getHistory() {
    try {
      return JSON.parse(localStorage.getItem('tingxie_history') || '[]');
    } catch { return []; }
  }

  static clearHistory() {
    localStorage.removeItem('tingxie_history');
  }
}

window.Scorer = Scorer;
