# 🔮 Ether Tarot 项目开发报告

## 1. 项目概述
**Ether Tarot** 是一个基于 AI 的沉浸式塔罗占卜应用。它结合了传统的 Rider-Waite 塔罗牌系统与 **荣格心理学** 分析视角，利用 Google Gemini 2.5 Pro 模型为用户提供深度、去巴纳姆效应（Anti-Barnum Effect）的心理咨询式解读。

## 2. 技术栈架构 (Technology Stack)

### 💻 前端 (Frontend)
*   **框架**: **Astro** (SSR 模式)
    *   *选用理由*: 兼顾了静态页面的高性能加载和 API 路由的服务端渲染能力。
*   **UI 库**: **React**
    *   *用途*: 处理复杂的交互逻辑（如洗牌、抽牌、翻牌状态管理）。
*   **语言**: **TypeScript**
    *   *用途*: 确保类型安全，特别是对于塔罗牌数据结构 (`TarotCard`) 和 API 响应的类型定义。
*   **样式**: **Tailwind CSS**
    *   *用途*: 快速构建响应式布局，处理半透明玻璃拟态 (Glassmorphism) 和暗色系神秘风格。
*   **动画**: **Framer Motion**
    *   *核心亮点*: 实现了复杂的物理模拟动画，包括“花式洗牌 (Flower Bloom Shuffle)”、“扇形展开 (Fan Spread)”、“卡牌飞入”及“翻转揭示”。
*   **Markdown 渲染**: **react-markdown**
    *   *用途*: 将 AI 返回的 Markdown 格式文本（加粗、段落）渲染为美观的 HTML。

### ⚙️ 后端 & AI (Backend & AI)
*   **运行时**: **Node.js** (via Astro Node Adapter)
*   **AI 模型**: **Google Gemini 2.5 Pro**
    *   *SDK*: `@google/genai`
    *   *配置*:使用了详细的 `SYSTEM_INSTRUCTION` 进行角色扮演（荣格心理咨询师），包含 Few-Shot Examples（少样本学习）以规范输出格式和语气。
*   **API 路由**: Astro API Endpoints (`src/pages/api/reading.ts`)
    *   *作用*: 隐藏 API Key，处理跨域请求，并在服务端预处理 Prompt。

### 🚀 部署与运维 (DevOps)
*   **云服务器**: **AWS EC2** (Amazon Linux 2023)
*   **进程管理**: **PM2**
    *   *配置*: `ecosystem.config.cjs`，用于后台守护进程、自动重启和环境变量注入。
*   **Web 服务器**: **Nginx**
    *   *作用*: 反向代理 (Reverse Proxy) 到本地 4321 端口，处理静态资源缓存。
*   **域名与安全**: **Certbot (Let's Encrypt)**
    *   *作用*: 自动化配置 SSL 证书，实现 HTTPS (HTTP/2) 安全访问。
*   **版本控制**: **Git & GitHub**

---

## 3. 核心功能亮点 (Key Features)

### A. 沉浸式交互体验
1.  **拟真洗牌动画**: 摒弃简单的随机数生成，实现了视觉上的“螺旋洗牌”和“归位”动画，增加仪式感。
2.  **扇形抽牌**: 卡牌以扇形展开，用户点击后，卡牌会从牌堆物理飞出至读取位置，其余卡牌自动闭合缺口 (Framer Motion Layout Animation)。
3.  **性能优化**:
    *   **GPU 加速**: 对动画元素使用 `will-change: transform`，解决移动端卡顿。
    *   **图片预加载**: 实现了 `preloadImage` 策略，在洗牌间隙预加载抽中的卡牌大图，杜绝翻牌时的白屏闪烁。

### B. 深度 AI 解读引擎
1.  **荣格心理学人格**: Prompt 中严格规定了 AI 需关注“阴影 (Shadow)”、“人格面具 (Persona)”和“共时性”。
2.  **反巴纳姆效应机制**:
    *   **负面约束**: 禁止使用“你外表坚强内心柔软”等万能废话。
    *   **逻辑强制**: 每一句分析必须引用牌面具体的视觉细节（如“圣杯五逆位中没倒下的两个杯子”）。
3.  **结构化输出**: 强制 AI 按照 **过去(根源) -> 现在(现状/内耗) -> 未来(启示/改变)** 的三段式结构输出。
4.  **逆位概率调整**: 在代码层面 (`Math.random() > 0.8`) 将逆位牌出现的概率人为降低至 20%，以符合实际物理洗牌的正态分布体验。

---

## 4. 开发过程中解决的关键问题 (Challenges & Solutions)

| 问题领域 | 具体问题 | 解决方案 |
| :--- | :--- | :--- |
| **部署** | PM2 无法启动 ES Module 配置文件 | 将 `ecosystem.config.js` 重命名为 `.cjs`，显式声明使用 CommonJS 规范加载，解决 Node.js 的模块兼容性问题。 |
| **环境** | AWS EC2 无法读取 API Key | 在 `reading.ts` 中增加 `process.env` 的回退检查，并在 PM2 配置中显式注入环境变量，而非仅依赖 Astro 的 `import.meta.env`。 |
| **动画** | 洗牌后卡牌位置突变/旋转 | 修正 Framer Motion 的 `transition` 状态，在 `isShuffling` 结束时将旋转动画时长设为 0 (`duration: 0`)，防止插值导致的视觉错误。 |
| **AI** | 回答过于简短或像“翻译腔” | 引入 **Few-Shot Prompting (少样本提示)**，在 Prompt 中写入了 4 个具体的优秀/错误回答范例，并设定“每张牌不少于 80 字”的硬性指标。 |
| **网络** | 这里的终端无法连接 Gemini | 通过配置系统级代理 (`https_proxy`) 或确认服务器（AWS海外区）的网络环境解决连接问题。 |

---

## 5. 项目文件结构快照

```text
/project
├── public/
│   ├── major/ & suits/   # 78张塔罗牌的高清 WebP 图片
│   └── patterns/         # 牌背图案
├── src/
│   ├── components/
│   │   └── react/
│   │       ├── Card.tsx  # 单张卡牌组件（处理正逆位渲染）
│   │       └── Deck.tsx  # 核心交互组件（洗牌、发牌逻辑）
│   ├── pages/
│   │   ├── api/
│   │   │   └── reading.ts # Gemini API 后端接口
│   │   └── index.astro    # 主页入口
│   └── utils/
│       └── tarotData.ts   # 塔罗牌静态数据定义
├── astro.config.mjs       # Astro 配置 (Server Output, Node Adapter)
├── ecosystem.config.cjs   # PM2 生产环境配置
└── tailwind.config.mjs    # 样式配置
```

