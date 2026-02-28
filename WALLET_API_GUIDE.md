/**
 * Wallet API Usage Guide
 *
 * Complete implementation of EIP standards:
 * - EIP 6963: Wallet Discovery Protocol
 * - EIP 1102: Authorization Request
 * - EIP 1193: Ethereum JSON-RPC
 * - EIP 3326: Switch Ethereum Chain
 */

// ============================================
// 1. IMPORTING THE WALLET STATE
// ============================================

import { getWalletState, getLanguage } from '$lib/state.svelte';

const wallet = getWalletState();
const language = getLanguage();

// ============================================
// 2. WALLET CONNECTION (EIP 1102)
// ============================================

/**
 * Connect to the default wallet
 */
async function connectWallet() {
	try {
		await wallet.connect();
		console.log('Connected:', wallet.address);
		console.log('Chain ID:', wallet.chainId);
		console.log('Balance:', wallet.balance);
	} catch (err) {
		console.error('Connection failed:', err);
	}
}

/**
 * Connect to a specific wallet (using EIP 6963)
 * Get available wallets from wallet.availableWallets
 */
async function connectSpecificWallet(walletUuid: string) {
	try {
		await wallet.connect(walletUuid);
		console.log('Connected via:', wallet.selectedWalletUuid);
	} catch (err) {
		console.error('Connection failed:', err);
	}
}

/**
 * Disconnect from wallet
 */
function disconnectWallet() {
	wallet.disconnect();
	console.log('Disconnected');
}

// ============================================
// 3. GET WALLET STATE
// ============================================

// Check if connected
console.log('Is connected:', wallet.isConnected);

// Get current account
console.log('Account:', wallet.address);

// Get connected chain
console.log('Chain:', wallet.chainId);
console.log('Chain info:', wallet.getChainInfo());

// Get balance
console.log('Balance (in wei):', wallet.balance);
console.log('Balance (in ETH):', wallet.balance ? (Number(wallet.balance) / 1e18).toFixed(4) : '0');

// Check if chain is supported
console.log('Is ETH Sepolia supported:', wallet.isChainSupported(11155111));

// Get available chains to switch to
const availableChains = wallet.getAvailableChains();
console.log('Available chains:', availableChains);

// ============================================
// 4. CHAIN SWITCHING (EIP 3326)
// ============================================

/**
 * Switch to Ethereum Sepolia testnet
 */
async function switchToSepolia() {
	try {
		await wallet.switchChain(11155111); // Ethereum Sepolia
		console.log('Switched to Sepolia');
	} catch (err) {
		console.error('Failed to switch chain:', err);
	}
}

/**
 * Switch to TRON network
 */
async function switchToTRON() {
	try {
		await wallet.switchChain(728126428); // TRON Mainnet
		console.log('Switched to TRON');
	} catch (err) {
		console.error('Failed to switch chain:', err);
	}
}

/**
 * Switch to TRON Shasta testnet
 */
async function switchToTRONShasta() {
	try {
		await wallet.switchChain(2494104990); // TRON Shasta
		console.log('Switched to TRON Shasta');
	} catch (err) {
		console.error('Failed to switch chain:', err);
	}
}

// ============================================
// 5. SENDING TRANSACTIONS
// ============================================

/**
 * Send ETH/native token
 */
async function sendNativeToken(toAddress: string, amountInEth: string) {
	try {
		// Convert ETH to wei
		const amountInWei = String(BigInt(Math.floor(parseFloat(amountInEth) * 1e18)));

		const txHash = await wallet.sendTransaction({
			to: toAddress,
			value: '0x' + BigInt(amountInWei).toString(16)
		});

		console.log('Transaction sent:', txHash);
		return txHash;
	} catch (err) {
		console.error('Failed to send transaction:', err);
	}
}

/**
 * Approve ERC20 token (e.g., USDT)
 */
async function approveToken(
	tokenAddress: string,
	spenderAddress: string,
	amount: string // in token units (e.g., "1000" for 1000 USDT)
) {
	try {
		// Convert to wei (assuming 18 decimals)
		const amountInWei = String(BigInt(parseFloat(amount) * 1e18));

		const txHash = await wallet.approveToken(tokenAddress, spenderAddress, amountInWei);

		console.log('Approval transaction sent:', txHash);
		return txHash;
	} catch (err) {
		console.error('Failed to approve token:', err);
	}
}

/**
 * Transfer ERC20 token
 */
async function transferToken(
	tokenAddress: string,
	toAddress: string,
	amount: string // in token units
) {
	try {
		// Convert to wei (assuming 18 decimals)
		const amountInWei = String(BigInt(parseFloat(amount) * 1e18));

		const txHash = await wallet.transferToken(tokenAddress, toAddress, amountInWei);

		console.log('Transfer transaction sent:', txHash);
		return txHash;
	} catch (err) {
		console.error('Failed to transfer token:', err);
	}
}

// ============================================
// 6. SIGNING MESSAGES
// ============================================

/**
 * Sign a plain text message
 */
async function signPlainMessage(message: string) {
	try {
		const signature = await wallet.signMessage(message);
		console.log('Signature:', signature);
		return signature;
	} catch (err) {
		console.error('Failed to sign message:', err);
	}
}

/**
 * Sign typed data (EIP-712)
 * For structured data signing
 */
async function signTypedData(data: {
	types: {
		[key: string]: Array<{ name: string; type: string }>;
	};
	primaryType: string;
	domain: {
		name?: string;
		version?: string;
		chainId?: number;
		verifyingContract?: string;
	};
	message: Record<string, any>;
}) {
	try {
		const signature = await wallet.signTypedData(data);
		console.log('Signature:', signature);
		return signature;
	} catch (err) {
		console.error('Failed to sign typed data:', err);
	}
}

// Example EIP-712 typed data for trade approval
const tradeApprovalData = {
	types: {
		EIP712Domain: [
			{ name: 'name', type: 'string' },
			{ name: 'version', type: 'string' },
			{ name: 'chainId', type: 'uint256' },
			{ name: 'verifyingContract', type: 'address' }
		],
		TradeApproval: [
			{ name: 'tradeId', type: 'uint256' },
			{ name: 'approver', type: 'address' },
			{ name: 'nonce', type: 'uint256' },
			{ name: 'deadline', type: 'uint256' }
		]
	},
	primaryType: 'TradeApproval' as const,
	domain: {
		name: 'Escrow DApp',
		version: '1',
		chainId: wallet.chainId || 11155111,
		verifyingContract: '0x...' // Contract address
	},
	message: {
		tradeId: 1,
		approver: wallet.address!,
		nonce: await wallet.getNonce(),
		deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
	}
};

// ============================================
// 7. ADVANCED TRANSACTION BUILDING
// ============================================

import { TransactionBuilder } from '$lib/wallet-manager.svelte';

/**
 * Build custom contract call
 */
function buildCustomContractCall() {
	// Example: Call a custom smart contract function
	// function swapTokens(address token, uint256 amount, uint256 minOut)
	const result = TransactionBuilder.buildContractCall(
		'0x1111111254fb6c44bac0bed2854e76f90643097d', // Uniswap contract
		'swapTokens', // Function name
		['address', 'uint256', 'uint256'], // Parameter types
		['0x6B175474E89094C44Da98b954EedeAC495271d0F', '1000000000000000000', '900000000000000000'] // Parameters
	);

	console.log('Contract call data:', result);
	return result;
}

/**
 * Build and send custom contract call
 */
async function executeContractCall() {
	try {
		const { to, data } = buildCustomContractCall();

		const txHash = await wallet.sendTransaction({
			to,
			data
		});

		console.log('Contract call transaction sent:', txHash);
		return txHash;
	} catch (err) {
		console.error('Failed to execute contract call:', err);
	}
}

// ============================================
// 8. MONITORING WALLET EVENTS
// ============================================

// The wallet state uses Svelte runes, so any changes are reactive
// In Svelte components, use $derived to react to changes:

// $derived(wallet.isConnected)
// $derived(wallet.address)
// $derived(wallet.chainId)
// $derived(wallet.balance)
// $derived(wallet.error)
// $derived(wallet.availableWallets)

// ============================================
// 9. COMPLETE EXAMPLE: CREATE A TRADE
// ============================================

async function createTradeExample() {
	try {
		// 1. Ensure wallet is connected
		if (!wallet.isConnected) {
			await wallet.connect();
		}

		// 2. Ensure correct chain
		if (wallet.chainId !== 11155111) {
			// Ethereum Sepolia
			await wallet.switchChain(11155111);
		}

		// 3. Approve USDT spend if needed
		const usdtAddress = '0x7169D38EEAE47ADCDA14bB71DB5d1E4Ba537d1FA'; // Sepolia test USDT
		const spenderAddress = '0x...'; // Escrow contract address
		const approvalTx = await wallet.approveToken(
			usdtAddress,
			spenderAddress,
			'1000' // Approve 1000 USDT
		);
		console.log('Approval tx:', approvalTx);

		// 4. Wait for confirmation (in production, poll the chain)
		// await waitForConfirmation(approvalTx);

		// 5. Sign trade data
		const tradeData = {
			types: {
				EIP712Domain: [
					{ name: 'name', type: 'string' },
					{ name: 'version', type: 'string' },
					{ name: 'chainId', type: 'uint256' },
					{ name: 'verifyingContract', type: 'address' }
				],
				Trade: [
					{ name: 'seller', type: 'address' },
					{ name: 'goodsAmount', type: 'uint256' },
					{ name: 'sellerDeposit', type: 'uint256' },
					{ name: 'nonce', type: 'uint256' }
				]
			},
			primaryType: 'Trade' as const,
			domain: {
				name: 'Escrow DApp',
				version: '1',
				chainId: wallet.chainId!,
				verifyingContract: spenderAddress
			},
			message: {
				seller: wallet.address!,
				goodsAmount: String(BigInt(1000 * 1e18)), // 1000 tokens
				sellerDeposit: String(BigInt(100 * 1e18)), // 100 tokens as deposit
				nonce: await wallet.getNonce()
			}
		};

		const signature = await wallet.signTypedData(tradeData);

		// 6. Create trade with the contract
		// const tradeCreationTx = await escrowContract.createTrade({
		//   signature,
		//   data: tradeData.message
		// });

		console.log('Trade creation completed');
		return { approvalTx, signature };
	} catch (err) {
		console.error('Trade creation failed:', err);
		throw err;
	}
}

// ============================================
// 10. SUPPORTED NETWORKS
// ============================================

const NETWORKS = {
	ETH_MAINNET: {
		chainId: 1,
		name: 'Ethereum Mainnet',
		symbol: 'ETH',
		rpcUrl: 'https://eth.public-rpc.com',
		blockExplorer: 'https://etherscan.io'
	},
	ETH_SEPOLIA: {
		chainId: 11155111,
		name: 'Ethereum Sepolia Testnet',
		symbol: 'ETH',
		rpcUrl: 'https://sepolia.eth.public-rpc.com',
		blockExplorer: 'https://sepolia.etherscan.io'
	},
	TRON_MAINNET: {
		chainId: 728126428,
		name: 'TRON Mainnet',
		symbol: 'TRX',
		rpcUrl: 'https://api.tronstack.com/jsonrpc',
		blockExplorer: 'https://tronscan.org'
	},
	TRON_SHASTA: {
		chainId: 2494104990,
		name: 'TRON Shasta Testnet',
		symbol: 'TRX',
		rpcUrl: 'https://api.shasta.tronstack.com/jsonrpc',
		blockExplorer: 'https://shasta.tronscan.org'
	}
};

export {
	connectWallet,
	connectSpecificWallet,
	disconnectWallet,
	switchToSepolia,
	switchToTRON,
	switchToTRONShasta,
	sendNativeToken,
	approveToken,
	transferToken,
	signPlainMessage,
	signTypedData,
	buildCustomContractCall,
	executeContractCall,
	createTradeExample
};
