# 📖 听写宝 · 小学生专业听写系统

> 一套真正专业、可直接部署的小学语文听写辅助工具

**在线演示：** `https://<你的用户名>.github.io/tingxiebao/`

---

## ✨ 功能特色

### 🎙️ 教育级语音朗读算法
- 智能优先选择 **Microsoft Xiaoxiao / Xiaoyi**（Edge 神经语音，最接近真人）
- 多浏览器兼容策略：Edge → Chrome → Safari → Firefox
- 独立语速配置：词语朗读（慢）/ 例句（标准）/ 复读（更慢清晰）
- 防止语音重叠，朗读状态可视化波形指示

### ⏱️ 还原真实课堂听写节奏

```
老师习惯的听写流程（每道题）：

  1. 📢 "第X个词语"       ← 清晰报号
  2. 🔊 朗读词语（稍慢）  ← 首次朗读
  3. 📖 "请听例句：…"    ← 语境例句帮助理解
  4. 🔁 "再写一遍" + 复读 ← 确认书写
  5. ✍️ 动态等待          ← 按字数自动计算（每字约 800ms）
```

可配置：是否读例句、是否显示词语（练习模式）、朗读语速

### 📚 内置人教版题库
- **200+ 词条**，覆盖小学 1-6 年级
- 每词配有：拼音、例句、难度标注
- 上下册分册管理
- 支持混合年级出题

### 🤖 AI 自动生成题库

**三层生成策略：**

| 模式 | 网络需求 | 说明 |
|------|---------|------|
| 本地智能生成 | 无需网络 | 内置主题词库 + 20+ 种例句模板 |
| OpenAI API | 需要 | 任意主题、精确年级、自然例句 |
| 自定义 API | 需要 | 支持 DeepSeek / 月之暗面 / 私有部署 |

**支持的 AI 端点：**
- `https://api.openai.com/v1/chat/completions`（GPT-4o-mini 推荐）
- `https://api.deepseek.com/v1/chat/completions`
- `https://api.moonshot.cn/v1/chat/completions`
- 任何 OpenAI 兼容接口

### 📊 智能评分系统
- **三种评分模式**：严格 / 标准（全角半角兼容）/ 宽松（编辑距离容错）
- 即时批改，逐题标注对错
- 历史成绩管理（本地 LocalStorage 保存）
- 支持错词复习：一键加载错题再练
- 成绩导出 JSON / 打印功能

---

## 🚀 部署到 GitHub Pages（5分钟）

### 方法一：直接上传

```bash
# 1. Fork 或克隆本仓库
git clone https://github.com/<你的用户名>/tingxiebao.git
cd tingxiebao

# 2. 推送到 GitHub
git add .
git commit -m "初始化听写宝"
git push origin main

# 3. 开启 GitHub Pages
# 进入仓库 → Settings → Pages → Source: main 分支 → / (root)
# 等待 1-2 分钟后，访问：
# https://<你的用户名>.github.io/tingxiebao/
```

### 方法二：直接上传文件

1. 在 GitHub 创建新仓库 `tingxiebao`
2. 将所有文件上传（保持目录结构）
3. Settings → Pages → Deploy from branch → main

> ✅ **纯静态文件，零服务器依赖，完全免费**

---

## 📁 项目结构

```
tingxiebao/
├── index.html              # 主页面
├── manifest.json           # PWA 配置
├── css/
│   └── style.css           # 完整样式系统（深色模式 + 无障碍）
├── js/
│   ├── word-bank.js        # 人教版词库数据（200+ 词条）
│   ├── tts-engine.js       # 教育级 TTS 引擎
│   ├── dictation-rhythm.js # 听写节奏引擎（还原课堂流程）
│   ├── ai-generator.js     # AI 题库生成器（三层策略）
│   ├── scorer.js           # 智能评分引擎
│   └── app.js              # 主控制器（UI 状态管理）
└── README.md
```

---

## 🌐 浏览器兼容性

| 浏览器 | 中文语音质量 | 推荐度 |
|--------|------------|--------|
| **Microsoft Edge** | ⭐⭐⭐⭐⭐ 神经语音（最自然） | 强烈推荐 |
| **Google Chrome** | ⭐⭐⭐⭐ 系统语音 | 推荐 |
| **Safari (macOS/iOS)** | ⭐⭐⭐⭐ Siri 语音 | 支持 |
| **Firefox** | ⭐⭐ 基础支持 | 可用 |

> 💡 Edge 用户可在 Windows 设置中安装"Microsoft Xiaoxiao"神经语音包，效果接近真人朗读。

---

## 🔧 本地运行

不需要任何构建工具，直接用浏览器打开即可：

```bash
# 推荐：用 VS Code Live Server 插件
# 或用 Python 起一个简单服务器（避免某些 CORS 限制）
python -m http.server 8080
# 访问 http://localhost:8080
```

---

## 📖 使用说明

### 基本听写流程

1. **选择年级** → 系统自动从人教版词库抽题
2. **调整设置** → 题目数量、语速、是否读例句
3. **点击开始** → 听写宝自动按课堂节奏朗读
4. **书写答案** → 在下方书写区填写
5. **提交批改** → 立即显示分数和详细批改结果

### 自定义词语

在**词库管理 → 自定义词语**中：
- 逐个输入词语（回车/逗号分隔）
- 批量粘贴（自动分割）
- 从内置词库点选

### AI 生成题目

在**词库管理 → AI 生成**中：
- 不配置 API Key：直接使用本地智能模板
- 配置 API Key（在设置面板）：GPT-4 精准生成任意主题词题

---

## 🎓 教学建议

- **一年级**：建议关闭"朗读例句"，专注单字认写
- **三至六年级**：开启例句帮助理解词义，减少死记硬背
- **错题复习**：每次听写后用"只练错词"功能针对性强化
- **语速设置**：一年级建议 0.6-0.7，六年级可提高到 1.0

---

## 📄 开源协议

MIT License — 免费使用、修改、部署，无商业限制。

---

<div align="center">
  <b>如有问题或建议，欢迎提 Issue 🙌</b>
</div>
