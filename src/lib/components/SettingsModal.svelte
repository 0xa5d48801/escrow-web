<script lang="ts">
	import { getDarkMode, getLanguage } from '$lib/state.svelte';
	import { t } from '$lib/i18n';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable() }: Props = $props();

	const darkMode = getDarkMode();
	const language = getLanguage();
</script>

{#if open}
	<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
		<div class="modal">
			<div class="settings-header">
				<h2 id="settings-title" class="settings-title">
					{t('settings.title', language.current as any)}
				</h2>
				<button
					class="settings-close-btn"
					onmousedown={(e) => e.button === 0 && (open = false)}
					aria-label={t('common.close', language.current as any)}
				>
					<svg class="settings-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-6">
				<!-- Dark Mode Toggle -->
				<div class="settings-item">
					<label class="label settings-label">
						{t('settings.darkMode', language.current as any)}
					</label>
					<button
						class="settings-toggle"
						class:settings-toggle-active={darkMode.isDark}
						onmousedown={(e) => e.button === 0 && darkMode.toggle()}
						role="switch"
						aria-checked={darkMode.isDark}
					>
						<div
							class="settings-toggle-handle"
							class:settings-toggle-handle-active={darkMode.isDark}
						/>
					</button>
				</div>

				<!-- Language Selection -->
				<div>
					<label class="label">{t('settings.language', language.current as any)}</label>
					<div class="settings-language-buttons">
						<button
							class="settings-lang-btn"
							class:settings-lang-btn-active={language.current === 'en'}
							onmousedown={(e) => e.button === 0 && language.set('en')}
						>
							{t('settings.english', language.current as any)}
						</button>
						<button
							class="settings-lang-btn"
							class:settings-lang-btn-active={language.current === 'zh'}
							onmousedown={(e) => e.button === 0 && language.set('zh')}
						>
							{t('settings.chinese', language.current as any)}
						</button>
					</div>
				</div>
			</div>

			<div class="settings-footer">
				<button
					class="btn-outline"
					style="flex: 1;"
					onmousedown={(e) => e.button === 0 && (open = false)}
				>
					{t('common.close', language.current as any)}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.settings-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.settings-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
	}

	.settings-close-btn {
		padding: 0.5rem;
		border-radius: 4px;
		border: none;
		background: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.settings-close-btn:hover {
		background-color: #f1f1f1;
	}

	body.dark .settings-close-btn:hover {
		background-color: #404040;
	}

	.settings-close-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.settings-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.settings-label {
		margin-bottom: 0;
	}

	.settings-toggle {
		position: relative;
		width: 3rem;
		height: 1.5rem;
		border-radius: 9999px;
		border: none;
		cursor: pointer;
		background-color: #ccc;
		transition: background-color 0.2s ease;
	}

	.settings-toggle-active {
		background-color: #1d7484;
	}

	body.dark .settings-toggle {
		background-color: #555;
	}

	body.dark .settings-toggle-active {
		background-color: #5eb3c6;
	}

	.settings-toggle-handle {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1.25rem;
		height: 1.25rem;
		background-color: white;
		border-radius: 9999px;
		transition: transform 0.2s ease;
	}

	body.dark .settings-toggle-handle {
		background-color: #f9f9f9;
	}

	.settings-toggle-handle-active {
		transform: translateX(1.5rem);
	}

	.settings-language-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.settings-lang-btn {
		flex: 1;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: 2px solid #e0e0e0;
		background-color: transparent;
		color: #4a4a4a;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.settings-lang-btn-active {
		border-color: #1d7484;
		background-color: #1d7484;
		color: #f9f9f9;
	}

	body.dark .settings-lang-btn {
		border-color: #555;
		color: #b0b0b0;
	}

	body.dark .settings-lang-btn:hover {
		background-color: #404040;
	}

	body.dark .settings-lang-btn-active {
		border-color: #5eb3c6;
		background-color: #5eb3c6;
		color: #1a1a1a;
	}

	.settings-footer {
		display: flex;
		gap: 0.75rem;
		margin-top: 2rem;
	}
</style>
