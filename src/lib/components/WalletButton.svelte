<script lang="ts">
	import { getWalletState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';
	import { getLanguage } from '$lib/state.svelte';

	const wallet = getWalletState();
	const language = getLanguage();

	let showWalletMenu = $state(false);
	let showNetworkMenu = $state(false);

	const formatAddress = (address: string | null) => {
		if (!address) return '';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatBalance = (balance: bigint | null) => {
		if (!balance) return '0';
		return (Number(balance) / 1e18).toFixed(4);
	};

	const handleConnect = async (walletUuid?: string) => {
		try {
			await wallet.connect(walletUuid);
			showWalletMenu = false;
		} catch (err) {
			console.error('Connection failed:', err);
		}
	};

	const handleDisconnect = () => {
		wallet.disconnect();
		showWalletMenu = false;
	};

	const handleDisconnectAccount = (index: number) => {
		wallet.disconnectAccount(index);
	};

	const handleSwitchChain = async (chainId: number) => {
		try {
			await wallet.switchChain(chainId);
			showNetworkMenu = false;
		} catch (err) {
			console.error('Chain switch failed:', err);
		}
	};

	const getChainName = (chainId: number | null) => {
		if (!chainId) return 'No Network';
		const chainInfo = wallet.getChainInfo();
		return chainInfo?.name || `Chain ${chainId}`;
	};

	const getChainSymbol = (chainId: number | null) => {
		if (!chainId) return '';
		const chainInfo = wallet.getChainInfo();
		return chainInfo?.symbol || 'ETH';
	};
</script>

<div class="wallet-container">
	<!-- Wallet Button -->
	<div class="wallet-button-wrapper">
		<button
			class="btn-primary"
			onmousedown={(e) => {
				if (e.button === 0) {
					if (wallet.isConnected) {
						showWalletMenu = !showWalletMenu;
						showNetworkMenu = false;
					} else {
						showWalletMenu = !showWalletMenu;
					}
				}
			}}
			disabled={wallet.isConnecting}
			class:wallet-button-min-width
		>
			{#if wallet.isConnecting}
				<span class="wallet-status-loading">
					<span class="spinner">⏳</span>
					{t('common.loading', language.current as any)}
				</span>
			{:else if wallet.isConnected}
				<span class="wallet-status-connected">
					<span class="wallet-status-dot"></span>
					{formatAddress(wallet.address)}
				</span>
			{:else}
				{t('nav.connect', language.current as any)}
			{/if}
		</button>

		<!-- Wallet Dropdown Menu -->
		{#if showWalletMenu}
			<div class="wallet-dropdown-menu">
				{#if wallet.isConnected}
					<!-- Account List -->
					{#if wallet.connectedAccounts.length > 1}
						<div class="wallet-accounts-section">
							<div class="wallet-accounts-header">
								<span class="accounts-title">Connected Accounts ({wallet.connectedAccounts.length})</span>
							</div>
							{#each wallet.connectedAccounts as account, index}
								<button
									class="wallet-account-item"
									class:wallet-account-active={wallet.activeAccountIndex === index}
									onmousedown={(e) => {
										if (e.button === 0) wallet.setActiveAccount(index);
									}}
								>
									<div class="account-item-content">
										<div class="account-address">{formatAddress(account.address)}</div>
										<div class="account-wallet">{account.walletName}</div>
									</div>
									{#if wallet.activeAccountIndex === index}
										<span class="account-checkmark">✓</span>
									{/if}
								</button>
								{#if wallet.connectedAccounts.length > 1}
									<button
										class="account-remove-btn"
										title="Disconnect this account"
										onmousedown={(e) => {
											if (e.button === 0) {
												e.stopPropagation();
												wallet.disconnectAccount(index);
											}
										}}
									>
										✕
									</button>
								{/if}
							{/each}
						</div>

						<div class="wallet-divider"></div>
					{/if}

					<!-- Current Account Info -->
					<div class="wallet-account-info">
						<div class="wallet-account-label">Current Account</div>
						<div class="wallet-address-display">
							{wallet.address}
						</div>
						{#if wallet.balance !== null}
							<div class="wallet-balance-info">
								Balance: {formatBalance(wallet.balance)} {getChainSymbol(wallet.chainId)}
							</div>
						{/if}
					</div>

					<!-- Connect Additional Wallet -->
					<button
						class="wallet-add-btn"
						onmousedown={(e) => {
							if (e.button === 0) showWalletMenu = false;
						}}
						onclick={() => {
							showWalletMenu = true;
							// Will show wallet selection
						}}
					>
						+ Add Another Wallet
					</button>

					<!-- Disconnect Buttons -->
					<button
						class="wallet-disconnect-btn"
						onmousedown={(e) => {
							if (e.button === 0) wallet.disconnect();
						}}
					>
						{t('nav.disconnect', language.current as any)}
					</button>
				{:else}
					<!-- Available Wallets -->
					{#if wallet.availableWallets.length > 0}
						{#each wallet.availableWallets as walletInfo}
							<button
								class="wallet-option-btn"
								onmousedown={(e) => {
									if (e.button === 0) handleConnect(walletInfo.uuid);
								}}
							>
								{#if walletInfo.icon}
									<img src={walletInfo.icon} alt={walletInfo.name} class="wallet-option-icon" />
								{/if}
								<span>{walletInfo.name}</span>
							</button>
						{/each}
					{:else}
						<div class="wallet-no-wallets">
							No wallets detected. Please install MetaMask or another wallet.
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>

	<!-- Network Switch Button (only when connected) -->
	{#if wallet.isConnected}
		<div class="network-button-wrapper">
			<button
				class="btn-secondary network-button"
				onmousedown={(e) => {
					if (e.button === 0) {
						showNetworkMenu = !showNetworkMenu;
						showWalletMenu = false;
					}
				}}
			>
				<span class="network-status-dot"></span>
				{getChainName(wallet.chainId)}
			</button>

			<!-- Network Dropdown Menu -->
			{#if showNetworkMenu}
				<div class="network-dropdown-menu">
					{#each wallet.getAvailableChains() as chainInfo}
						<button
							class="network-option-btn"
							class:network-option-selected={wallet.chainId === chainInfo.id}
							onmousedown={(e) => {
								if (e.button === 0) handleSwitchChain(chainInfo.id);
							}}
						>
							<span>{chainInfo.name}</span>
							{#if wallet.chainId === chainInfo.id}
								<span class="network-checkmark">✓</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Error Display -->
{#if wallet.error}
	<div class="wallet-error-message">
		{wallet.error}
	</div>
{/if}

<style>
	.wallet-container {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.wallet-button-wrapper {
		position: relative;
	}

	.wallet-button-min-width {
		min-width: 150px;
	}

	.wallet-status-loading {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.spinner {
		display: inline-block;
		animation: spin 1s linear infinite;
	}

	.wallet-status-connected {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.wallet-status-dot {
		width: 0.5rem;
		height: 0.5rem;
		background-color: #22c55e;
		border-radius: 9999px;
	}

	.wallet-dropdown-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background-color: #f9f9f9;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 50;
		min-width: 280px;
		max-height: 500px;
		overflow-y: auto;
	}

	body.dark .wallet-dropdown-menu {
		background-color: #282828;
		border-color: #404040;
	}

	.wallet-accounts-section {
		border-bottom: 1px solid #e0e0e0;
		padding: 0;
	}

	body.dark .wallet-accounts-section {
		border-bottom-color: #404040;
	}

	.wallet-accounts-header {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e0e0e0;
		background-color: #f5f5f5;
	}

	body.dark .wallet-accounts-header {
		background-color: #1f1f1f;
		border-bottom-color: #404040;
	}

	.accounts-title {
		font-size: 0.85rem;
		font-weight: 600;
		color: #757575;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	body.dark .accounts-title {
		color: #a0a0a0;
	}

	.wallet-account-item {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: background-color 0.2s ease;
		border-bottom: 1px solid #f0f0f0;
		position: relative;
	}

	body.dark .wallet-account-item {
		border-bottom-color: #3a3a3a;
	}

	.wallet-account-item:hover {
		background-color: #f5f5f5;
	}

	body.dark .wallet-account-item:hover {
		background-color: #3a3a3a;
	}

	.wallet-account-active {
		background-color: #eff6ff;
	}

	body.dark .wallet-account-active {
		background-color: #1e3a44;
	}

	.account-item-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.account-address {
		font-family: monospace;
		font-size: 0.85rem;
		color: #333;
	}

	body.dark .account-address {
		color: #d0d0d0;
	}

	.account-wallet {
		font-size: 0.75rem;
		color: #999;
	}

	body.dark .account-wallet {
		color: #888;
	}

	.account-checkmark {
		color: #1d7484;
		font-weight: bold;
		font-size: 1.1rem;
	}

	body.dark .account-checkmark {
		color: #5eb3c6;
	}

	.account-remove-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #999;
		cursor: pointer;
		font-size: 1rem;
		padding: 0.25rem;
		transition: color 0.2s ease;
	}

	.account-remove-btn:hover {
		color: #b91c1c;
	}

	body.dark .account-remove-btn {
		color: #666;
	}

	body.dark .account-remove-btn:hover {
		color: #ff7070;
	}

	.wallet-divider {
		height: 1px;
		background-color: #e0e0e0;
		margin: 0.5rem 0;
	}

	body.dark .wallet-divider {
		background-color: #404040;
	}

	.wallet-account-info {
		padding: 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	body.dark .wallet-account-info {
		border-bottom-color: #404040;
	}

	.wallet-account-label {
		font-size: 0.9rem;
		color: #757575;
		margin-bottom: 0.5rem;
	}

	body.dark .wallet-account-label {
		color: #a0a0a0;
	}

	.wallet-address-display {
		font-family: monospace;
		font-size: 0.85rem;
		word-break: break-all;
		color: #333;
	}

	body.dark .wallet-address-display {
		color: #d0d0d0;
	}

	.wallet-balance-info {
		font-size: 0.9rem;
		color: #757575;
		margin-top: 0.5rem;
	}

	body.dark .wallet-balance-info {
		color: #a0a0a0;
	}

	.wallet-add-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.9rem;
		color: #1d7484;
		transition: background-color 0.2s ease;
		border-bottom: 1px solid #e0e0e0;
	}

	body.dark .wallet-add-btn {
		color: #5eb3c6;
		border-bottom-color: #404040;
	}

	.wallet-add-btn:hover {
		background-color: #f5f5f5;
	}

	body.dark .wallet-add-btn:hover {
		background-color: #3a3a3a;
	}

	.wallet-disconnect-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.95rem;
		color: #b91c1c;
		transition: background-color 0.2s ease;
	}

	.wallet-disconnect-btn:hover {
		background-color: #fee2e2;
	}

	body.dark .wallet-disconnect-btn:hover {
		background-color: #5a2c2c;
	}

	.wallet-option-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.95rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background-color 0.2s ease;
	}

	.wallet-option-btn:hover {
		background-color: #f1f1f1;
	}

	body.dark .wallet-option-btn:hover {
		background-color: #3a3a3a;
	}

	.wallet-option-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.wallet-no-wallets {
		padding: 1rem;
		color: #757575;
		font-size: 0.9rem;
	}

	body.dark .wallet-no-wallets {
		color: #a0a0a0;
	}

	.network-button-wrapper {
		position: relative;
	}

	.network-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 120px;
	}

	.network-status-dot {
		width: 0.375rem;
		height: 0.375rem;
		background-color: #10b981;
		border-radius: 9999px;
	}

	.network-dropdown-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background-color: #f9f9f9;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 50;
		min-width: 200px;
	}

	body.dark .network-dropdown-menu {
		background-color: #282828;
		border-color: #404040;
	}

	.network-option-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background-color: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.95rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: background-color 0.2s ease;
	}

	.network-option-selected {
		background-color: #eff6ff;
	}

	body.dark .network-option-selected {
		background-color: #1e3a44;
	}

	.network-option-btn:hover {
		background-color: #f1f1f1;
	}

	body.dark .network-option-btn:hover {
		background-color: #3a3a3a;
	}

	.network-checkmark {
		color: #1d7484;
		font-weight: bold;
	}

	body.dark .network-checkmark {
		color: #5eb3c6;
	}

	.wallet-error-message {
		color: #b91c1c;
		font-size: 0.9rem;
		margin-top: 0.5rem;
		padding: 0.75rem;
		background-color: #fee2e2;
		border-radius: 4px;
	}

	body.dark .wallet-error-message {
		background-color: #5a2c2c;
		color: #ff7070;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	button:hover {
		opacity: 0.9;
	}
</style>
