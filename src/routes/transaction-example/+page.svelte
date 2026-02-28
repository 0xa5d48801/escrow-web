<script lang="ts">
	import { getWalletState, getLanguage } from '$lib/state.svelte';
	import { t } from '$lib/i18n';
	import { TransactionBuilder } from '$lib/wallet-manager.svelte';

	const wallet = getWalletState();
	const language = getLanguage();

	let txType = $state<'transfer' | 'approve' | 'custom'>('transfer');
	let toAddress = $state('');
	let amount = $state('');
	let tokenAddress = $state('');
	let isSending = $state(false);
	let txResult = $state<{ hash: string; status: string } | null>(null);
	let message = $state('');

	const handleTransfer = async () => {
		if (!wallet.isConnected || !toAddress || !amount) {
			alert('Please fill in all fields and connect wallet');
			return;
		}

		isSending = true;
		try {
			// For native token transfer
			const amountInWei = String(BigInt(Math.floor(parseFloat(amount) * 1e18)));
			const txHash = await wallet.sendTransaction({
				to: toAddress,
				value: '0x' + BigInt(amountInWei).toString(16)
			});

			txResult = { hash: txHash, status: 'pending' };
			message = `Transfer sent! TX: ${txHash}`;
		} catch (err) {
			message = err instanceof Error ? err.message : 'Transfer failed';
		} finally {
			isSending = false;
		}
	};

	const handleApprove = async () => {
		if (!wallet.isConnected || !tokenAddress || !toAddress || !amount) {
			alert('Please fill in all fields and connect wallet');
			return;
		}

		isSending = true;
		try {
			const amountInWei = String(BigInt(Math.floor(parseFloat(amount) * 1e18)));
			const txHash = await wallet.approveToken(tokenAddress, toAddress, amountInWei);

			txResult = { hash: txHash, status: 'pending' };
			message = `Approval sent! TX: ${txHash}`;
		} catch (err) {
			message = err instanceof Error ? err.message : 'Approval failed';
		} finally {
			isSending = false;
		}
	};

	const handleSign = async () => {
		if (!wallet.isConnected || !message) {
			alert('Please enter a message and connect wallet');
			return;
		}

		isSending = true;
		try {
			const signature = await wallet.signMessage(message);
			message = `Signature: ${signature}`;
		} catch (err) {
			message = err instanceof Error ? err.message : 'Signing failed';
		} finally {
			isSending = false;
		}
	};

	const formatTxHash = (hash: string) => {
		return hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;
	};
</script>

<div class="tx-example-container">
	<h1 class="tx-example-title">Transaction Examples</h1>

	{#if !wallet.isConnected}
		<div class="card tx-not-connected">
			<p class="walletNotice">Please connect your wallet first</p>
		</div>
	{:else}
		<!-- Transaction Type Selection -->
		<div class="card tx-type-selector">
			<h2 class="tx-type-title">Transaction Type</h2>
			<div class="tx-type-buttons">
				{#each ['transfer', 'approve', 'custom'] as type}
					<button
						class="tx-type-btn"
						class:tx-type-btn-active={txType === type}
						onmousedown={(e) => {
							if (e.button === 0) txType = type as any;
						}}
					>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</button>
				{/each}
			</div>
		</div>

		{#if txType === 'transfer'}
			<!-- Native Token Transfer -->
			<div class="card tx-form-card">
				<h3 class="tx-form-title">Send ETH/TRON</h3>
				<div class="tx-form-grid">
					<div>
						<label class="label">Recipient Address</label>
						<input
							type="text"
							class="input"
							placeholder="0x..."
							bind:value={toAddress}
						/>
					</div>

					<div>
						<label class="label">Amount ({wallet.getChainInfo()?.symbol || 'ETH'})</label>
						<input
							type="number"
							class="input"
							placeholder="0.1"
							bind:value={amount}
							step="0.0001"
						/>
					</div>

					<button
						class="btn-primary"
						onclick={handleTransfer}
						disabled={isSending || !toAddress || !amount}
					>
						{isSending ? 'Sending...' : 'Send Transaction'}
					</button>
				</div>
			</div>
		{:else if txType === 'approve'}
			<!-- ERC20/TRC20 Approve -->
			<div class="card tx-form-card">
				<h3 class="tx-form-title">Approve Token</h3>
				<div class="tx-form-grid">
					<div>
						<label class="label">Token Address</label>
						<input
							type="text"
							class="input"
							placeholder="0x..."
							bind:value={tokenAddress}
						/>
					</div>

					<div>
						<label class="label">Spender Address</label>
						<input
							type="text"
							class="input"
							placeholder="0x..."
							bind:value={toAddress}
						/>
					</div>

					<div>
						<label class="label">Amount</label>
						<input
							type="number"
							class="input"
							placeholder="1000"
							bind:value={amount}
							step="0.0001"
						/>
					</div>

					<button
						class="btn-primary"
						onclick={handleApprove}
						disabled={isSending || !tokenAddress || !toAddress || !amount}
					>
						{isSending ? 'Approving...' : 'Send Approval'}
					</button>
				</div>
			</div>
		{:else}
			<!-- Message Signing -->
			<div class="card tx-form-card">
				<h3 class="tx-form-title">Sign Message</h3>
				<div class="tx-form-grid">
					<div>
						<label class="label">Message</label>
						<textarea
							class="input tx-textarea"
							placeholder="Enter message to sign..."
							bind:value={message}
						/>
					</div>

					<button
						class="btn-primary"
						onclick={handleSign}
						disabled={isSending || !message}
					>
						{isSending ? 'Signing...' : 'Sign Message'}
					</button>
				</div>
			</div>
		{/if}

		<!-- Result -->
		{#if txResult}
			<div class="card tx-result-card">
				<div class="tx-result-header">
					<span class="tx-result-icon">✓</span>
					<h4 class="tx-result-title">Transaction Submitted</h4>
				</div>
				<p class="tx-result-hash">
					{formatTxHash(txResult.hash)}
				</p>
				<a
					href="{wallet.getChainInfo()?.blockExplorer}/tx/{txResult.hash}"
					target="_blank"
					rel="noopener noreferrer"
					class="tx-result-link"
				>
					View on Explorer →
				</a>
			</div>
		{/if}

		<!-- Status Information -->
		<div class="card tx-status-card">
			<h3 class="tx-status-title">Current Status</h3>
			<div class="tx-status-grid">
				<div>
					<span class="status-label">Account:</span>
					<span class="status-value monospace">{wallet.address}</span>
				</div>
				<div>
					<span class="status-label">Network:</span>
					<span class="status-value">{wallet.getChainInfo()?.name || 'Unknown'}</span>
				</div>
				<div>
					<span class="status-label">Balance:</span>
					<span class="status-value">
						{wallet.balance ? (Number(wallet.balance) / 1e18).toFixed(4) : '0'}
						{wallet.getChainInfo()?.symbol || 'ETH'}
					</span>
				</div>
			</div>
		</div>

		<!-- Warning -->
		<div class="tx-warning">
			⚠️ Always verify transaction details carefully before signing. Never share your private keys.
		</div>
	{/if}
</div>

<style>
	.tx-example-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.tx-example-title {
		font-size: 1.875rem;
		font-weight: bold;
		margin-bottom: 2rem;
	}

	.tx-not-connected {
		text-align: center;
	}

	.walletNotice {
		color: #757575;
		margin-bottom: 1rem;
	}

	body.dark .walletNotice {
		color: #a0a0a0;
	}

	.tx-type-selector {
		margin-bottom: 1.5rem;
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .tx-type-selector {
		background-color: #282828;
		border-color: #404040;
	}

	.tx-type-title {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.tx-type-buttons {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.tx-type-btn {
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		background-color: transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tx-type-btn-active {
		border-color: #1d7484;
		background-color: #f0f9ff;
	}

	body.dark .tx-type-btn {
		border-color: #555;
	}

	body.dark .tx-type-btn:hover {
		background-color: #404040;
	}

	body.dark .tx-type-btn-active {
		border-color: #5eb3c6;
		background-color: #1e3a44;
	}

	.tx-form-card {
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .tx-form-card {
		background-color: #282828;
		border-color: #404040;
	}

	.tx-form-title {
		font-size: 1.125rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.tx-form-grid {
		display: grid;
		gap: 1rem;
	}

	.tx-textarea {
		min-height: 100px;
		resize: vertical;
	}

	.tx-result-card {
		background-color: #d1fae5;
		border: 1px solid #6ee7b7;
		margin-top: 1.5rem;
		padding: 1.5rem;
		border-radius: 4px;
	}

	.tx-result-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.tx-result-icon {
		color: #065f46;
		font-size: 1.25rem;
	}

	.tx-result-title {
		font-weight: bold;
		color: #065f46;
	}

	.tx-result-hash {
		color: #047857;
		font-family: monospace;
		font-size: 0.9rem;
		word-break: break-all;
	}

	.tx-result-link {
		color: #047857;
		text-decoration: underline;
		font-size: 0.9rem;
	}

	.tx-status-card {
		margin-top: 1.5rem;
		background-color: #f3f4f6;
		padding: 1.5rem;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
	}

	body.dark .tx-status-card {
		background-color: #282828;
		border-color: #404040;
	}

	.tx-status-title {
		font-size: 1rem;
		font-weight: bold;
		margin-bottom: 0.75rem;
	}

	.tx-status-grid {
		display: grid;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.status-label {
		color: #757575;
	}

	body.dark .status-label {
		color: #a0a0a0;
	}

	.status-value {
		font-weight: 500;
	}

	.status-value.monospace {
		font-family: monospace;
	}

	.tx-warning {
		background-color: #fef3c7;
		border: 1px solid #fcd34d;
		border-radius: 4px;
		padding: 1rem;
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: #92400e;
	}

	body.dark .tx-warning {
		background-color: #5a4a0e;
		border-color: #8b7a1c;
		color: #fad94f;
	}
</style>
