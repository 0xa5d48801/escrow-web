import { publicClient, walletClient, SUPPORTED_CHAINS, CHAIN_CONFIGS } from './web3.svelte';
import { getWalletDiscovery, TransactionBuilder, type WalletInfo, type WalletProvider } from './wallet-manager.svelte';

export class WalletAccount {
	address: string;
	chainId: number;
	balance: bigint | null = null;
	provider: WalletProvider;
	walletUuid: string;
	walletName: string;
	lastUsed: number; // timestamp

	constructor(address: string, chainId: number, provider: WalletProvider, walletUuid: string, walletName: string) {
		this.address = address;
		this.chainId = chainId;
		this.provider = provider;
		this.walletUuid = walletUuid;
		this.walletName = walletName;
		this.lastUsed = Date.now();
	}
}

export class DarkMode {
	isDark = $state(false);
	isInitialized = $state(false);

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('darkMode');
			if (saved) {
				this.isDark = saved === 'true';
			} else {
				this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			}
			this.isInitialized = true;
			this.updateDOM();
		}
	}

	toggle() {
		this.isDark = !this.isDark;
		localStorage.setItem('darkMode', String(this.isDark));
		this.updateDOM();
	}

	private updateDOM() {
		if (typeof document !== 'undefined') {
			if (this.isDark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
}

export class Language {
	current = $state('en');
	isInitialized = $state(false);

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('language');
			if (saved) {
				this.current = saved;
			} else {
				const browserLang = navigator.language?.split('-')[0] || 'en';
				this.current = ['en', 'zh'].includes(browserLang) ? browserLang : 'en';
			}
			this.isInitialized = true;
		}
	}

	set(lang: 'en' | 'zh') {
		this.current = lang;
		localStorage.setItem('language', lang);
	}
}

export class WalletState {
	isConnected = $state(false);
	address = $state<string | null>(null);
	chainId = $state<number | null>(null);
	balance = $state<bigint | null>(null);
	isConnecting = $state(false);
	error = $state<string | null>(null);
	provider = $state<WalletProvider | null>(null);
	availableWallets = $state<WalletInfo[]>([]);
	selectedWalletUuid = $state<string | null>(null);
	
	// Multi-wallet support
	connectedAccounts = $state<WalletAccount[]>([]);
	activeAccountIndex = $state(0);

	constructor() {
		this.initializeWalletDiscovery();
		// Don't call setupEventListeners() here - wait for user to actually connect
		// This avoids conflicts when multiple wallet extensions are injecting
		this.restoreConnection();
	}

	private initializeWalletDiscovery() {
		const discovery = getWalletDiscovery();
		discovery.subscribe((wallets) => {
			this.availableWallets = wallets;
		});
		this.availableWallets = discovery.getWallets();
	}

	/**
	 * Trigger wallet discovery and wait for results
	 * Uses EIP-6963 protocol with timeout fallback
	 */
	async discoverWallets() {
		console.debug('[Wallet Discovery] Starting wallet discovery via EIP-6963...');
		const discovery = getWalletDiscovery();
		
		// Wait for wallets to be discovered via EIP-6963
		const wallets = await discovery.waitForDiscovery(3000);
		this.availableWallets = wallets;
		console.debug(`[Wallet Discovery] ✅ EIP-6963 found ${wallets.length} wallet(s)`);

		// No window.ethereum fallback - only use EIP-6963
		// This eliminates all wallet extension conflicts
		
		if (this.availableWallets.length === 0) {
			console.warn('[Wallet Discovery] ⚠️ No wallets discovered');
		}

		return this.availableWallets;
	}

	private setupEventListeners() {
		if (typeof window === 'undefined') return;

		// Get provider from active account (already connected via EIP-6963 or fallback)
		const activeAccount = this.getActiveAccount();
		if (!activeAccount || !activeAccount.provider) {
			console.debug('[Event Listeners] No active account provider, skipping event listener setup');
			return;
		}

		const ethereum = activeAccount.provider;
		if (typeof ethereum.on !== 'function') {
			console.debug('[Event Listeners] Provider does not support event listeners');
			return;
		}

		// Listen for account changes
		try {
			ethereum.on('accountsChanged', (accounts: string[]) => {
				console.debug('[Event Listeners] accountsChanged:', accounts);
				if (accounts.length === 0) {
					this.disconnect();
				} else {
					// If active account is from this provider, update it
					const account = this.getActiveAccount();
					if (account && accounts.includes(account.address)) {
						// Provider still has this account connected
						if (this.address !== accounts[0]) {
							this.address = accounts[0];
							// Update active account address if it changed
							account.address = accounts[0];
							this.updateBalance();
							this.saveConnectedAccounts();
						}
					}
				}
			});
		} catch (err) {
			console.debug('[Event Listeners] Failed to setup accountsChanged listener:', err);
		}

		// Listen for chain changes
		try {
			ethereum.on('chainChanged', (chainId: string) => {
				console.debug('[Event Listeners] chainChanged:', chainId);
				const newChainId = parseInt(chainId, 16);
				// Update active account's chain
				const account = this.getActiveAccount();
				if (account) {
					this.chainId = newChainId;
					account.chainId = newChainId;
					this.saveConnectedAccounts();
				}
			});
		} catch (err) {
			console.debug('[Event Listeners] Failed to setup chainChanged listener:', err);
		}

		// Listen for disconnect
		try {
			ethereum.on('disconnect', () => {
				console.debug('[Event Listeners] disconnect event received');
				this.disconnect();
			});
		} catch (err) {
			console.debug('[Event Listeners] Failed to setup disconnect listener:', err);
		}

		console.debug('[Event Listeners] ✅ Event listeners setup complete for provider');
	}

	private restoreConnection() {
		if (typeof window === 'undefined') return;

		const savedAccounts = localStorage.getItem('connectedAccounts');
		const savedActiveIndex = localStorage.getItem('activeAccountIndex');

		if (savedAccounts) {
			try {
				const accountsData = JSON.parse(savedAccounts);
				const activeIdx = savedActiveIndex ? parseInt(savedActiveIndex) : 0;
				
				// Restore accounts
				for (const account of accountsData) {
					const discovery = getWalletDiscovery();
					const walletInfo = discovery.getWallet(account.walletUuid);
					if (walletInfo) {
						const walletAccount = new WalletAccount(
							account.address,
							account.chainId,
							walletInfo.provider,
							account.walletUuid,
							account.walletName
						);
						this.connectedAccounts.push(walletAccount);
					}
				}

				if (this.connectedAccounts.length > 0) {
					this.activeAccountIndex = Math.min(activeIdx, this.connectedAccounts.length - 1);
					this.setActiveAccount(this.activeAccountIndex);
					this.isConnected = true;
					
					// Setup event listeners for restored connection after a short delay
					// to allow wallet extension to fully initialize
					setTimeout(() => {
						try {
							this.setupEventListeners();
						} catch (err) {
							console.debug('[Restore] Failed to setup event listeners for restored connection:', err);
						}
					}, 500);
				}
			} catch (err) {
				console.error('Failed to restore connection:', err);
			}
		}
	}

	/**
	 * Connect wallet (EIP 6963 priority with EIP 1102 fallback)
	 */
	async connect(walletUuid?: string) {
		if (typeof window === 'undefined') return;

		this.isConnecting = true;
		this.error = null;

		try {
			let provider: WalletProvider;
			let walletName = 'Wallet';

			// Only support EIP-6963 wallets - no window.ethereum fallback
			// This eliminates all wallet extension conflicts
			
			if (walletUuid) {
				// Use specific wallet from EIP-6963
				const discovery = getWalletDiscovery();
				const walletInfo = discovery.getWallet(walletUuid);

				if (!walletInfo) {
					throw new Error(`Wallet ${walletUuid} not found. Please ensure it's installed.`);
				}

				provider = walletInfo.provider;
				walletName = walletInfo.name;
				this.selectedWalletUuid = walletUuid;
			} else {
				// Auto-detect: use first available EIP-6963 wallet
				const discovery = getWalletDiscovery();
				const walletInfo = discovery.getDefaultWallet();

				if (!walletInfo) {
					throw new Error('No EIP-6963 wallet found. Please install a modern wallet like MetaMask, Trust Wallet, or Coinbase Wallet.');
				}

				provider = walletInfo.provider;
				walletName = walletInfo.name;
				this.selectedWalletUuid = walletInfo.uuid;
			}

			this.provider = provider;

			// Request accounts (EIP 1102)
			let accounts: string[] = [];
			try {
				accounts = await provider.request({
					method: 'eth_requestAccounts',
					params: []
				});
			} catch (err: any) {
				if (err.code === 4001) {
					// User rejected the request
					throw new Error('User rejected wallet connection');
				}
				// Fallback: try eth_accounts if eth_requestAccounts fails
				try {
					accounts = await provider.request({
						method: 'eth_accounts',
						params: []
					});
					if (accounts.length === 0) {
						throw new Error('No accounts returned from wallet');
					}
				} catch (fallbackErr) {
					throw new Error('Failed to connect to wallet. Please ensure it is unlocked and try again.');
				}
			}

			if (!accounts || accounts.length === 0) {
				throw new Error('No accounts found in wallet');
			}

			// Get chain ID
			let chainId: number;
			try {
				const chainIdHex = await provider.request({
					method: 'eth_chainId',
					params: []
				});
				chainId = parseInt(chainIdHex, 16);
			} catch (err) {
				console.warn('Failed to get chain ID, defaulting to 1:', err);
				chainId = 1; // Default to Ethereum mainnet
			}

			// Add all accounts from this wallet
			for (const account of accounts) {
				const existingAccount = this.connectedAccounts.find(
					(a) => a.address.toLowerCase() === account.toLowerCase()
				);

				if (!existingAccount) {
					const walletAccount = new WalletAccount(
						account,
						chainId,
						provider,
						walletUuid || 'injected',
						walletName
					);
					
					// Get balance for this account
					try {
						const balanceHex = await provider.request({
							method: 'eth_getBalance',
							params: [account, 'latest']
						});
						walletAccount.balance = BigInt(balanceHex);
					} catch (err) {
						console.warn('Failed to get balance for account:', err);
						walletAccount.balance = null;
					}

					this.connectedAccounts.push(walletAccount);
				}
			}

			// Set first account as active
			if (this.connectedAccounts.length > 0) {
				this.setActiveAccount(0);
				this.isConnected = true;
				this.saveConnectedAccounts();
				
				// Now that wallet is connected, setup event listeners for future changes
				this.setupEventListeners();
			}
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Connection failed';
			this.error = errorMsg;
			this.isConnected = this.connectedAccounts.length > 0;
			throw err; // Re-throw for UI to handle
		} finally {
			this.isConnecting = false;
		}
	}

	/**
	 * Disconnect wallet - remove all connected accounts
	 */
	disconnect() {
		this.isConnected = false;
		this.address = null;
		this.chainId = null;
		this.balance = null;
		this.error = null;
		this.provider = null;
		this.selectedWalletUuid = null;
		this.connectedAccounts = [];
		this.activeAccountIndex = 0;

		// Clear local storage
		localStorage.removeItem('connectedAccounts');
		localStorage.removeItem('activeAccountIndex');
	}

	/**
	 * Disconnect a single account
	 */
	disconnectAccount(index: number) {
		if (index < 0 || index >= this.connectedAccounts.length) return;

		this.connectedAccounts.splice(index, 1);

		if (this.connectedAccounts.length === 0) {
			this.disconnect();
		} else if (this.activeAccountIndex >= this.connectedAccounts.length) {
			this.setActiveAccount(this.connectedAccounts.length - 1);
		} else {
			this.setActiveAccount(this.activeAccountIndex);
		}

		this.saveConnectedAccounts();
	}

	/**
	 * Switch to a different connected account
	 */
	setActiveAccount(index: number) {
		if (index < 0 || index >= this.connectedAccounts.length) return;

		this.activeAccountIndex = index;
		const account = this.connectedAccounts[index];

		this.address = account.address;
		this.chainId = account.chainId;
		this.balance = account.balance || null;
		this.provider = account.provider;
		this.selectedWalletUuid = account.walletUuid;

		this.isConnected = true;
		account.lastUsed = Date.now();

		this.saveConnectedAccounts();
	}

	/**
	 * Get currently active account
	 */
	getActiveAccount(): WalletAccount | null {
		if (this.activeAccountIndex >= 0 && this.activeAccountIndex < this.connectedAccounts.length) {
			return this.connectedAccounts[this.activeAccountIndex];
		}
		return null;
	}

	/**
	 * Save connected accounts to localStorage
	 */
	private saveConnectedAccounts() {
		if (typeof window === 'undefined') return;

		const accountsData = this.connectedAccounts.map((account) => ({
			address: account.address,
			chainId: account.chainId,
			walletUuid: account.walletUuid,
			walletName: account.walletName,
			lastUsed: account.lastUsed
		}));

		localStorage.setItem('connectedAccounts', JSON.stringify(accountsData));
		localStorage.setItem('activeAccountIndex', String(this.activeAccountIndex));
	}

	/**
	 * Update wallet balance for active account
	 */
	async updateBalance() {
		const account = this.getActiveAccount();
		if (!account) return;

		try {
			const balance = await walletClient.getBalance(account.address);
			account.balance = balance;
			this.balance = balance;
		} catch (err) {
			console.error('Failed to get balance:', err);
		}
	}

	/**
	 * Switch network (EIP 3326)
	 */
	async switchChain(chainId: number) {
		if (!this.isConnected) {
			throw new Error('Wallet not connected');
		}

		const account = this.getActiveAccount();
		if (!account) throw new Error('No active account');

		try {
			await walletClient.switchChain(chainId);
			// Update both global state and active account
			this.chainId = chainId;
			account.chainId = chainId;
			localStorage.setItem('connectedChainId', String(chainId));
			this.saveConnectedAccounts();
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to switch chain';
			throw err;
		}
	}

	/**
	 * Send transaction
	 */
	async sendTransaction(tx: {
		to: string;
		value?: string;
		data?: string;
		gas?: string;
	}): Promise<string> {
		if (!this.isConnected || !this.address) {
			throw new Error('Wallet not connected');
		}

		const account = this.getActiveAccount();
		if (!account || !account.provider) throw new Error('No active account with provider');

		try {
			// Estimate gas if not provided
			if (!tx.gas) {
				const estimated = await walletClient.estimateGas({
					...tx,
					from: this.address
				});
				tx.gas = '0x' + estimated.toString(16);
			}

			const txHash = await walletClient.sendTransaction({
				from: this.address,
				to: tx.to,
				value: tx.value,
				data: tx.data,
				gas: tx.gas
			});

			return txHash;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Transaction failed';
			throw err;
		}
	}

	/**
	 * Approve ERC20 token
	 */
	async approveToken(
		tokenAddress: string,
		spenderAddress: string,
		amount: string
	): Promise<string> {
		const { to, data } = TransactionBuilder.buildApprove(
			tokenAddress,
			spenderAddress,
			amount
		);

		return this.sendTransaction({
			to,
			data
		});
	}

	/**
	 * Transfer ERC20 token
	 */
	async transferToken(
		tokenAddress: string,
		toAddress: string,
		amount: string
	): Promise<string> {
		const { to, data } = TransactionBuilder.buildTransfer(
			tokenAddress,
			toAddress,
			amount
		);

		return this.sendTransaction({
			to,
			data
		});
	}

	/**
	 * Sign message
	 */
	async signMessage(message: string): Promise<string> {
		if (!this.isConnected || !this.address) {
			throw new Error('Wallet not connected');
		}

		const account = this.getActiveAccount();
		if (!account || !account.provider) throw new Error('No active account with provider');

		try {
			return await walletClient.signMessage(this.address, message);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Signing failed';
			throw err;
		}
	}

	/**
	 * Sign typed data (EIP-712)
	 */
	async signTypedData(typedData: any): Promise<string> {
		if (!this.isConnected || !this.address) {
			throw new Error('Wallet not connected');
		}

		const account = this.getActiveAccount();
		if (!account || !account.provider) throw new Error('No active account with provider');

		try {
			return await walletClient.signTypedData(this.address, typedData);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Signing failed';
			throw err;
		}
	}

	/**
	 * Get nonce for address
	 */
	async getNonce(): Promise<number> {
		if (!this.address) throw new Error('No address connected');
		return walletClient.getTransactionCount(this.address);
	}

	/**
	 * Get gas price
	 */
	async getGasPrice(): Promise<bigint> {
		return walletClient.getGasPrice();
	}

	/**
	 * Get chain info
	 */
	getChainInfo() {
		if (!this.chainId) return null;
		return CHAIN_CONFIGS[this.chainId as keyof typeof CHAIN_CONFIGS];
	}

	/**
	 * Check if chain is supported
	 */
	isChainSupported(chainId: number): boolean {
		return chainId in CHAIN_CONFIGS;
	}

	/**
	 * Get all supported chains
	 */
	getAvailableChains() {
		return Object.values(CHAIN_CONFIGS);
	}
}

export class TradeState {
	trades = $state<Trade[]>([]);
	credits = $state<Map<string, Credit>>(new Map());
	isLoading = $state(false);
	error = $state<string | null>(null);

	async loadTrades() {
		this.isLoading = true;
		this.error = null;

		try {
			// TODO: Load trades from contract
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load trades';
		} finally {
			this.isLoading = false;
		}
	}

	async loadCredit(address: string) {
		try {
			// TODO: Load credit from contract
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load credit';
		}
	}
}

export interface Trade {
	id: number;
	seller: string;
	buyer: string;
	goodsAmount: bigint;
	sellerDeposit: bigint;
	buyerDeposit: bigint;
	fee: bigint;
	createTime: number;
	discountPercentage: number;
	status: 'Created' | 'Joined' | 'Confirmed' | 'Cancelled';
}

export interface Credit {
	successCountBuyer: number;
	successCountSeller: number;
	successAmountBuyer: bigint;
	successAmountSeller: bigint;
	pendingCount: number;
	pendingAmount: bigint;
}

// Global state instances
let darkMode: DarkMode;
let language: Language;
let walletState: WalletState;
let tradeState: TradeState;

export function getDarkMode(): DarkMode {
	if (!darkMode) darkMode = new DarkMode();
	return darkMode;
}

export function getLanguage(): Language {
	if (!language) language = new Language();
	return language;
}

export function getWalletState(): WalletState {
	if (!walletState) walletState = new WalletState();
	return walletState;
}

export function getTradeState(): TradeState {
	if (!tradeState) tradeState = new TradeState();
	return tradeState;
}
