<template>
	<input type='url' :id='id' :name='name' :value='content' autocomplete='off' class='interactable text'>
</template>

<script>
export default {
	name: 'UrlField',
	props: {
		id: String,
		name: String,
		content: String,
	}
}
</script>

<style scoped>

</style>
