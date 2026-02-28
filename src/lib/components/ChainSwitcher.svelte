<script lang="ts">
	import { getWalletState } from '$lib/state.svelte';
	import { CHAIN_CONFIGS, SUPPORTED_CHAINS } from '$lib/web3.svelte';
	import { getLanguage } from '$lib/state.svelte';

	const wallet = getWalletState();
	const language = getLanguage();

	let isOpen = $state(false);
	const chains = [
		CHAIN_CONFIGS[SUPPORTED_CHAINS.ETH_MAINNET],
		CHAIN_CONFIGS[SUPPORTED_CHAINS.ETH_SEPOLIA],
		CHAIN_CONFIGS[SUPPORTED_CHAINS.TRON_MAINNET],
		CHAIN_CONFIGS[SUPPORTED_CHAINS.TRON_SHASTA]
	];

	const switchChain = async (chainId: number) => {
		await wallet.switchChain(chainId);
		isOpen = false;
	};
</script>

{#if wallet.isConnected}
	<div class="chain-switcher-wrapper">
		<button
			class="chain-switcher-btn"
			onmousedown={(e) => e.button === 0 && (isOpen = !isOpen)}
		>
			<span class="chain-switcher-dot"></span>
			{CHAIN_CONFIGS[wallet.chainId || SUPPORTED_CHAINS.ETH_MAINNET]?.name || 'Unknown Chain'}
		</button>

		{#if isOpen}
			<div class="chain-switcher-menu">
				{#each chains as chain}
					<button
						class="chain-switcher-option"
						class:chain-switcher-option-active={chain.id === wallet.chainId}
						onmousedown={(e) => e.button === 0 && switchChain(chain.id)}
					>
						<span class="chain-option-dot"></span>
						{chain.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.chain-switcher-wrapper {
		position: relative;
	}

	.chain-switcher-btn {
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
		background-color: #f9f9f9;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.chain-switcher-btn:hover {
		background-color: #f1f1f1;
	}

	body.dark .chain-switcher-btn {
		background-color: #282828;
		border-color: #404040;
		color: #d0d0d0;
	}

	body.dark .chain-switcher-btn:hover {
		background-color: #3a3a3a;
	}

	.chain-switcher-dot {
		width: 0.5rem;
		height: 0.5rem;
		background-color: #f97316;
		border-radius: 9999px;
	}

	.chain-switcher-menu {
		position: absolute;
		right: 0;
		margin-top: 0.5rem;
		width: 12rem;
		background-color: #f9f9f9;
		border-radius: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #e0e0e0;
		z-index: 50;
	}

	body.dark .chain-switcher-menu {
		background-color: #282828;
		border-color: #404040;
	}

	.chain-switcher-option {
		width: 100%;
		text-align: left;
		padding: 0.5rem 1rem;
		border: none;
		background-color: transparent;
		border-bottom: 1px solid #e0e0e0;
		color: #4a4a4a;
		font-weight: 400;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background-color 0.2s ease;
	}

	.chain-switcher-option:hover {
		background-color: #f1f1f1;
	}

	.chain-switcher-option-active {
		background-color: #f0f9ff;
		color: #1d7484;
		font-weight: 600;
	}

	body.dark .chain-switcher-option {
		color: #b0b0b0;
		border-bottom-color: #404040;
	}

	body.dark .chain-switcher-option:hover {
		background-color: #3a3a3a;
	}

	body.dark .chain-switcher-option-active {
		background-color: #1e3a44;
		color: #5eb3c6;
	}

	.chain-option-dot {
		width: 0.5rem;
		height: 0.5rem;
		background-color: #f97316;
		border-radius: 9999px;
	}
</style>
