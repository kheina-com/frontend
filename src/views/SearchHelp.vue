<template>
	<main id='feature'>
		<p>
			Search for a tag by typing a tag into the search bar and hitting enter.
		</p>
		<p>
			You can search for multiple tags by entering multiple tags into the search bar, separated by spaces.
		</p>
	</main>
</template>

<script>
export default {
	name: 'SearchHelp',
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
p {
	width: 70vw;
	margin: 0 auto;
}
.mobile p {
	width: auto;
}
</style>