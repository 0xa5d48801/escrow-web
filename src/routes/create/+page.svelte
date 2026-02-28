<script lang="ts">
	import { getLanguage, getWalletState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';

	const language = getLanguage();
	const wallet = getWalletState();

	let formData = $state({
		goodsAmount: '',
		deposit: '',
		discountPercentage: 0
	});

	let isSubmitting = $state(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!wallet.isConnected) {
			alert('Please connect wallet');
			return;
		}

		isSubmitting = true;
		try {
			// TODO: Create trade via contract
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="create-container">
	<h1 class="create-title">Create Trade</h1>

	<div class="card create-card">
		<form onsubmit={handleSubmit} class="create-form">
			<div>
				<label class="label" for="goodsAmount">
					Goods Amount (USDT)
				</label>
				<input
					id="goodsAmount"
					type="number"
					class="input"
					placeholder="100.00"
					required
					bind:value={formData.goodsAmount}
					step="0.01"
				/>
			</div>

			<div>
				<label class="label" for="deposit">
					Seller Deposit (USDT)
				</label>
				<input
					id="deposit"
					type="number"
					class="input"
					placeholder="50.00"
					required
					bind:value={formData.deposit}
					step="0.01"
				/>
			</div>

			<div>
				<label class="label" for="discount">
					Discount (%)
				</label>
				<input
					id="discount"
					type="number"
					class="input"
					placeholder="0"
					min="0"
					max="100"
					bind:value={formData.discountPercentage}
					step="1"
				/>
			</div>

			<div class="create-buttons">
				<button
					type="submit"
					class="btn-primary create-btn"
					disabled={isSubmitting || !wallet.isConnected}
				>
					{isSubmitting ? 'Creating...' : 'Create Trade'}
				</button>
				<a href="/" class="btn-outline create-cancel-btn">
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

<style>
	.create-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.create-title {
		font-size: 1.875rem;
		font-weight: bold;
		margin-bottom: 2rem;
	}

	.create-card {
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	body.dark .create-card {
		background-color: #282828;
		border-color: #404040;
	}

	.create-form {
		display: grid;
		gap: 1.5rem;
	}

	.create-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.create-btn {
		flex: 1;
	}

	.create-cancel-btn {
		flex: 1;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}
</style>
