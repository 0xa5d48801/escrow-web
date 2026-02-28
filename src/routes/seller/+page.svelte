<script lang="ts">
	import { getLanguage, getTradeState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';

	const language = getLanguage();
	const trades = getTradeState();

	let statusFilter = $state<string | null>(null);

	const statuses = ['Created', 'Joined', 'Confirmed', 'Cancelled'];

	const formatTime = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString(language.current === 'zh' ? 'zh-CN' : 'en-US');
	};

	const formatAmount = (amount: bigint) => {
		return (Number(amount) / 1e6).toFixed(2);
	};
</script>

<div class="space-y-6">
	<h1 class="seller-page-title">
		{t('seller.title', language.current as any)}
	</h1>

	<!-- Filter Section -->
	<div class="card seller-filter-section">
		<div class="filter-buttons">
			<button
				class="filter-btn"
				class:filter-btn-active={statusFilter === null}
				onclick={() => statusFilter = null}
			>
				{t('seller.allTrades', language.current as any)}
			</button>
			{#each statuses as status}
				<button
					class="filter-btn"
					class:filter-btn-active={statusFilter === status}
					onclick={() => statusFilter = status}
				>
					{t(`status.${status.toLowerCase()}`, language.current as any)}
				</button>
			{/each}
		</div>
	</div>

	<!-- Trades List -->
	{#if trades.isLoading}
		<div class="trades-loading">
			<p class="loading-text">{t('common.loading', language.current as any)}</p>
		</div>
	{:else if trades.trades.length === 0}
		<div class="card trades-empty">
			<p class="empty-text">No trades found</p>
		</div>
	{:else}
		<div class="trades-grid">
			{#each trades.trades as trade (trade.id)}
				{#if !statusFilter || trade.status === statusFilter}
					<a
						href="/trade/{trade.id}"
						class="card trade-card"
					>
						<div>
							<div class="trade-id">
								Trade #{trade.id}
							</div>
							<div class="trade-info">
								Amount: {formatAmount(trade.goodsAmount)} USDT
							</div>
							<div class="trade-info">
								Date: {formatTime(trade.createTime)}
							</div>
						</div>
						<div class="trade-status-container">
							<div class="badge badge-{trade.status.toLowerCase() === 'confirmed'
								? 'success'
								: trade.status.toLowerCase() === 'cancelled'
									? 'danger'
									: 'warning'}">
								{t(`status.${trade.status.toLowerCase()}`, language.current as any)}
							</div>
						</div>
					</a>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.seller-page-title {
		font-size: 1.875rem;
		font-weight: bold;
	}

	.seller-filter-section {
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .seller-filter-section {
		background-color: #282828;
		border-color: #404040;
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
		background-color: transparent;
		color: #4a4a4a;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-btn-active {
		border-color: #1d7484;
		background-color: #1d7484;
		color: #f9f9f9;
	}

	body.dark .filter-btn {
		border-color: #555;
		color: #b0b0b0;
	}

	body.dark .filter-btn:hover {
		background-color: #404040;
	}

	body.dark .filter-btn-active {
		border-color: #5eb3c6;
		background-color: #5eb3c6;
		color: #1a1a1a;
	}

	.trades-loading {
		text-align: center;
		padding: 3rem 0;
	}

	.loading-text {
		color: #757575;
	}

	body.dark .loading-text {
		color: #a0a0a0;
	}

	.trades-empty {
		text-align: center;
		padding: 3rem 0;
	}

	.empty-text {
		color: #757575;
	}

	body.dark .empty-text {
		color: #a0a0a0;
	}

	.trades-grid {
		display: grid;
		gap: 1rem;
	}

	.trade-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		transition: box-shadow 0.2s ease;
		text-decoration: none;
		color: inherit;
	}

	.trade-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	body.dark .trade-card:hover {
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
	}

	.trade-id {
		font-weight: 600;
		font-size: 1.125rem;
		margin-bottom: 0.25rem;
	}

	.trade-info {
		font-size: 0.9rem;
		color: #757575;
	}

	body.dark .trade-info {
		color: #a0a0a0;
	}

	.trade-status-container {
		text-align: right;
	}
</style>
