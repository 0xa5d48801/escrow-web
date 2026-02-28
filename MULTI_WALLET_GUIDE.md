# Multi-Wallet Support Guide

## Overview

The escrow-web application now supports multiple wallet connections from different wallet extensions (MetaMask, Trust Wallet, Coinbase Wallet, etc.). Users can connect multiple wallets simultaneously and switch between accounts seamlessly.

## Architecture

### Core Components

#### 1. **WalletAccount Class** (`src/lib/state.svelte.ts`)

Represents a single account from any wallet extension:

```typescript
class WalletAccount {
  address: string;              // Account address
  chainId: number;              // Currently connected chain
  balance: bigint | null;       // Account balance (cached)
  provider: WalletProvider;     // EIP-1193 provider instance
  walletUuid: string;           // Unique wallet identifier
  walletName: string;           // Human-readable wallet name
  lastUsed: number;             // Timestamp of last usage
}
```

#### 2. **WalletState Class** (Enhanced)

Multi-account state management with account switching:

**New Properties:**
- `connectedAccounts: WalletAccount[]` - Array of all connected accounts
- `activeAccountIndex: number` - Index of currently active account

**New Methods:**

- `setActiveAccount(index: number)` - Switch to a different connected account
- `getActiveAccount(): WalletAccount | null` - Get current active account
- `disconnectAccount(index: number)` - Disconnect a single account
- `saveConnectedAccounts()` - Persist accounts to localStorage

**Enhanced Methods:**

- `connect(walletUuid?)` - Adds new wallets without disconnecting existing ones
- `disconnect()` - Clears all connected accounts
- `switchChain(chainId)` - Updates active account's chain
- `restoreConnection()` - Restores all connected accounts on page load

## Features

### 1. **Multiple Wallet Connection**

Users can connect accounts from different wallet extensions in a single session:

```typescript
// Connect first wallet
await wallet.connect('MetaMask-UUID');

// Connect second wallet
await wallet.connect('TrustWallet-UUID');

// connectedAccounts now contains accounts from both wallets
```

### 2. **Account Switching**

Switch between connected accounts with a single method call:

```typescript
// Switch to account at index 1
wallet.setActiveAccount(1);

// Active account properties update automatically
console.log(wallet.address);        // Address of account 1
console.log(wallet.chainId);        // Chain of account 1
console.log(wallet.provider);       // Provider of account 1
```

### 3. **Persistent Storage**

Connected accounts are automatically persisted to localStorage:

```json
{
  "connectedAccounts": [
    {
      "address": "0x1234...",
      "chainId": 1,
      "walletUuid": "MetaMask-UUID",
      "walletName": "MetaMask",
      "lastUsed": 1699564800000
    },
    {
      "address": "0x5678...",
      "chainId": 56,
      "walletUuid": "TrustWallet-UUID",
      "walletName": "Trust Wallet",
      "lastUsed": 1699564950000
    }
  ],
  "activeAccountIndex": 0
}
```

### 4. **Account Management UI** (WalletButton Component)

The wallet button displays all connected accounts:

- **Account List**: Shows all connected wallets with address and wallet name
- **Account Switcher**: Click on any account to make it active (indicated by checkmark)
- **Individual Disconnect**: X button removes specific account
- **Add Another Wallet**: Connect additional wallets
- **Disconnect All**: Clears all connections

### 5. **Automatic Event Handling**

The wallet state automatically syncs with provider events:

- **Account Changes**: Updates active account if still connected
- **Chain Changes**: Updates active account's chain
- **Disconnect Event**: Clears all connections if wallet disconnects

## Usage Examples

### Example 1: Connect Multiple Wallets

```typescript
import { getWalletState } from '$lib/state.svelte';

const wallet = getWalletState();

// User clicks "Connect MetaMask"
await wallet.connect('MetaMask-UUID');

// User clicks "Add Another Wallet" → "Trust Wallet"
await wallet.connect('TrustWallet-UUID');

// Now wallet.connectedAccounts has 2 accounts
console.log(wallet.connectedAccounts.length); // 2

// Active account is the first one (MetaMask)
console.log(wallet.address); // MetaMask account address
```

### Example 2: Switch Between Accounts

```typescript
// Show account list in UI
{#each wallet.connectedAccounts as account, index}
  <button
    on:click={() => wallet.setActiveAccount(index)}
    class:active={wallet.activeAccountIndex === index}
  >
    {account.walletName}: {formatAddress(account.address)}
  </button>
{/each}

// When user clicks account
wallet.setActiveAccount(1);

// All subsequent transactions use the new active account
await wallet.sendTransaction({
  to: '0xrecipient...',
  value: '1000000000000000000'
});
```

### Example 3: Per-Account Chain Switching

```typescript
// Switch chain on active account
await wallet.switchChain(56); // BSC

// connectedAccounts[activeAccountIndex].chainId is now 56
// All other accounts retain their previous chainId
```

### Example 4: Disconnect Single Account

```typescript
// Remove account at index 1
wallet.disconnectAccount(1);

// If index was active, switches to next available
// If only 1 account left, becomes active
// connectedAccounts array shrinks
```

## Error Handling

```typescript
try {
  await wallet.connect(walletUuid);
} catch (error) {
  if (error.message.includes('User rejected')) {
    // Handle user rejection
  } else if (error.message.includes('already connected')) {
    // Account already in list
    wallet.setActiveAccount(foundIndex);
  } else {
    // Other errors
    console.error('Connection failed:', error);
  }
}
```

## Backward Compatibility

- Existing code using `wallet.address`, `wallet.chainId`, `wallet.provider` continues to work
- These properties automatically reference the active account
- Single-account workflows remain unchanged
- New features are additive, not breaking

## Storage Format

### localStorage Keys:

1. **`connectedAccounts`**: JSON array of account data
   ```json
   [
     {
       "address": "0x1234...",
       "chainId": 1,
       "walletUuid": "uuid",
       "walletName": "MetaMask",
       "lastUsed": 1699564800000
     }
   ]
   ```

2. **`activeAccountIndex`**: Current active account index
   ```
   0
   ```

3. **Legacy Keys** (auto-migrated):
   - `connectedAddress` → removed
   - `connectedChainId` → removed
   - `connectedWalletUuid` → removed

## Provider Isolation

Each connected account maintains its own provider instance:

```typescript
const account1 = wallet.connectedAccounts[0];
const account2 = wallet.connectedAccounts[1];

// Different providers from different wallet extensions
account1.provider !== account2.provider; // true

// Each provider can make independent requests
await account1.provider.request({
  method: 'eth_getBalance',
  params: [account1.address, 'latest']
});

await account2.provider.request({
  method: 'eth_getBalance',
  params: [account2.address, 'latest']
});
```

## Limitations & Future Improvements

1. **Simulation Mode**: Currently only supports real wallet connections
   - Future: Add mock/simulation accounts for testing

2. **Account Metadata**: Currently stores basic info
   - Future: Add account nicknames, custom labels, avatars

3. **Transaction History**: Not tracked per account
   - Future: Maintain transaction queue per account

4. **Batch Operations**: Currently single account at a time
   - Future: Support batch transactions across multiple accounts

## Testing Checklist

- [ ] Connect MetaMask wallet
- [ ] Connect Trust Wallet (different extension)
- [ ] Switch between accounts
- [ ] Verify account address updates in UI
- [ ] Switch chain on active account
- [ ] Disconnect single account
- [ ] Disconnect all accounts
- [ ] Refresh page → accounts restored
- [ ] Send transaction with active account
- [ ] Sign message with active account
- [ ] Switch account mid-transaction
- [ ] Test with accounts on different chains

## Troubleshooting

### Accounts Not Persisting
- Check localStorage for `connectedAccounts` key
- Verify activeAccountIndex is also saved
- Clear localStorage and reconnect

### Account Switching Not Working
- Ensure `wallet.connectedAccounts.length > 1`
- Check if provider is properly initialized
- Verify activeAccountIndex is within bounds

### Transaction Using Wrong Account
- Call `wallet.setActiveAccount(correctIndex)` before transaction
- Verify `wallet.getActiveAccount()` returns correct account
- Check wallet.address matches intended account

### Provider Conflicts
- Disable conflicting wallet extensions
- Use a single wallet extension per browser profile
- Test with different wallet combinations

## Common Patterns

### Set Up Multi-Wallet Dropdown

```svelte
{#if wallet.connectedAccounts.length > 1}
  <div class="account-selector">
    <select bind:value={wallet.activeAccountIndex}>
      {#each wallet.connectedAccounts as account, index}
        <option value={index}>
          {account.walletName} - {formatAddress(account.address)}
        </option>
      {/each}
    </select>
  </div>
{/if}
```

### Update UI When Account Changes

```svelte
{#key wallet.activeAccountIndex}
  <div class="current-account">
    <p>Connected: {wallet.address}</p>
    <p>Chain: {getChainName(wallet.chainId)}</p>
    <p>Balance: {formatBalance(wallet.balance)}</p>
  </div>
{/key}
```

### Require Specific Account

```typescript
async function requireAccount(walletName: string) {
  const account = wallet.connectedAccounts.find(
    (acc) => acc.walletName === walletName
  );
  
  if (!account) {
    throw new Error(`${walletName} not connected`);
  }
  
  wallet.setActiveAccount(
    wallet.connectedAccounts.indexOf(account)
  );
}
```

---

**Last Updated**: 2024
**Version**: Multi-Wallet Support v1.0
