<script lang="ts">
	import { getLanguage } from '$lib/state.svelte';
	import { t } from '$lib/i18n';

	const language = getLanguage();

	const faqs = [
		{
			q: language.current === 'zh' ? '什么是托管交易?' : 'What is escrow trading?',
			a: language.current === 'zh'
				? '托管交易是一种安全的交易方式，第三方托管资金直到交易完成才释放。'
				: 'Escrow trading is a secure way to trade where a third party holds funds until the transaction is completed.'
		},
		{
			q: language.current === 'zh' ? '如何创建交易?' : 'How to create a trade?',
			a: language.current === 'zh'
				? '连接钱包后，点击"创建交易"按钮，填写交易金额和详情即可。'
				: 'After connecting your wallet, click the "Create Trade" button and fill in the trade amount and details.'
		},
		{
			q: language.current === 'zh' ? '交易需要多长时间完成?' : 'How long does a trade take to complete?',
			a: language.current === 'zh'
				? '交易时间取决于卖家和买家的确认速度，通常在24小时内完成。'
				: 'The time depends on how quickly the seller and buyer confirm, usually completed within 24 hours.'
		},
		{
			q: language.current === 'zh' ? '如果交易失败会怎样?' : 'What happens if a trade fails?',
			a: language.current === 'zh'
				? '所有资金将被安全退还到原始钱包地址。'
				: 'All funds will be safely returned to the original wallet address.'
		}
	];

	let expandedIndex = $state<number | null>(null);
</script>

<div class="guide-container">
	<h1 class="guide-title">
		{t('guide.title', language.current as any)}
	</h1>

	<div class="space-y-4 faqs-list">
		{#each faqs as faq, index}
			<div class="card faq-item">
				<button
					class="faq-question-btn"
					onclick={() => expandedIndex = expandedIndex === index ? null : index}
				>
					<span class="faq-question-text">{faq.q}</span>
					<svg
						class="faq-arrow-icon"
						class:faq-arrow-rotated={expandedIndex === index}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</button>

				{#if expandedIndex === index}
					<div class="faq-answer">
						{faq.a}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Additional Resources -->
	<div class="card resources-card">
		<h2 class="resources-title">Getting Started</h2>
		<ul class="resources-list">
			<li>✓ {language.current === 'zh' ? '安装MetaMask或其他钱包' : 'Install MetaMask or other wallet'}</li>
			<li>✓ {language.current === 'zh' ? '连接至你选择的网络' : 'Connect to your chosen network'}</li>
			<li>✓ {language.current === 'zh' ? '获取测试币进行交易' : 'Get test coins for transactions'}</li>
			<li>✓ {language.current === 'zh' ? '开始安全的P2P交易' : 'Start safe P2P trading'}</li>
		</ul>
	</div>
</div>

<style>
	.guide-container {
		max-width: 600px;
		margin: 0 auto;
		display: grid;
		gap: 2rem;
		margin-bottom: 2.5rem;
	}

	.guide-title {
		text-align: center;
		font-size: 1.875rem;
		font-weight: bold;
	}

	.faqs-list {
		display: grid;
		gap: 1rem;
	}

	.faq-item {
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .faq-item {
		background-color: #282828;
		border-color: #404040;
	}

	.faq-question-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
	}

	.faq-question-text {
		font-size: 1.125rem;
		font-weight: 600;
		text-align: left;
	}

	.faq-arrow-icon {
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.faq-arrow-rotated {
		transform: rotate(180deg);
	}

	.faq-answer {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
		color: #757575;
	}

	body.dark .faq-answer {
		border-top-color: #404040;
		color: #a0a0a0;
	}

	.resources-card {
		background-color: #f0f9ff;
		border: 1px solid #bfdbfe;
		padding: 1.5rem;
		border-radius: 4px;
	}

	body.dark .resources-card {
		background-color: #1e3a44;
		border-color: #2a5a6e;
		color: #d0d0d0;
	}

	.resources-title {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.resources-list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.resources-list li {
		margin: 0;
	}
</style>
