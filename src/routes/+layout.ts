import type { LayoutLoad } from './$types';
import { getDarkMode, getLanguage, getWalletState, getTradeState } from '$lib/state.svelte';

export const load = (async () => {
	// Initialize global state
	getDarkMode();
	getLanguage();
	getWalletState();
	getTradeState();

	return {
		title: 'Escrow DApp'
	};
}) satisfies LayoutLoad;
