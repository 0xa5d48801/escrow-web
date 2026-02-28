<script lang="ts">
	import Layout from '$lib/components/Layout.svelte';
	import '../app.pcss';

	let { children } = $props();
</script>

<Layout>
	<svelte:fragment slot="default">
		{@render children()}
	</svelte:fragment>
</Layout>
