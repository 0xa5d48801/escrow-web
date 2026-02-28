<script lang="ts">
	import { getDarkMode, getLanguage, getWalletState } from '$lib/state.svelte';
	import { t } from '$lib/i18n';
	import WalletButton from './WalletButton.svelte';
	import ChainSwitcher from './ChainSwitcher.svelte';

	interface Props {
		showSettings?: boolean;
	}

	let { showSettings = $bindable() }: Props = $props();

	const darkMode = getDarkMode();
	const language = getLanguage();

	let isMenuOpen = $state(false);
	let currentPath = $state('/');

	if (typeof window !== 'undefined') {
		currentPath = window.location.pathname;
	}

	const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
</script>

<nav class="navbar">
	<div class="navbar-container">
		<!-- Logo -->
		<a href="/" class="navbar-logo">
			Escrow
		</a>

		<!-- Mobile menu button -->
		<button
			class="navbar-menu-toggle"
			onmousedown={(e) => e.button === 0 && (isMenuOpen = !isMenuOpen)}
			aria-label="Toggle menu"
			aria-expanded={isMenuOpen}
		>
			<svg class="navbar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>

		<!-- Desktop Navigation -->
		<div class="navbar-nav">
			<a
				href="/"
				class="navbar-link"
				class:navbar-link-active={isActive('/')}
			>
				{t('nav.home', language.current as any)}
			</a>
			<a
				href="/seller"
				class="navbar-link"
				class:navbar-link-active={isActive('/seller')}
			>
				{t('nav.seller', language.current as any)}
			</a>
			<a
				href="/buyer"
				class="navbar-link"
				class:navbar-link-active={isActive('/buyer')}
			>
				{t('nav.buyer', language.current as any)}
			</a>
			<a
				href="/guide"
				class="navbar-link"
				class:navbar-link-active={isActive('/guide')}
			>
				{t('nav.guide', language.current as any)}
			</a>
		</div>

		<!-- Right side controls -->
		<div class="navbar-controls">
			<ChainSwitcher />
			<WalletButton />
			<button
				class="navbar-settings-btn"
				onmousedown={(e) => e.button === 0 && (showSettings = true)}
				title={t('nav.settings', language.current as any)}
				aria-label={t('nav.settings', language.current as any)}
			>
				<svg class="navbar-settings-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</button>
		</div>

		<!-- Mobile Navigation -->
		{#if isMenuOpen}
			<div class="navbar-mobile">
				<a href="/" class="navbar-mobile-link">
					{t('nav.home', language.current as any)}
				</a>
				<a href="/seller" class="navbar-mobile-link">
					{t('nav.seller', language.current as any)}
				</a>
				<a href="/buyer" class="navbar-mobile-link">
					{t('nav.buyer', language.current as any)}
				</a>
				<a href="/guide" class="navbar-mobile-link">
					{t('nav.guide', language.current as any)}
				</a>
			</div>
		{/if}
	</div>
</nav>

<style>
	.navbar {
		border-bottom: 1px solid #e0e0e0;
		background-color: #fff;
		position: sticky;
		top: 0;
		z-index: 40;
	}

	body.dark .navbar {
		background-color: #1a1a1a;
		border-bottom-color: #404040;
	}

	.navbar-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.navbar-logo {
		font-size: 1.5rem;
		font-weight: bold;
		color: #1d7484;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.navbar-logo:hover {
		color: #982c61;
	}

	body.dark .navbar-logo {
		color: #5eb3c6;
	}

	body.dark .navbar-logo:hover {
		color: #ff69b4;
	}

	.navbar-menu-toggle {
		display: none;
		padding: 0.5rem;
		border-radius: 4px;
		border: none;
		background: none;
		cursor: pointer;
		color: inherit;
		transition: background-color 0.2s ease;
	}

	.navbar-menu-toggle:hover {
		background-color: #f1f1f1;
	}

	body.dark .navbar-menu-toggle:hover {
		background-color: #404040;
	}

	.navbar-menu-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.navbar-nav {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.navbar-link {
		text-decoration: none;
		color: #757575;
		font-weight: 400;
		transition: color 0.2s ease;
	}

	.navbar-link:hover {
		color: #1d7484;
	}

	.navbar-link-active {
		color: #1d7484;
		font-weight: 600;
	}

	body.dark .navbar-link {
		color: #b0b0b0;
	}

	body.dark .navbar-link:hover {
		color: #5eb3c6;
	}

	body.dark .navbar-link-active {
		color: #5eb3c6;
	}

	.navbar-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.navbar-settings-btn {
		padding: 0.5rem;
		border-radius: 4px;
		border: none;
		background: none;
		cursor: pointer;
		color: inherit;
		transition: background-color 0.2s ease;
	}

	.navbar-settings-btn:hover {
		background-color: #f1f1f1;
	}

	body.dark .navbar-settings-btn:hover {
		background-color: #404040;
	}

	.navbar-settings-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.navbar-mobile {
		width: 100%;
		border-top: 1px solid #e0e0e0;
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	body.dark .navbar-mobile {
		border-top-color: #404040;
	}

	.navbar-mobile-link {
		display: block;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #1d7484;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.navbar-mobile-link:hover {
		background-color: #f0f9ff;
	}

	body.dark .navbar-mobile-link {
		color: #5eb3c6;
	}

	body.dark .navbar-mobile-link:hover {
		background-color: #2a4a52;
	}

	@media (max-width: 768px) {
		.navbar-menu-toggle {
			display: block;
		}

		.navbar-nav {
			display: none;
		}

		.navbar-controls {
			width: 100%;
		}
	}
</style>
