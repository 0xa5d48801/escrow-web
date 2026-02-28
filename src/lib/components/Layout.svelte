<script lang="ts">
	import { getDarkMode, getLanguage, getWalletState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';
	import Navbar from './Navbar.svelte';
	import SettingsModal from './SettingsModal.svelte';

	let showSettings = $state(false);
	const darkMode = getDarkMode();
	const language = getLanguage();
	const wallet = getWalletState();
</script>

<div class="layout">
	<Navbar bind:showSettings />

	<main class="layout-main">
		<slot />
	</main>

	<footer class="layout-footer">
		<div class="container">
			<div class="footer-grid">
				<div class="footer-section">
					<h3 class="footer-title">About</h3>
					<p class="footer-text">
						{language.current === 'zh' ? '分布式托管交易平台' : 'Decentralized Escrow Trading Platform'}
					</p>
				</div>
				<div class="footer-section">
					<h3 class="footer-title">Resources</h3>
					<ul class="footer-list">
						<li class="footer-item"><a href="#">Documentation</a></li>
						<li class="footer-item"><a href="#">GitHub</a></li>
					</ul>
				</div>
				<div class="footer-section">
					<h3 class="footer-title">Social</h3>
					<ul class="footer-list">
						<li class="footer-item"><a href="#">Twitter</a></li>
						<li class="footer-item"><a href="#">Discord</a></li>
						<li class="footer-item"><a href="#">Telegram</a></li>
					</ul>
				</div>
				<div class="footer-section">
					<h3 class="footer-title">Contact</h3>
					<ul class="footer-list">
						<li class="footer-item"><a href="mailto:support@escrow.local">Email</a></li>
					</ul>
				</div>
			</div>
			<div class="footer-copyright">
				<p>&copy; 2026 Escrow DApp. All rights reserved.</p>
			</div>
		</div>
	</footer>

	<SettingsModal bind:open={showSettings} />
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.layout-main {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		width: 100%;
	}

	.layout-footer {
		border-top: 1px solid #e0e0e0;
		margin-top: 3rem;
		padding: 2rem 0;
		background-color: #fafafa;
	}

	body.dark .layout-footer {
		background-color: #1a1a1a;
		border-top-color: #404040;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2rem;
	}

	.footer-section {
		display: flex;
		flex-direction: column;
	}

	.footer-title {
		font-weight: bold;
		font-size: 1.125rem;
		margin-bottom: 1rem;
	}

	.footer-text {
		font-size: 0.9rem;
		color: #757575;
	}

	body.dark .footer-text {
		color: #b0b0b0;
	}

	.footer-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-item {
		margin-bottom: 0.4em;
	}

	.footer-item a {
		color: inherit;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-item a:hover {
		color: #1d7484;
	}

	body.dark .footer-item a:hover {
		color: #5eb3c6;
	}

	.footer-copyright {
		border-top: 1px solid #e0e0e0;
		margin-top: 2rem;
		padding-top: 2rem;
		text-align: center;
		font-size: 0.9rem;
		color: #757575;
	}

	body.dark .footer-copyright {
		border-top-color: #404040;
		color: #b0b0b0;
	}

	.footer-copyright p {
		margin: 0;
	}

	@media (max-width: 768px) {
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
