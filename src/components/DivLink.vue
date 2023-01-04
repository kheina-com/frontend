<template>
	<a :href='link' target='_blank' v-if='newTab'>
		<slot/>
	</a>
	<a :href='link' v-else-if='link'>
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
		newTab: {
			type: Boolean,
			default: false,
		},
	}
}
</script>

<style scoped>

</style>
