# 临时禁用钱包扩展 - 故障排查指南

## 问题症状

如果您看到以下错误：
```
MetaMask encountered an error setting the global Ethereum provider - 
this is likely due to another Ethereum wallet extension also setting the global Ethereum provider: 
TypeError: Cannot set property ethereum of #<Window> which has only a getter
```

这表示**多个钱包扩展在竞争设置 window.ethereum**。

## 根本原因

1. **浏览器层面问题**（不是应用问题）
2. 多个钱包扩展都试图注入自身为 `window.ethereum`
3. 第一个成功，第二个因为 getter-only 而失败
4. 这是浏览器扩展之间的冲突

## 临时解决方案：禁用冲突扩展

### Chrome/Edge：

1. **打开扩展管理页面**
   - 按 `Ctrl+Shift+Delete` 或访问 `chrome://extensions/`

2. **找到所有钱包扩展**
   - MetaMask
   - Trust Wallet
   - Coinbase Wallet
   - OKEx Wallet
   - BitKeep
   - 等等

3. **只保留一个，禁用其他**
   ```
   ✓ 保留: MetaMask（启用）
   ✗ 禁用: Trust Wallet
   ✗ 禁用: Coinbase Wallet
   ✗ 禁用: OKEx Wallet
   ✗ 禁用: BitKeep
   ```

4. **重新加载页面**
   - 按 `F5` 或 `Ctrl+R`

### Firefox：

1. **打开 about:addons**
   - 按下 `Ctrl+Shift+A` 或访问 `about:addons`

2. **在 Extensions（扩展）中找到钱包**

3. **只保留一个，禁用其他**

4. **重新加载页面**

## 测试步骤

### 步骤 1：禁用所有钱包

1. 禁用 **所有** 钱包扩展
2. F5 重新加载页面
3. 打开 F12 开发工具控制台
4. 观察是否还有 MetaMask 错误

**预期结果**：❌ 没有红色错误（可能有其他警告但无钱包错误）

### 步骤 2：启用单个钱包

1. 启用 MetaMask 只
2. F5 重新加载
3. 检查控制台

**预期结果**：✅ 应用加载正常，无 MetaMask 错误

### 步骤 3：添加第二个钱包

1. 同时启用 MetaMask + Trust Wallet
2. F5 重新加载
3. 检查控制台

**预期结果**：⚠️ 可能看到 MetaMask 冲突错误（这是钱包扩展间的冲突，**不是我们应用的问题**）

## 关键发现

| 场景 | 钱包错误 | 应用工作 | 原因 |
|------|--------|--------|------|
| 0 个钱包 | ❌ 无 | ✅ 是 | 没有钱包扩展 |
| 1 个钱包 | ❌ 无 | ✅ 是 | 单个钱包成功注入 |
| 2+ 钱包 | ⚠️ MetaMask 错误 | ✅ **仍然是** | 扩展冲突，但应用通过 EIP-6963 工作 |

## 为什么我们的应用仍然工作

我们实现了 **EIP-6963** 钱包发现协议，不依赖 `window.ethereum`：

```typescript
1. 尝试 EIP-6963（现代方式）
   ↓ ✅ 工作（在任何扩展冲突中）
   
2. 如果 EIP-6963 失败 → 尝试 window.ethereum（旧方式）
   ↓ ⚠️ 可能被阻止，但还有 EIP-6963 回退
```

因此，**即使钱包扩展冲突，我们的应用仍然可以通过 EIP-6963 工作**。

## 诊断您的环境

### 打开开发工具

1. 按 `F12` 打开开发工具
2. 点击 Console（控制台）标签
3. 查看错误

### 如果您看到：

```
❌ "Cannot set property ethereum..." 
   → 钱包扩展冲突（禁用其中一个）

❌ "No wallet found"
   → 没有钱包或都被禁用（启用一个）

✅ 无错误 + 应用加载
   → 一切正常！
```

## 推荐配置

### 最佳实践：

✅ **推荐**：只安装一个钱包
```
- MetaMask（只需一个）
  ├─ 账户 1
  ├─ 账户 2
  └─ 账户 3（多账户无需多扩展）
```

⚠️ **可接受**：多个钱包但只启用一个
```
- MetaMask（启用 ✓）
- Trust Wallet（禁用 ✗）
- Coinbase（禁用 ✗）
```

❌ **不推荐**：同时启用多个钱包
```
- MetaMask（启用 - 首先注入 window.ethereum）
- Trust Wallet（启用 - 尝试覆盖 → 失败）
  → 看到 MetaMask 错误且有冲突
```

## 恢复所有钱包

如果您禁用了所有钱包，想要恢复：

1. 回到 Extensions（扩展）
2. 启用您想要的钱包
3. 我们的应用会自动检测它（通过 EIP-6963）

---

**注意**：这个错误来自 **钱包扩展本身**，不是我们的应用。
我们已经实现了 EIP-6963 来绕过这个问题。

**应用应该仍然可以工作** — 尝试上面的测试步骤！
