<script>
	import Header from './components/Header.svelte';
	import Form from './components/Form.svelte';
	import CardGrid from './components/CardGrid.svelte';
	import Footer from './components/Footer.svelte';
</script>

<main>
	<Header />
	<Form />
		<CardGrid />
	<Footer />
</main>

<style>
	main {
		text-align: center;
		padding: 0;
		margin: 2rem;
		max-width: 100vw;
	}
</style>