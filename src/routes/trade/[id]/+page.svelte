<script lang="ts">
	import { page } from '$app/stores';
	import { getLanguage, getTradeState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';

	const language = getLanguage();
	const trades = getTradeState();

	let tradeId = $derived(parseInt($page.params.id));
	let trade = $derived(trades.trades.find(t => t.id === tradeId));
</script>

{#if !trade}
	<div class="card trade-not-found">
		<p class="not-found-text">Trade not found</p>
		<a href="/seller" class="btn-primary back-btn">
			Back to Trades
		</a>
	</div>
{:else}
	<div class="trade-detail-container">
		<h1 class="trade-detail-title">Trade #{trade.id}</h1>

		<!-- Trade Details -->
		<div class="card trade-details-card">
			<div class="details-grid">
				<div>
					<p class="detail-label">Seller</p>
					<p class="detail-value monospace">{trade.seller}</p>
				</div>
				<div>
					<p class="detail-label">Buyer</p>
					<p class="detail-value monospace">{trade.buyer}</p>
				</div>
				<div>
					<p class="detail-label">Goods Amount</p>
					<p class="detail-value amount">{(Number(trade.goodsAmount) / 1e6).toFixed(2)} USDT</p>
				</div>
				<div>
					<p class="detail-label">Status</p>
					<div class="badge badge-{trade.status.toLowerCase() === 'confirmed'
						? 'success'
						: trade.status.toLowerCase() === 'cancelled'
							? 'danger'
							: 'warning'}">
						{t(`status.${trade.status.toLowerCase()}`, language.current as any)}
					</div>
				</div>
				<div>
					<p class="detail-label">Seller Deposit</p>
					<p class="detail-value monospace">{(Number(trade.sellerDeposit) / 1e6).toFixed(2)} USDT</p>
				</div>
				<div>
					<p class="detail-label">Buyer Deposit</p>
					<p class="detail-value monospace">{(Number(trade.buyerDeposit) / 1e6).toFixed(2)} USDT</p>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		{#if trade.status === 'Created'}
			<div class="action-buttons">
				<button class="btn-primary action-btn">Join Trade</button>
				<button class="btn-outline action-btn">Cancel</button>
			</div>
		{:else if trade.status === 'Joined'}
			<div class="action-buttons">
				<button class="btn-primary action-btn">Confirm</button>
				<button class="btn-outline action-btn">Propose Discount</button>
			</div>
		{/if}

		<a href="/seller" class="btn-outline back-link">
			Back
		</a>
	</div>
{/if}

<style>
	.trade-not-found {
		text-align: center;
		padding: 3rem 0;
	}

	.not-found-text {
		color: #757575;
	}

	body.dark .not-found-text {
		color: #a0a0a0;
	}

	.back-btn {
		display: inline-block;
		margin-top: 1rem;
	}

	.trade-detail-container {
		max-width: 600px;
		margin: 0 auto;
		display: grid;
		gap: 1.5rem;
	}

	.trade-detail-title {
		font-size: 1.875rem;
		font-weight: bold;
	}

	.trade-details-card {
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .trade-details-card {
		background-color: #282828;
		border-color: #404040;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.detail-label {
		font-size: 0.9rem;
		color: #757575;
		margin-bottom: 0.25rem;
	}

	body.dark .detail-label {
		color: #a0a0a0;
	}

	.detail-value {
		font-size: 0.9rem;
		word-break: break-all;
	}

	.detail-value.monospace {
		font-family: monospace;
	}

	.detail-value.amount {
		font-weight: bold;
		font-size: 1.125rem;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.action-btn {
		flex: 1;
	}

	.back-link {
		display: block;
		text-align: center;
		padding: 0.5rem 1rem;
		text-decoration: none;
	}
</style>
