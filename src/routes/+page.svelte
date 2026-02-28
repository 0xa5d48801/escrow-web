<script lang="ts">
	import { getLanguage, getWalletState, getTradeState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';

	const language = getLanguage();
	const wallet = getWalletState();
	const trades = getTradeState();

	let queryAddress = $state('');
	let queryResult = $state<any>(null);
	let isQuerying = $state(false);

	const queryTrade = async () => {
		if (!queryAddress) return;
		isQuerying = true;
		try {
			// TODO: Query trade from contract
		} finally {
			isQuerying = false;
		}
	};

	const queryCredit = async () => {
		if (!queryAddress) return;
		isQuerying = true;
		try {
			await trades.loadCredit(queryAddress);
			queryResult = trades.credits.get(queryAddress);
		} finally {
			isQuerying = false;
		}
	};
</script>

<div class="space-y-12">
	<!-- Hero Section -->
	<section class="hero-section">
		<h1 class="hero-title">
			{t('home.title', language.current as any)}
		</h1>
		<p class="hero-subtitle">
			{t('home.subtitle', language.current as any)}
		</p>

		<!-- Quick Actions -->
		<div class="hero-actions">
			<a href="/create" class="btn-primary action-link">
				{t('home.createTrade', language.current as any)}
			</a>
			<button class="btn-secondary">
				{t('home.queryTrade', language.current as any)}
			</button>
			<button class="btn-secondary">
				{t('home.queryCredit', language.current as any)}
			</button>
		</div>
	</section>

	<!-- Query Section -->
	<section class="query-card">
		<h2 class="query-title">
			{t('home.queryTrade', language.current as any)}
		</h2>

		<div class="space-y-4">
			<div>
				<label for="queryAddress" class="label">{t('common.address', language.current as any)}</label>
				<input
					id="queryAddress"
					type="text"
					class="input"
					placeholder="0x..."
					bind:value={queryAddress}
				/>
			</div>

			<div class="query-buttons">
				<button class="btn-primary query-btn" onclick={queryTrade} disabled={isQuerying || !queryAddress}>
					{isQuerying ? t('common.loading', language.current as any) : t('home.queryTrade', language.current as any)}
				</button>
				<button class="btn-secondary query-btn" onclick={queryCredit} disabled={isQuerying || !queryAddress}>
					{isQuerying ? t('common.loading', language.current as any) : t('home.queryCredit', language.current as any)}
				</button>
			</div>
		</div>

		{#if queryResult}
			<div class="query-result">
				<pre class="result-code">
{JSON.stringify(queryResult, null, 2)}
				</pre>
			</div>
		{/if}
	</section>

	<!-- Stats Section -->
	<section class="stats-grid">
		<div class="stat-card">
			<div class="stat-value stat-active">0</div>
			<p class="stat-label">Active Trades</p>
		</div>
		<div class="stat-card">
			<div class="stat-value stat-completed">0</div>
			<p class="stat-label">Completed</p>
		</div>
		<div class="stat-card">
			<div class="stat-value stat-volume">0</div>
			<p class="stat-label">Total Volume</p>
		</div>
	</section>
</div>

<style>
	.hero-section {
		text-align: center;
		padding: 3rem 0;
		padding-top: 5rem;
	}

	.hero-title {
		font-size: 2.35em;
		margin-bottom: 1rem;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: #757575;
		margin-bottom: 2rem;
	}

	body.dark .hero-subtitle {
		color: #a0a0a0;
	}

	.hero-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.action-link {
		display: inline-block;
	}

	.query-card {
		max-width: 600px;
		margin: 2.5rem auto;
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .query-card {
		background-color: #282828;
		border-color: #404040;
	}

	.query-title {
		font-size: 2em;
		margin-bottom: 1.5rem;
	}

	.query-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.query-btn {
		flex: 1;
	}

	.query-result {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e0e0e0;
	}

	body.dark .query-result {
		border-top-color: #404040;
	}

	.result-code {
		background-color: #f1f1f1;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.9em;
		font-family: monospace;
	}

	body.dark .result-code {
		background-color: #1a1a1a;
		color: #d0d0d0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}

	.stat-card {
		text-align: center;
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .stat-card {
		background-color: #282828;
		border-color: #404040;
	}

	.stat-value {
		font-size: 1.875rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.stat-active {
		color: #1d7484;
	}

	.stat-completed {
		color: #10b981;
	}

	.stat-volume {
		color: #3b82f6;
	}

	.stat-label {
		color: #757575;
		margin-bottom: 0;
	}

	body.dark .stat-label {
		color: #a0a0a0;
	}
</style>
