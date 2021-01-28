<template>
	<input type='file' size='50' :id='id' :name='name' :value='content' autocomplete='off' class='interactable upload' >
</template>

<script>
export default {
	name: 'FileField',
	props: {
		id: String,
		name: String,
		content: String,
	}
}
</script>

<style scoped>
.upload
{
	width: 100%;
	padding: 25px;
	overflow: hidden;
	position: relative;
	border-radius: 3px;
	display: inline-block;
	white-space: initial;
    border-style: dashed;
    border-width: 2px;
}

</style>
