/**
 * Wallet Manager - EIP 6963 Wallet Discovery Protocol
 * Supports wallet detection, connection, and transaction handling
 */

export interface WalletProvider {
	isMetaMask?: boolean;
	isTrust?: boolean;
	isOKExWallet?: boolean;
	isBitKeep?: boolean;
	[key: string]: any;
	request: (args: { method: string; params?: any[] }) => Promise<any>;
	on: (event: string, handler: (...args: any[]) => void) => void;
	removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

export interface WalletInfo {
	uuid: string;
	name: string;
	icon: string;
	provider: WalletProvider;
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent<{
	detail: {
		info: {
			uuid: string;
			name: string;
			icon: string;
			rdns: string;
		};
		provider: WalletProvider;
	};
}> {}

/**
 * EIP 6963: Wallet discovery protocol
 * Listen for wallet announcements
 */
export class WalletDiscovery {
	private detectedWallets = new Map<string, WalletInfo>();
	private listeners: Set<(wallets: WalletInfo[]) => void> = new Set();
	private discoveryTimeout: NodeJS.Timeout | null = null;
	private isDiscoveryComplete = false;

	constructor() {
		if (typeof window !== 'undefined') {
			this.discoverWallets();
		}
	}

	private discoverWallets() {
		// Listen for EIP-6963 announcements
		const handler = (event: any) => {
			try {
				const { info, provider } = event.detail;
				if (!info?.uuid || !provider) {
					console.warn('Invalid wallet announcement:', event.detail);
					return;
				}
				
				const wallet: WalletInfo = {
					uuid: info.uuid,
					name: info.name,
					icon: info.icon,
					provider
				};

				this.detectedWallets.set(info.uuid, wallet);
				console.debug(`[EIP-6963] Detected wallet: ${info.name} (${info.uuid})`);
				this.notifyListeners();
			} catch (err) {
				console.error('Error handling EIP-6963 announcement:', err);
			}
		};

		window.addEventListener('eip6963:announceProvider', handler);

		// Request wallet announcements (EIP-6963)
		// Extended timeout to handle wallet extension conflicts
		try {
			console.debug('[EIP-6963] Dispatching wallet discovery request...');
			window.dispatchEvent(new Event('eip6963:requestProvider'));
		} catch (err) {
			console.warn('Failed to dispatch EIP-6963 request:', err);
		}

		// Set timeout to mark discovery as complete and notify listeners
		// Extended from 2s to 3s to handle wallet conflicts
		// This allows the app to proceed even if not all wallets have announced yet
		if (this.discoveryTimeout) clearTimeout(this.discoveryTimeout);
		this.discoveryTimeout = setTimeout(() => {
			this.isDiscoveryComplete = true;
			const walletCount = this.detectedWallets.size;
			console.debug(`[EIP-6963] Discovery timeout - found ${walletCount} wallet(s)`);
			this.notifyListeners();
		}, 3000);
	}

	/**
	 * Check if discovery is complete (has EIP-6963 wallets or timeout reached)
	 */
	isComplete(): boolean {
		return this.isDiscoveryComplete || this.detectedWallets.size > 0;
	}

	/**
	 * Wait for discovery to complete or timeout
	 */
	async waitForDiscovery(maxWait: number = 3000): Promise<WalletInfo[]> {
		const startTime = Date.now();
		while (Date.now() - startTime < maxWait) {
			if (this.detectedWallets.size > 0 || this.isDiscoveryComplete) {
				return this.getWallets();
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		return this.getWallets();
	}

	getWallets(): WalletInfo[] {
		return Array.from(this.detectedWallets.values());
	}

	getWallet(uuid: string): WalletInfo | undefined {
		return this.detectedWallets.get(uuid);
	}

	getDefaultWallet(): WalletInfo | undefined {
		// Only return wallets discovered via EIP-6963
		// Do NOT access window.ethereum here to avoid wallet extension conflicts
		const firstDetected = this.detectedWallets.values().next().value;
		if (firstDetected) {
			console.debug('[Wallet Discovery] Using EIP-6963 wallet:', firstDetected.name);
			return firstDetected;
		}

		console.debug('[Wallet Discovery] No EIP-6963 wallets detected, returning undefined');
		return undefined;
	}

	subscribe(callback: (wallets: WalletInfo[]) => void): () => void {
		this.listeners.add(callback);
		callback(this.getWallets());

		return () => {
			this.listeners.delete(callback);
		};
	}

	private notifyListeners() {
		const wallets = this.getWallets();
		this.listeners.forEach(cb => cb(wallets));
	}
}

/**
 * EIP 1193: Ethereum RPC API
 * JSON-RPC requests to the wallet
 */
export class EthereumRPC {
	constructor(private provider: WalletProvider) {}

	/**
	 * EIP 1102: Request user authorization
	 * Request account access
	 */
	async requestAccounts(): Promise<string[]> {
		return this.provider.request({
			method: 'eth_requestAccounts',
			params: []
		});
	}

	/**
	 * Get the connected accounts
	 */
	async getAccounts(): Promise<string[]> {
		return this.provider.request({
			method: 'eth_accounts',
			params: []
		});
	}

	/**
	 * Get the current chain ID
	 */
	async getChainId(): Promise<string> {
		return this.provider.request({
			method: 'eth_chainId',
			params: []
		});
	}

	/**
	 * Get the current network
	 */
	async getNetwork(): Promise<string> {
		return this.provider.request({
			method: 'net_version',
			params: []
		});
	}

	/**
	 * Get account balance
	 */
	async getBalance(address: string, block = 'latest'): Promise<string> {
		return this.provider.request({
			method: 'eth_getBalance',
			params: [address, block]
		});
	}

	/**
	 * Get transaction count (nonce)
	 */
	async getTransactionCount(address: string): Promise<string> {
		return this.provider.request({
			method: 'eth_getTransactionCount',
			params: [address, 'latest']
		});
	}

	/**
	 * Estimate gas for a transaction
	 */
	async estimateGas(txData: any): Promise<string> {
		return this.provider.request({
			method: 'eth_estimateGas',
			params: [txData]
		});
	}

	/**
	 * Get current gas price
	 */
	async getGasPrice(): Promise<string> {
		return this.provider.request({
			method: 'eth_gasPrice',
			params: []
		});
	}

	/**
	 * Send a transaction (requires user confirmation)
	 */
	async sendTransaction(txData: {
		from: string;
		to: string;
		value?: string;
		data?: string;
		gas?: string;
		gasPrice?: string;
		nonce?: string;
	}): Promise<string> {
		return this.provider.request({
			method: 'eth_sendTransaction',
			params: [txData]
		});
	}

	/**
	 * Sign a message
	 */
	async signMessage(address: string, message: string): Promise<string> {
		return this.provider.request({
			method: 'personal_sign',
			params: [message, address]
		});
	}

	/**
	 * Sign typed data (EIP-712)
	 */
	async signTypedData(address: string, typedData: any): Promise<string> {
		return this.provider.request({
			method: 'eth_signTypedData_v4',
			params: [address, JSON.stringify(typedData)]
		});
	}
}

/**
 * EIP 3326: Chain switching
 */
export class ChainSwitcher {
	constructor(private provider: WalletProvider) {}

	/**
	 * Switch to a chain
	 * @param chainId - Chain ID in hex format (e.g., '0x1' for mainnet)
	 */
	async switchChain(chainId: string): Promise<void> {
		await this.provider.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId }]
		});
	}

	/**
	 * Add a custom chain
	 */
	async addChain(chainParams: {
		chainId: string;
		chainName: string;
		rpcUrls: string[];
		blockExplorerUrls?: string[];
		nativeCurrency?: {
			name: string;
			symbol: string;
			decimals: number;
		};
	}): Promise<void> {
		await this.provider.request({
			method: 'wallet_addEthereumChain',
			params: [chainParams]
		});
	}
}

/**
 * Transaction builder
 */
export class TransactionBuilder {
	/**
	 * Build an ERC20 approve transaction
	 */
	static buildApprove(
		tokenAddress: string,
		spenderAddress: string,
		amount: string
	): { to: string; data: string } {
		// ERC20 approve ABI: approve(address,uint256)
		// Function selector: 0x095ea7b3
		const functionSignature = '095ea7b3';
		const params = this.encodeParameters(
			['address', 'uint256'],
			[spenderAddress, amount]
		);
		return {
			to: tokenAddress,
			data: `0x${functionSignature}${params}`
		};
	}

	/**
	 * Build an ERC20 transfer transaction
	 */
	static buildTransfer(
		tokenAddress: string,
		toAddress: string,
		amount: string
	): { to: string; data: string } {
		// ERC20 transfer ABI: transfer(address,uint256)
		// Function selector: 0xa9059cbb
		const functionSignature = 'a9059cbb';
		const params = this.encodeParameters(
			['address', 'uint256'],
			[toAddress, amount]
		);
		return {
			to: tokenAddress,
			data: `0x${functionSignature}${params}`
		};
	}

	/**
	 * Build a contract function call transaction
	 */
	static buildContractCall(
		contractAddress: string,
		functionSignature: string,
		types: string[],
		values: any[]
	): { to: string; data: string } {
		const selector = this.getFunctionSelector(functionSignature);
		const params = this.encodeParameters(types, values);
		return {
			to: contractAddress,
			data: `0x${selector}${params}`
		};
	}

	/**
	 * Encode parameters for contract calls
	 */
	private static encodeParameters(types: string[], values: any[]): string {
		let encoded = '';

		for (let i = 0; i < types.length; i++) {
			const type = types[i];
			const value = values[i];

			if (type === 'address') {
				encoded += this.encodeAddress(value);
			} else if (type === 'uint256' || type.startsWith('uint')) {
				encoded += this.encodeUint256(value);
			} else if (type === 'bytes32') {
				encoded += this.encodeBytes32(value);
			} else if (type === 'string') {
				encoded += this.encodeString(value);
			} else if (type === 'bool') {
				encoded += value ? '0000000000000000000000000000000000000000000000000000000000000001' : '0000000000000000000000000000000000000000000000000000000000000000';
			}
		}

		return encoded;
	}

	private static encodeAddress(address: string): string {
		return address.replace('0x', '').padStart(64, '0').toLowerCase();
	}

	private static encodeUint256(value: string | number | bigint): string {
		let num = BigInt(value);
		return num.toString(16).padStart(64, '0').toLowerCase();
	}

	private static encodeBytes32(value: string): string {
		const cleaned = value.replace('0x', '').padStart(64, '0');
		return cleaned.toLowerCase();
	}

	private static encodeString(value: string): string {
		// For now, just pad the string as hex
		const hex = Buffer.from(value).toString('hex');
		return hex.padStart(64, '0');
	}

	private static getFunctionSelector(functionSignature: string): string {
		// If already a 4-byte selector, return it
		if (functionSignature.startsWith('0x') && functionSignature.length === 10) {
			return functionSignature.slice(2);
		}

		// Simple hash function for function signature
		// In production, use keccak256
		console.warn('Using simple function selector - use keccak256 in production');
		return functionSignature.slice(0, 8);
	}
}

/**
 * TRON-specific utilities
 */
export class TRONUtils {
	/**
	 * Convert Ethereum address to TRON address format
	 */
	static toTronAddress(ethAddress: string): string {
		// This is a simplified version - in production use tronweb library
		return ethAddress; // Placeholder
	}

	/**
	 * Check if address is valid TRON address
	 */
	static isValidTronAddress(address: string): boolean {
		return /^T[1-9A-HJ-NP-Z]{33}$/.test(address);
	}

	/**
	 * Build TRON transaction data
	 */
	static buildTronTransaction(
		contractAddress: string,
		functionSignature: string,
		params: any[]
	) {
		// For TRON, we need to use TronWeb
		// This is a placeholder for the actual implementation
		return {
			to: contractAddress,
			data: functionSignature,
			params
		};
	}
}

// Global instance
let walletDiscovery: WalletDiscovery;

export function getWalletDiscovery(): WalletDiscovery {
	if (!walletDiscovery) {
		walletDiscovery = new WalletDiscovery();
	}
	return walletDiscovery;
}
