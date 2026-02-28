# Wallet API Reference

完整实现钱包连接、交易签名和链切换功能

## 支持的 EIP 标准

### EIP 6963 - 钱包发现协议 (Wallet Discovery)
允许应用发现和连接多个钱包提供商。

```typescript
// 获取可用钱包列表
const wallets = wallet.availableWallets;
// [
//   { uuid: 'metamask', name: 'MetaMask', icon: '...', provider: {...} },
//   { uuid: 'trust', name: 'Trust Wallet', icon: '...', provider: {...} }
// ]

// 连接特定钱包
await wallet.connect('metamask');
```

### EIP 1102 - 授权请求 (Authorization Request)
用户明确授权应用访问其账户和签名。

```typescript
// 请求账户访问权限
await wallet.connect();
// 用户在钱包中确认授权
// 返回: ['0x742d35Cc6634C0532925a3b844Bc029e4aea9b7f']
```

### EIP 1193 - 以太坊 RPC API
标准化的 JSON-RPC 方法调用。

```typescript
// 所有 RPC 调用都通过 EIP 1193 处理:
// - eth_requestAccounts
// - eth_accounts
// - eth_chainId
// - eth_getBalance
// - eth_getTransactionCount
// - eth_estimateGas
// - eth_gasPrice
// - eth_sendTransaction
// - personal_sign
// - eth_signTypedData_v4
```

### EIP 3326 - 链切换
允许应用请求用户切换到不同的区块链网络。

```typescript
// 请求切换链
await wallet.switchChain(11155111); // Ethereum Sepolia
await wallet.switchChain(728126428); // TRON Mainnet
```

## WalletState API

### 状态属性

```typescript
// 连接状态
isConnected: boolean           // 是否已连接
isConnecting: boolean          // 是否正在连接
error: string | null           // 错误信息

// 账户信息
address: string | null         // 当前账户地址
chainId: number | null         // 当前链 ID
balance: bigint | null         // 账户余额 (wei)

// 钱包信息
provider: WalletProvider | null // 钱包提供商实例
availableWallets: WalletInfo[] // 检测到的所有钱包
selectedWalletUuid: string | null // 选中的钱包 UUID
```

### 连接方法

#### `connect(walletUuid?: string): Promise<void>`
连接到钱包 (EIP 1102)

```typescript
// 连接到默认钱包
await wallet.connect();

// 连接到特定钱包
await wallet.connect('metamask'); // UUID from availableWallets
```

**返回值**: 无
**错误处理**: 抛出异常如果用户拒绝或钱包不可用

#### `disconnect(): void`
断开与钱包的连接

```typescript
wallet.disconnect();
// 清除: address, chainId, balance, provider, selectedWalletUuid
```

### 交易方法

#### `sendTransaction(tx): Promise<string>`
发送交易

```typescript
const txHash = await wallet.sendTransaction({
  to: '0x1234...', // 目标地址
  value: '0x' + BigInt(1e18).toString(16), // 1 ETH
  data: '0x...', // 可选: 合约调用数据
  gas: '0x5208' // 可选: gas 限制
});
// 返回: '0xabcd...' (交易哈希)
```

**参数**:
- `to`: 目标地址 (必需)
- `value`: 发送的 wei 数量 (可选)
- `data`: 合约数据 (可选)
- `gas`: gas 限制 (可选，自动估算)

**返回值**: 交易哈希

#### `approveToken(tokenAddress, spenderAddress, amount): Promise<string>`
ERC20 代币授权

```typescript
const txHash = await wallet.approveToken(
  '0x7169D38EEAE47ADCDA14bB71DB5d1E4Ba537d1FA', // USDT 地址
  '0xEscrowContractAddress', // 合约地址
  String(BigInt(1000 * 1e18)) // 1000 USDT
);
```

**参数**:
- `tokenAddress`: ERC20 合约地址
- `spenderAddress`: 被授权地址
- `amount`: 授权金额 (wei)

**返回值**: 交易哈希

#### `transferToken(tokenAddress, toAddress, amount): Promise<string>`
ERC20 代币转账

```typescript
const txHash = await wallet.transferToken(
  '0x7169D38EEAE47ADCDA14bB71DB5d1E4Ba537d1FA', // USDT 地址
  '0x1234...', // 目标地址
  String(BigInt(100 * 1e18)) // 100 USDT
);
```

**返回值**: 交易哈希

### 签名方法

#### `signMessage(message): Promise<string>`
签名纯文本消息

```typescript
const signature = await wallet.signMessage('Hello World');
// 返回: '0xabcd...' (签名)
```

#### `signTypedData(typedData): Promise<string>`
签名结构化数据 (EIP-712)

```typescript
const signature = await wallet.signTypedData({
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ],
    Trade: [
      { name: 'seller', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
    ]
  },
  primaryType: 'Trade',
  domain: {
    name: 'Escrow DApp',
    version: '1',
    chainId: wallet.chainId!,
    verifyingContract: '0x...'
  },
  message: {
    seller: wallet.address!,
    amount: '1000000000000000000',
    nonce: 1
  }
});
```

### 链管理方法

#### `switchChain(chainId): Promise<void>`
切换网络 (EIP 3326)

```typescript
await wallet.switchChain(11155111); // 切换到 Ethereum Sepolia
await wallet.switchChain(728126428); // 切换到 TRON Mainnet
```

**参数**: 链 ID
**错误处理**: 如果链不支持，自动添加链配置

#### `getChainInfo(): ChainConfig | null`
获取当前链信息

```typescript
const chainInfo = wallet.getChainInfo();
// {
//   id: 11155111,
//   chainId: '0xaa36a7',
//   name: 'Ethereum Sepolia',
//   rpc: 'https://...',
//   symbol: 'ETH',
//   blockExplorer: 'https://...'
// }
```

#### `isChainSupported(chainId): boolean`
检查链是否支持

```typescript
if (wallet.isChainSupported(11155111)) {
  // 支持 Ethereum Sepolia
}
```

#### `getAvailableChains(): ChainConfig[]`
获取所有支持的链

```typescript
const chains = wallet.getAvailableChains();
// 返回所有配置的链
```

### 辅助方法

#### `updateBalance(): Promise<void>`
更新账户余额

```typescript
await wallet.updateBalance();
// wallet.balance 会被更新
```

#### `getNonce(): Promise<number>`
获取账户的交易计数 (nonce)

```typescript
const nonce = await wallet.getNonce();
// 用于构建交易
```

#### `getGasPrice(): Promise<bigint>`
获取当前 gas 价格

```typescript
const gasPrice = await wallet.getGasPrice(); // 单位: wei
```

## TransactionBuilder 工具类

用于构建低级别的合约调用数据

### 方法

#### `buildApprove(tokenAddress, spenderAddress, amount): {to, data}`
构建 ERC20 approve 调用

```typescript
const { to, data } = TransactionBuilder.buildApprove(
  '0x...', // token
  '0x...', // spender
  '1000000000000000000' // amount
);

// 发送交易
await wallet.sendTransaction({ to, data });
```

#### `buildTransfer(tokenAddress, toAddress, amount): {to, data}`
构建 ERC20 transfer 调用

```typescript
const { to, data } = TransactionBuilder.buildTransfer(
  '0x...', // token
  '0x...', // to
  '1000000000000000000' // amount
);
```

#### `buildContractCall(address, functionSignature, types, values): {to, data}`
构建自定义合约调用

```typescript
const { to, data } = TransactionBuilder.buildContractCall(
  '0xContractAddress',
  'functionName',
  ['address', 'uint256', 'bool'],
  ['0x1234...', '1000', true]
);
```

## WalletDiscovery 发现类

用于 EIP 6963 钱包发现

### 方法

#### `getWallets(): WalletInfo[]`
获取所有检测到的钱包

```typescript
const wallets = discovery.getWallets();
```

#### `getWallet(uuid): WalletInfo | undefined`
按 UUID 获取特定钱包

```typescript
const wallet = discovery.getWallet('metamask');
```

#### `getDefaultWallet(): WalletInfo | undefined`
获取默认钱包 (window.ethereum)

```typescript
const defaultWallet = discovery.getDefaultWallet();
```

#### `subscribe(callback): unsubscribe`
订阅钱包变化

```typescript
const unsubscribe = discovery.subscribe((wallets) => {
  console.log('Wallets changed:', wallets);
});

// 取消订阅
unsubscribe();
```

## Svelte 组件集成

### WalletButton 组件

自动处理钱包连接和网络切换的完整 UI 组件

```svelte
<script lang="ts">
  import WalletButton from '$lib/components/WalletButton.svelte';
</script>

<WalletButton />
```

**功能**:
- ✅ 钱包连接/断开连接
- ✅ 多钱包选择 (EIP 6963)
- ✅ 网络切换下拉菜单
- ✅ 余额显示
- ✅ 地址缩写显示
- ✅ 错误处理和显示

### 在自定义组件中使用

```svelte
<script lang="ts">
  import { getWalletState } from '$lib/state.svelte';
  
  const wallet = getWalletState();
  
  async function handleTransaction() {
    if (!wallet.isConnected) {
      await wallet.connect();
    }
    
    // 现在可以发送交易
    const txHash = await wallet.sendTransaction({
      to: '0x...',
      value: '0x...'
    });
  }
</script>

{#if wallet.isConnected}
  <p>Connected: {wallet.address}</p>
  <p>Balance: {wallet.balance ? (Number(wallet.balance) / 1e18).toFixed(4) : '0'}</p>
  <button onclick={handleTransaction}>Send Transaction</button>
{/if}
```

## 事件监听

钱包提供商发出的事件会自动由 WalletState 处理：

- `accountsChanged`: 账户更改时自动更新 `address`
- `chainChanged`: 链更改时自动更新 `chainId`
- `disconnect`: 断开连接时自动调用 `disconnect()`

## 错误处理

```typescript
try {
  await wallet.connect();
} catch (err) {
  // wallet.error 会被设置
  console.error('Connection error:', wallet.error);
}

// 或检查状态
if (wallet.error) {
  console.error('Current error:', wallet.error);
}
```

## 支持的网络

| 网络 | Chain ID | 符号 | RPC 端点 |
|-----|----------|------|---------|
| Ethereum Mainnet | 1 | ETH | https://eth.public-rpc.com |
| Ethereum Sepolia | 11155111 | ETH | https://sepolia.eth.public-rpc.com |
| TRON Mainnet | 728126428 | TRX | https://api.tronstack.com/jsonrpc |
| TRON Shasta | 2494104990 | TRX | https://api.shasta.tronstack.com/jsonrpc |

## 完整使用示例

见 `WALLET_API_GUIDE.md`

