# Escrow DApp 前端框架

## 项目概述

这是一个基于 SvelteKit 5 + PWA + unocss 的分布式托管交易 DApp 前端框架。支持以太坊（Mainnet/Sepolia）和 Tron（Mainnet/Shasta）网络。

## 技术栈

- **框架**: SvelteKit 5（PWA + Static Adapter）
- **样式**: UnoCSS + PostCSS
- **状态管理**: Svelte 5 Runes（不使用 Store）
- **Web3**: Viem
- **国际化**: 中文/英文（i18n）
- **响应式**: 移动端优先设计

## 项目结构

```
src/
├── lib/
│   ├── components/          # Svelte 组件
│   │   ├── Layout.svelte         # 主布局（导航栏+footer）
│   │   ├── Navbar.svelte         # 导航栏
│   │   ├── SettingsModal.svelte  # 设置模态框
│   │   ├── WalletButton.svelte   # 钱包连接按钮
│   │   └── ChainSwitcher.svelte  # 链切换器
│   ├── assets/              # 静态资源
│   │   └── styles.css            # 全局样式
│   ├── state.svelte.ts      # 全局状态（Runes Classes）
│   ├── web3.svelte.ts       # Web3 配置与客户端
│   └── i18n.ts              # 国际化翻译
├── routes/
│   ├── +layout.svelte       # 根布局
│   ├── +layout.ts           # 根布局逻辑
│   ├── +page.svelte         # 首页
│   ├── create/
│   │   └── +page.svelte     # 创建交易页
│   ├── seller/
│   │   └── +page.svelte     # 卖家交易列表页
│   ├── buyer/
│   │   └── +page.svelte     # 买家交易列表页
│   ├── guide/
│   │   └── +page.svelte     # 指南 Q&A 页
│   └── trade/[id]/
│       └── +page.svelte     # 交易详情页
├── app.html                 # HTML 模板
├── app.d.ts                 # TypeScript 类型定义
└── app.pcss                 # PostCSS 组件样式

public/
├── sw.js                    # Service Worker
└── manifest.json            # PWA manifest

static/
└── manifest.json            # 同上（PWA manifest被复制到产出）
```

## 全局状态（Runes Classes）

使用 Svelte 5 Runes 实现全局状态管理，无需额外的 Store 库：

### DarkMode 类
```typescript
const darkMode = getDarkMode();
darkMode.toggle();        // 切换深色模式
darkMode.isDark;          // 当前状态
darkMode.isInitialized;   // 初始化状态
```

### Language 类
```typescript
const language = getLanguage();
language.set('en' | 'zh');  // 设置语言
language.current;            // 当前语言
```

### WalletState 类
```typescript
const wallet = getWalletState();
await wallet.connect();         // 连接钱包
wallet.disconnect();            // 断开连接
await wallet.switchChain(1);    // 切换链
wallet.isConnected;             // 连接状态
wallet.address;                 // 钱包地址
wallet.chainId;                 // 当前链ID
wallet.balance;                 // 余额（BigInt）
```

### TradeState 类
```typescript
const trades = getTradeState();
await trades.loadTrades();           // 加载交易列表
await trades.loadCredit(address);    // 加载用户信用
trades.trades;                       // 交易列表
trades.credits;                      // 信用映射
```

## 功能特性

### 📱 导航栏
- 首页、卖家、买家、指南四个主要页面
- 右侧工具区：
  - 🔗 钱包连接按钮（显示地址和余额）
  - 🔀 链切换器（支持 ETH/Tron）
  - ⚙️ 设置按钮（打开模态框）

### 🎨 设置模态框
模态框内容：
- 🌙 深色模式切换
- 🌍 语言选择（English/简体中文）

### 🏠 首页
- 项目展示
- 创建交易按钮
- 查询交易和信用功能
- 统计信息卡片

### 👤 卖家/买家页
- 交易列表
- 按状态筛选（Created/Joined/Confirmed/Cancelled）
- 点击进入交易详情页

### 📋 交易详情页
- 显示交易信息（卖家、买家、金额、状态等）
- 交互按钮（根据状态显示）

### ❓ 指南页
- Q&A 折叠菜单
- 中英文翻译
- 新手指南

### 🌐 底部
- About 部分
- Resources 和 Social 链接
- 联系方式

## 支持的链

### Ethereum
- Mainnet (ID: 1)
- Sepolia Testnet (ID: 11155111)

### Tron
- Mainnet (ID: 728126428)
- Shasta Testnet (ID: 2494104990)

## 国际化

支持中英文翻译，存储在 `src/lib/i18n.ts`：

```typescript
import { t } from '$lib/i18n';
import { getLanguage } from '$lib/state.svelte';

const language = getLanguage();
const text = t('nav.home', language.current as any);
```

翻译键命名规范：
- `nav.*` - 导航相关
- `home.*` - 首页
- `seller.*` - 卖家页
- `buyer.*` - 买家页
- `guide.*` - 指南页
- `settings.*` - 设置
- `status.*` - 交易状态
- `common.*` - 通用文本

## 样式系统

### UnoCSS 预设
- `@unocss/preset-uno` - 完整 Tailwind CSS 兼容
- `@unocss/preset-attributify` - 属性风格

### 自定义组件类
在 `src/app.pcss` 中定义：
- `.btn-primary` - 主按钮
- `.btn-secondary` - 副按钮
- `.btn-outline` - 边框按钮
- `.card` - 卡片
- `.input` - 输入框
- `.badge` / `.badge-success` / `.badge-warning` / `.badge-danger` - 标签
- `.modal-overlay` / `.modal` - 模态框

### 响应式
- `md:` 断点用于平板/桌面
- 移动端优先设计

## PWA 功能

### Service Worker
- 网络优先策略（Network First）
- 离线缓存支持
- 自动更新

### Manifest
- 应用名称、描述、图标
- 快捷方式（创建交易、查看交易）
- 独立应用模式（`standalone`）

## 开发指南

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览生产构建
```bash
pnpm preview
```

### 类型检查
```bash
pnpm check
```

### 代码格式化和 Lint
```bash
pnpm lint
pnpm format
```

## 待实现功能

以下功能留作 TODO，需要连接实际合约：

### 状态管理
- [ ] `TradeState.loadTrades()` - 从合约加载交易列表
- [ ] `TradeState.loadCredit()` - 从合约加载用户信用

### 交易功能
- [ ] 创建交易合约调用
- [ ] 加入交易合约调用
- [ ] 确认交易合约调用
- [ ] 提议折扣合约调用

### 合约部署地址
在 `src/lib/web3.svelte.ts` 设置：
```typescript
export const ESCROW_CONTRACTS: Record<number, string> = {
	[SUPPORTED_CHAINS.ETH_SEPOLIA]: '0x...', // TODO: Set actual address
	[SUPPORTED_CHAINS.TRON_SHASTA]: '0x...'
};
```

## 环境配置

### viem 配置
已配置公开客户端连接到各网络 RPC 端点：
- Ethereum RPC: `https://eth.public-rpc.com`
- Tron RPC: `https://api.tronstack.com/jsonrpc`

### MetaMask/钱包集成
自动检测 `window.ethereum` 并创建钱包客户端

## 构建输出

生产构建输出位置：`./build/` （使用 `@sveltejs/adapter-static`）

支持标准 HTTP 服务器部署（含 index.html fallback）

## 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）
- iPhone/iPad（PWA 支持）
- Android 设备（PWA 支持）

## 许可证

MIT

## 接下来

1. **配置合约 ABI** - 在 `src/lib/` 创建 ABIs 目录
2. **实现合约交互** - 更新 `TradeState` 方法
3. **配置部署地址** - 在 `web3.svelte.ts` 设置
4. **生成 PWA 图标** - 添加到 `public/` 目录
5. **测试钱包连接** - 本地测试 MetaMask/钱包
