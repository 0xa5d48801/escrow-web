# 项目运行指南

## 🚀 快速启动

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm run dev
```
应用将在 `http://localhost:5173` 启动

### 生产构建
```bash
pnpm build
```

### 预览生产构建
```bash
pnpm run preview
```

## 📋 MetaMask 错误已修复！

如果看到此错误：
```
inpage.js:1 MetaMask encountered an error setting the global Ethereum provider...
TypeError: Cannot set property ethereum of #<Window> which has only a getter
```

**这是钱包扩展之间的冲突，不是我们应用的问题！**

### 验证应用正常工作

1. **打开开发工具** (F12)
2. **检查 Network 标签** - 应该看到 HTTP 200，不是 500
3. **点击 "Connect" 按钮** - 钱包选择器应该打开
4. **选择钱包** - 应该成功连接

### 如果没有看到钱包

**尝试禁用多余的钱包扩展**：
1. Chrome 设置 → 扩展程序
2. 找到所有钱包扩展（MetaMask, Trust, Coinbase 等）
3. 只启用一个，禁用其他
4. 刷新页面

详见：[DISABLE_WALLETS_INSTRUCTIONS.md](DISABLE_WALLETS_INSTRUCTIONS.md)

## 🏗️ 项目结构

```
escrow-web/
├── src/
│   ├── lib/
│   │   ├── state.svelte.ts          # 钱包状态管理（✅ 已修复）
│   │   ├── wallet-manager.svelte.ts # EIP-6963 发现
│   │   ├── web3.svelte.ts           # Web3 客户端（✅ 已修复）
│   │   ├── components/
│   │   │   ├── WalletButton.svelte  # 连接按钮
│   │   │   └── WalletSelectorModal.svelte # 钱包选择
│   │   ├── assets/
│   │   └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte           # 主布局
│   │   └── +page.svelte             # 首页
│   ├── app.html
│   └── app.d.ts
├── static/
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
└── package.json
```

## 🔐 钱包支持

### 支持的标准

| 标准 | 用途 | 状态 |
|------|------|------|
| **EIP-6963** | 现代钱包发现（优先） | ✅ 实现 |
| **EIP-1102** | 用户授权 (eth_requestAccounts) | ✅ 实现 |
| **EIP-1193** | JSON-RPC 调用 | ✅ 实现 |
| **EIP-3326** | 链切换 | ✅ 实现 |

### 支持的钱包

- MetaMask
- Trust Wallet
- Coinbase Wallet
- OKX Wallet
- BitKeep
- 以及其他注入 `window.ethereum` 的钱包

## 🎯 钱包连接流程

```
1. 用户点击 "Connect"
   ↓
2. 发送 EIP-6963 发现请求
   ↓
3. 3 秒超时收集钱包响应
   ↓
4. 显示 WalletSelectorModal（列出所有发现的钱包）
   ↓
5. 用户选择钱包
   ↓
6. 调用 eth_requestAccounts（用户在钱包中批准）
   ↓
7. 获取账户地址、链 ID 和余额
   ↓
8. 设置事件监听（账户变化、链变化）
   ↓
9. 显示已连接的账户
```

## 📊 关键文件修改

### ✅ 已修复的问题

**问题**：应用启动时访问 `window.ethereum` 导致钱包扩展冲突

**修复**：
- `src/lib/state.svelte.ts` - 删除构造函数中的 setupEventListeners()
- `src/lib/web3.svelte.ts` - 为 window.ethereum 访问添加 try-catch
- 现在只在用户连接钱包时访问 window.ethereum

**结果**：✅ 消除初始化时的冲突错误

## 🧪 测试命令

```bash
# 开发构建
pnpm run dev

# 生产构建
pnpm build

# 生产预览
pnpm preview

# 类型检查
pnpm run check
```

## 🔧 调试技巧

### 查看钱包发现日志
打开 DevTools Console，查找：
```
[EIP-6963] Dispatching wallet discovery request...
[EIP-6963] Discovery timeout - found X wallet(s)
```

### 查看连接日志
```
[Wallet Discovery] Starting wallet discovery...
[Event Listeners] Event listeners setup complete for provider
```

### 检查已保存的账户
```javascript
// 在控制台运行
JSON.parse(localStorage.getItem('connectedAccounts') || '[]')
```

## ⚠️ 常见问题

### Q: 看到 MetaMask 错误就是你们的问题？
**A**: 不是。这是钱包扩展之间的冲突。检查 Network 标签确认没有 HTTP 500 错误。

### Q: 为什么看不到钱包列表？
**A**: 
1. 确认钱包扩展已安装并启用
2. 检查浏览器是否在隐私模式（通常禁用扩展）
3. 如果多个钱包启用，禁用其他只保留一个

### Q: 钱包连接失败怎么办？
**A**:
1. 检查钱包是否解锁
2. 在钱包中检查是否有待批准的请求
3. 查看浏览器 Console 中是否有具体错误信息

### Q: 如何清除已保存的账户？
**A**:
```javascript
// 在控制台运行
localStorage.removeItem('connectedAccounts')
localStorage.removeItem('activeAccountIndex')
location.reload()
```

## 📚 相关文档

- [测试验证指南](TEST_VERIFICATION.md)
- [禁用钱包扩展说明](DISABLE_WALLETS_INSTRUCTIONS.md)
- [EIP-6963 实现指南](EIP6963_WALLET_SELECTOR_GUIDE.md)
- [钱包冲突解决方案](WALLET_CONFLICT_RESOLUTION.md)

## 🎉 修复总结

| 修复内容 | 状态 | 提交 |
|--------|------|------|
| 消除初始化时的 window.ethereum 访问 | ✅ | 463e6f5 |
| 添加 try-catch 保护 | ✅ | 463e6f5 |
| Svelte 5 语法修复 | ✅ | 最新 |
| 改进钱包发现日志 | ✅ | 最新 |
| 改进 WalletSelectorModal UI | ✅ | 最新 |

**现在应该可以顺利使用了！🚀**
