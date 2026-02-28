import {
	createPublicClient,
	createWalletClient,
	http,
	publicActions,
	type PublicClient,
	type WalletClient
} from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { EthereumRPC, ChainSwitcher, type WalletProvider } from './wallet-manager.svelte';

// Chain configurations
export const SUPPORTED_CHAINS = {
	ETH_MAINNET: 1,
	ETH_SEPOLIA: 11155111,
	TRON_MAINNET: 728126428,
	TRON_SHASTA: 2494104990
} as const;

export const CHAIN_CONFIGS = {
	[SUPPORTED_CHAINS.ETH_MAINNET]: {
		id: 1,
		chainId: '0x1',
		name: 'Ethereum Mainnet',
		rpc: 'https://eth.public-rpc.com',
		rpcUrl: 'https://eth.public-rpc.com',
		symbol: 'ETH',
		blockExplorer: 'https://etherscan.io'
	},
	[SUPPORTED_CHAINS.ETH_SEPOLIA]: {
		id: 11155111,
		chainId: '0xaa36a7',
		name: 'Ethereum Sepolia',
		rpc: 'https://sepolia.eth.public-rpc.com',
		rpcUrl: 'https://sepolia.eth.public-rpc.com',
		symbol: 'ETH',
		blockExplorer: 'https://sepolia.etherscan.io'
	},
	[SUPPORTED_CHAINS.TRON_MAINNET]: {
		id: 728126428,
		chainId: '0x2b6653dc',
		name: 'TRON Mainnet',
		rpc: 'https://api.tronstack.com/jsonrpc',
		rpcUrl: 'https://api.tronstack.com/jsonrpc',
		symbol: 'TRX',
		blockExplorer: 'https://tronscan.org'
	},
	[SUPPORTED_CHAINS.TRON_SHASTA]: {
		id: 2494104990,
		chainId: '0x94a6348e',
		name: 'TRON Shasta',
		rpc: 'https://api.shasta.tronstack.com/jsonrpc',
		rpcUrl: 'https://api.shasta.tronstack.com/jsonrpc',
		symbol: 'TRX',
		blockExplorer: 'https://shasta.tronscan.org'
	}
};

class PublicClientManager {
	private clients = new Map<number, PublicClient>();

	getClient(chainId: number = SUPPORTED_CHAINS.ETH_MAINNET): PublicClient {
		if (!this.clients.has(chainId)) {
			const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
			if (!config) {
				throw new Error(`Unsupported chain: ${chainId}`);
			}

			const client = createPublicClient({
				chain: mainnet,
				transport: http(config.rpc)
			});

			this.clients.set(chainId, client);
		}

		return this.clients.get(chainId)!;
	}
}

class WalletClientManager {
	private client: WalletClient | null = null;
	private provider: WalletProvider | null = null;
	private rpc: EthereumRPC | null = null;
	private chainSwitcher: ChainSwitcher | null = null;

	getClient(): WalletClient | null {
		// EIP-6963 only - no window.ethereum
		// Client is obtained from connected wallet provider
		return this.client;
	}

	getProvider(): WalletProvider | null {
		// EIP-6963 only - no window.ethereum fallback
		// Provider must come from EIP-6963 wallet discovery
		return this.provider;
	}

	getRPC(): EthereumRPC | null {
		const provider = this.getProvider();
		if (!provider) return null;
		if (!this.rpc) {
			this.rpc = new EthereumRPC(provider);
		}
		return this.rpc;
	}

	getChainSwitcher(): ChainSwitcher | null {
		const provider = this.getProvider();
		if (!provider) return null;
		if (!this.chainSwitcher) {
			this.chainSwitcher = new ChainSwitcher(provider);
		}
		return this.chainSwitcher;
	}

	isEthereumAvailable(): boolean {
		// EIP-6963 only - always return false
		// We don't use window.ethereum, so it's never "available"
		return false;
	}

	// EIP 1102: Request account access
	async requestAccounts(): Promise<string[]> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		return rpc.requestAccounts();
	}

	// Get connected accounts
	async getAccounts(): Promise<string[]> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		return rpc.getAccounts();
	}

	// Get current chain ID
	async getChainId(): Promise<number> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		const chainId = await rpc.getChainId();
		return parseInt(chainId, 16);
	}

	// Get balance
	async getBalance(address: string): Promise<bigint> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		const balance = await rpc.getBalance(address);
		return BigInt(balance);
	}

	// Get transaction count (nonce)
	async getTransactionCount(address: string): Promise<number> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		const nonce = await rpc.getTransactionCount(address);
		return parseInt(nonce, 16);
	}

	// Get gas price
	async getGasPrice(): Promise<bigint> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		const gasPrice = await rpc.getGasPrice();
		return BigInt(gasPrice);
	}

	// Estimate gas
	async estimateGas(txData: any): Promise<bigint> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		const gas = await rpc.estimateGas(txData);
		return BigInt(gas);
	}

	// EIP 3326: Switch chain
	async switchChain(chainId: number): Promise<void> {
		const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
		if (!config) throw new Error(`Unsupported chain: ${chainId}`);

		const switcher = this.getChainSwitcher();
		if (!switcher) throw new Error('Wallet not available');

		try {
			await switcher.switchChain(config.chainId);
		} catch (error: any) {
			// If chain not found, try to add it
			if (error.code === 4902 || error.message.includes('unrecognized chain ID')) {
				await this.addChain(chainId);
				await switcher.switchChain(config.chainId);
			} else {
				throw error;
			}
		}
	}

	// Add a chain
	private async addChain(chainId: number): Promise<void> {
		const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
		if (!config) throw new Error(`Unsupported chain: ${chainId}`);

		const switcher = this.getChainSwitcher();
		if (!switcher) throw new Error('Wallet not available');

		await switcher.addChain({
			chainId: config.chainId,
			chainName: config.name,
			rpcUrls: [config.rpcUrl],
			blockExplorerUrls: [config.blockExplorer],
			nativeCurrency: {
				name: config.symbol,
				symbol: config.symbol,
				decimals: 18
			}
		});
	}

	// Send transaction
	async sendTransaction(tx: {
		from: string;
		to: string;
		value?: string;
		data?: string;
		gas?: string;
		gasPrice?: string;
	}): Promise<string> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		return rpc.sendTransaction(tx);
	}

	// Sign message
	async signMessage(address: string, message: string): Promise<string> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		return rpc.signMessage(address, message);
	}

	// Sign typed data (EIP-712)
	async signTypedData(address: string, typedData: any): Promise<string> {
		const rpc = this.getRPC();
		if (!rpc) throw new Error('Wallet not available');
		return rpc.signTypedData(address, typedData);
	}
}

export const publicClient = new PublicClientManager();
export const walletClient = new WalletClientManager();

export interface ContractConfig {
	address: string;
	chainId: number;
}

export const ESCROW_CONTRACTS: Record<number, string> = {
	[SUPPORTED_CHAINS.ETH_SEPOLIA]: '0x...', // TODO: Set actual contract address
	[SUPPORTED_CHAINS.TRON_SHASTA]: '0x...' // TODO: Set actual contract address
};
