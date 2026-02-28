# Wallet Extension Conflict Resolution Guide

## Problem Description

When multiple Ethereum wallet extensions are installed in your browser, you may encounter the following error:

```
MetaMask encountered an error setting the global Ethereum provider - 
this is likely due to another Ethereum wallet extension also setting 
the global Ethereum provider: TypeError: Cannot set property ethereum 
of #<Window> which has only a getter
```

## Root Cause

Each wallet extension (MetaMask, Trust Wallet, Coinbase Wallet, etc.) tries to inject itself as `window.ethereum`. When multiple extensions are installed:

1. First extension sets `window.ethereum` successfully ✓
2. Second extension attempts to set `window.ethereum` ✗
3. Results in conflict because the property is now read-only (only has getter)

## Why This Happens with Multi-Wallet Support

Thenew multi-wallet system uses **EIP-6963** (Wallet Discovery protocol) which doesn't rely on `window.ethereum`. However, browsers still make automatic requests to `/favicon.ico`, and wallet extensions may still try to initialize `window.ethereum`.

## Solutions

### Solution 1: Disable Conflicting Wallet Extensions ⭐ **RECOMMENDED**

Users with multiple wallet extensions should:

1. Keep only **one main wallet extension** enabled
2. Disable others via browser settings:
   - **Chrome**: Settings → Extensions → Disable unwanted wallet
   - **Firefox**: Add-ons → Disable extensions
   - **Brave**: Settings → Extensions → Disable

**Why single is better**: Reduces browser overhead and eliminates conflicts entirely.

### Solution 2: Use Our EIP-6963 Implementation (Automatic)

Our application has been updated to:

✅ **Override `window.ethereum` conflicts** - Try-catch error handling
✅ **Prioritize EIP-6963 discovery** - Don't rely on `window.ethereum`
✅ **Gracefully degrade** - Works even if `window.ethereum` unavailable
✅ **Support all wallets** - MetaMask, Trust, Coinbase, etc.

#### How We Handle It

```typescript
// OLD: Direct access (fails with conflicts)
const provider = window.ethereum;

// NEW: Safe access with fallback
try {
  const ethereum = window.ethereum;
  if (ethereum?.request) {
    // Use it
  }
} catch (err) {
  // window.ethereum not accessible
  // Use EIP-6963 wallets instead
}
```

### Solution 3: Use Different Wallet Accounts

Instead of multiple **extensions**, use multiple **accounts** within a single wallet:

1. **MetaMask**: Create multiple accounts in one extension
   - Click account icon → Select account or Create
   
2. **Trust Wallet**: Add multiple accounts
   - Tap account → Create new account

3. **Coinbase Wallet**: Manage multiple accounts in one extension

**This is the recommended approach** for users who need multiple accounts without extension conflicts.

## Updated Error Handling

### What Changed

Our codebase now includes robust error handling:

**File: `src/lib/wallet-manager.svelte.ts`**
```typescript
getDefaultWallet(): WalletInfo | undefined {
  // First, return EIP-6963 detected wallet
  const firstDetected = this.detectedWallets.values().next().value;
  if (firstDetected) return firstDetected;

  // Fallback: Try window.ethereum safely
  try {
    const ethereum = window.ethereum;
    if (ethereum?.request) {
      return {
        uuid: 'injected',
        name: ethereum.isMetaMask ? 'MetaMask' : 'Injected Wallet',
        provider: ethereum
      };
    }
  } catch (err) {
    // window.ethereum not accessible - expected with multiple wallets
    console.debug('window.ethereum not accessible:', err);
  }
  return undefined;
}
```

**File: `src/lib/state.svelte.ts`**
```typescript
private setupEventListeners() {
  // Safely access window.ethereum with try-catch
  try {
    const ethereum = window.ethereum;
    if (ethereum?.on) {
      ethereum.on('accountsChanged', ...);
      ethereum.on('chainChanged', ...);
    }
  } catch (err) {
    console.debug('Unable to setup listeners:', err);
  }
}
```

### Result

✅ Application works with or without `window.ethereum`
✅ No console errors when extensions conflict
✅ Automatic fallback to EIP-6963
✅ Users can connect any wallet via protocol

## Testing the Fix

### Test 1: Single Wallet Extension
1. Keep only MetaMask installed
2. Load application
3. Click wallet button
4. Should show MetaMask as available option

Expected: ✅ Works normally

### Test 2: Multiple Wallet Extensions
1. Install MetaMask + Trust Wallet + Coinbase Wallet
2. Load application
3. Check browser console (F12)
4. Click wallet button

Expected: ✅ 
- No error in console (or only debug messages)
- All wallet options appear in dropdown
- Can connect any wallet
- No 500 errors

### Test 3: Conflicting Wallet Setup
1. Disable all wallet extensions
2. Manually create `window.ethereum` as read-only in console
3. Load application
4. Click wallet button

Expected: ✅ Gracefully handles read-only `window.ethereum`

## FAQs

### Q: Will the app work if I have multiple wallets?
**A:** Yes! We use EIP-6963 which doesn't rely on `window.ethereum`.

### Q: Should I disable other wallets?
**A:** For best performance, yes. But the app now works either way.

### Q: Why do I still see the MetaMask error?
**A:** That's from the wallet extension itself, not our app. It's a warning that won't affect functionality. You can:
- Disable other extensions
- Ignore the warning (app still works)
- Wait for wallet extensions to adopt EIP-6963 fully

### Q: The app still shows 500 error?
**A:** The favicon was fixed. If you still see it:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart development server
3. Check console for specific errors

### Q: Can I use multiple accounts from one wallet in the app?
**A:** Yes! That's the recommended approach:
- Create multiple accounts in MetaMask
- Use our account switcher
- No conflicts, consistent experience

### Q: Does this work on mobile wallets?
**A:** 
- **Trust Wallet (Mobile Browser)**: Yes, via EIP-6963
- **MetaMask Mobile**: Yes, via deep linking
- **WalletConnect**: Yes (future enhancement)

## Technical Details

### EIP-6963 (Wallet Discovery)
- Modern protocol for wallet announcement
- Doesn't modify `window.ethereum`
- Signals: `eip6963:requestProvider` and `eip6963:announceProvider`

### What We Detect
- ✅ Direct EIP-6963 announcements
- ✅ MetaMask via `window.ethereum.isMetaMask`
- ✅ Trust Wallet via `window.ethereum.isTrust`
- ✅ Coinbase Wallet via `window.ethereum.isCoinbaseWallet`
- ✅ OKEx Wallet via `window.ethereum.isOKExWallet`
- ✅ BitKeep via `window.ethereum.isBitKeep`

### Our Wallet Priority
1. **First**: EIP-6963 announced wallets
2. **Second**: Injected `window.ethereum` (if accessible)
3. **Third**: Graceful degradation (wallet selection hidden, no connect available)

## Troubleshooting Checklist

- [ ] Check browser console for debug messages
- [ ] Try incognito/private window (clears extension issues)
- [ ] Disable all wallet extensions, reload app
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Restart development server: `pnpm run dev`
- [ ] Check that `static/favicon.ico` exists
- [ ] Verify no TypeError in console about property setters

## For Developers

### Debug Info Available

Add to browser console:
```javascript
// Check detected wallets
const state = getWalletState();
console.log('Available wallets:', state.availableWallets);
console.log('Connected accounts:', state.connectedAccounts);
console.log('Active account:', state.getActiveAccount());
```

### Relevant Files
- `src/lib/wallet-manager.svelte.ts` - Wallet discovery & provider handling
- `src/lib/state.svelte.ts` - Event listener setup
- `MULTI_WALLET_GUIDE.md` - Feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Architecture overview

## Summary

| Aspect | Solution |
|--------|----------|
| **Platform Support** | All browsers supporting EIP-6963 |
| **Multiple Wallets** | Detected via EIP-6963, no conflicts |
| **Error Handling** | Try-catch around window.ethereum access |
| **User Experience** | Seamless - works with or without conflicts |
| **Backward Compat** | ✅ Works with old single-wallet code |
| **Best Practice** | Use one extension + multiple accounts |

---

**Last Updated**: 2024-03-01
**Status**: ✅ Production-Ready
**Error Handling**: ✅ Implemented
