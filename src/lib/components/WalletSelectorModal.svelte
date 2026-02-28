<script lang="ts">
	import { getWalletState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';
	import { getLanguage } from '$lib/state.svelte';

	const wallet = getWalletState();
	const language = getLanguage();

	let { isOpen = false, onSelect = async () => {}, onClose = () => {} } = $props();

	// Local state for modal visibility and form
	let open = $state(isOpen);
	let selectedWallet: string | null = $state(null);
	let isLoading = $state(false);
	let isDiscovering = $state(false);
	let errorMessage: string | null = $state(null);

	// Sync prop changes with local state
	$effect(() => {
		open = isOpen;
	});

	// Detect when modal opens
	$effect(() => {
		if (open && wallet.availableWallets.length === 0) {
			isDiscovering = true;
		}
	});

	async function handleSelect(walletUuid: string) {
		selectedWallet = walletUuid;
		isLoading = true;
		errorMessage = null;

		try {
			await onSelect(walletUuid);
			closeModal();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
			console.error('Wallet selection error:', err);
			isLoading = false;
		}
	}

	function closeModal() {
		open = false;
		selectedWallet = null;
		errorMessage = null;
		isDiscovering = false;
		onClose();
		isLoading = false;
	}
</script>

{#if open}
	<div class="modal-overlay" on:keydown={(e) => e.key === 'Escape' && closeModal()}>
		<div class="modal-content">
			<div class="modal-header">
				<h2 class="modal-title">Select Wallet</h2>
				<button
					class="modal-close-btn"
					disabled={isLoading}
					on:click={closeModal}
					title="Close"
				>
					✕
				</button>
			</div>

			{#if errorMessage}
				<div class="modal-error">
					<span class="error-icon">⚠️</span>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<div class="wallet-list">
				{#if wallet.availableWallets.length > 0}
					<p class="wallet-list-title">Available Wallets (found {wallet.availableWallets.length})</p>
					{#each wallet.availableWallets as walletInfo (walletInfo.uuid)}
						<button
							class="wallet-list-item"
							class:wallet-list-item-selected={selectedWallet === walletInfo.uuid}
							class:wallet-list-item-loading={isLoading && selectedWallet === walletInfo.uuid}
							disabled={isLoading}
							on:click={() => handleSelect(walletInfo.uuid)}
						>
							{#if walletInfo.icon}
								<img
									src={walletInfo.icon}
									alt={walletInfo.name}
									class="wallet-icon"
									on:error={(e) => {
										(e.target as HTMLImageElement).src =
											'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>';
									}}
								/>
							{:else}
								<div class="wallet-icon-placeholder">
									{walletInfo.name.charAt(0)}
								</div>
							{/if}

							<div class="wallet-info">
								<div class="wallet-name">{walletInfo.name}</div>
								<div class="wallet-uuid">{walletInfo.uuid}</div>
							</div>

							{#if isLoading && selectedWallet === walletInfo.uuid}
								<div class="wallet-spinner">⏳</div>
							{:else if selectedWallet === walletInfo.uuid}
								<div class="wallet-checkmark">✓</div>
							{/if}
						</button>
					{/each}
				{:else if isDiscovering}
					<div class="wallet-discovering">
						<div class="discovery-spinner">⏳</div>
						<p>Detecting wallets...</p>
						<p class="discovering-hint">Please wait while we scan for wallet extensions</p>
					</div>
				{:else}
					<div class="no-wallets-message">
						<p>No wallets detected</p>
						<p class="no-wallets-hint">
							Please install a wallet extension like MetaMask, Trust Wallet, or Coinbase Wallet
						</p>
						<p class="no-wallets-solution">
							Common causes:<br>
							• Multiple wallets installed (disable conflicting ones in your browser)<br>
							• Wallet extension not enabled<br>
							• Browser privacy mode might block extensions
						</p>
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button
					class="btn-cancel"
					disabled={isLoading}
					on:click={closeModal}
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	body.dark .modal-overlay {
		background-color: rgba(0, 0, 0, 0.7);
	}

	.modal-content {
		background-color: white;
		border-radius: 8px;
		padding: 0;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}

	body.dark .modal-content {
		background-color: #1f1f1f;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid #e0e0e0;
	}

	body.dark .modal-header {
		border-bottom-color: #404040;
	}

	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #333;
	}

	body.dark .modal-title {
		color: #d0d0d0;
	}

	.modal-close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.modal-close-btn:hover:not(:disabled) {
		color: #000;
	}

	body.dark .modal-close-btn {
		color: #999;
	}

	body.dark .modal-close-btn:hover:not(:disabled) {
		color: #d0d0d0;
	}

	.modal-close-btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.modal-error {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 1rem 1.5rem 0;
		padding: 0.75rem 1rem;
		background-color: #fee2e2;
		border-left: 4px solid #b91c1c;
		border-radius: 4px;
		color: #b91c1c;
		font-size: 0.9rem;
	}

	body.dark .modal-error {
		background-color: #5a2c2c;
		border-left-color: #ff7070;
		color: #ff7070;
	}

	.error-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.wallet-list {
		padding: 1.5rem;
		min-height: 200px;
	}

	.wallet-list-title {
		margin: 0 0 1rem 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: #757575;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	body.dark .wallet-list-title {
		color: #a0a0a0;
	}

	.wallet-list-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		margin-bottom: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		background-color: #f9f9f9;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	body.dark .wallet-list-item {
		background-color: #282828;
		border-color: #404040;
	}

	.wallet-list-item:hover:not(:disabled) {
		border-color: #1d7484;
		background-color: #f0f7f9;
	}

	body.dark .wallet-list-item:hover:not(:disabled) {
		background-color: #3a3a3a;
		border-color: #5eb3c6;
	}

	.wallet-list-item-selected {
		border-color: #1d7484;
		background-color: #eff6ff;
	}

	body.dark .wallet-list-item-selected {
		border-color: #5eb3c6;
		background-color: #1e3a44;
	}

	.wallet-list-item-loading {
		opacity: 0.7;
	}

	.wallet-list-item:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.wallet-icon {
		width: 40px;
		height: 40px;
		border-radius: 6px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.wallet-icon-placeholder {
		width: 40px;
		height: 40px;
		border-radius: 6px;
		background: linear-gradient(135deg, #1d7484, #5eb3c6);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 1.1rem;
			flex-shrink: 0;
	}

	.wallet-info {
		flex: 1;
		min-width: 0;
	}

	.wallet-name {
		font-weight: 600;
		color: #333;
		margin-bottom: 0.25rem;
	}

	body.dark .wallet-name {
		color: #d0d0d0;
	}

	.wallet-uuid {
		font-size: 0.75rem;
		color: #999;
		font-family: monospace;
		overflow-x: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	body.dark .wallet-uuid {
		color: #888;
	}

	.wallet-spinner {
		font-size: 1.2rem;
		animation: spin 1s linear infinite;
		flex-shrink: 0;
	}

	.wallet-checkmark {
		color: #1d7484;
		font-weight: bold;
		font-size: 1.3rem;
		flex-shrink: 0;
	}

	body.dark .wallet-checkmark {
		color: #5eb3c6;
	}

	.wallet-discovering {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem 1rem;
		text-align: center;
	}

	.discovery-spinner {
		font-size: 2rem;
		animation: spin 1s linear infinite;
	}

	.wallet-discovering > p {
		margin: 0;
		color: #757575;
	}

	body.dark .wallet-discovering > p {
		color: #a0a0a0;
	}

	.wallet-discovering > p:first-of-type {
		font-weight: 600;
		font-size: 1rem;
	}

	.discovering-hint {
		font-size: 0.85rem;
		color: #999;
	}

	body.dark .discovering-hint {
		color: #888;
	}

	.no-wallets-message {
		text-align: center;
		padding: 2rem 1rem;
		color: #757575;
	}

	body.dark .no-wallets-message {
		color: #a0a0a0;
	}

	.no-wallets-message p {
		margin: 0.5rem 0;
	}

	.no-wallets-message p:first-child {
		font-weight: 600;
		font-size: 1rem;
	}

	.no-wallets-hint {
		font-size: 0.85rem !important;
		margin-top: 0.75rem !important;
	}

	.no-wallets-solution {
		font-size: 0.75rem !important;
		margin-top: 1rem !important;
		line-height: 1.4;
		padding: 0.75rem;
		background-color: #f5f5f5;
		border-radius: 4px;
		text-align: left;
	}

	body.dark .no-wallets-solution {
		background-color: #2a2a2a;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e0e0e0;
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	body.dark .modal-footer {
		border-top-color: #404040;
	}

	.btn-cancel {
		padding: 0.75rem 1.5rem;
		border: 1px solid #ddd;
		background-color: #f5f5f5;
		color: #333;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	body.dark .btn-cancel {
		background-color: #3a3a3a;
		border-color: #555;
		color: #d0d0d0;
	}

	.btn-cancel:hover:not(:disabled) {
		background-color: #e0e0e0;
	}

	body.dark .btn-cancel:hover:not(:disabled) {
		background-color: #4a4a4a;
	}

	.btn-cancel:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.modal-content {
			width: 95%;
			max-height: 90vh;
		}

		.wallet-list {
			padding: 1rem;
		}

		.modal-header,
		.modal-footer {
			padding: 1rem;
		}
	}
</style>
