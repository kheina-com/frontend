<template>
	<a :href='link' v-if='link'>
		<slot/>
	</a>
	<div v-else>
		<slot/>
	</div>
</template>

<script>
export default {
	name: 'DivLink',
	props: {
		link: {
			type: String,
			default: null,
		},
	}
}
</script>

<style scoped>

</style>
