<template>
	<a :href='props.link' target='_blank' v-if='props.newTab'>
		<slot/>
	</a>
	<a :href='props.link' v-else-if='props.link'>
		<slot/>
	</a>
	<div v-else>
		<slot/>
	</div>
</template>
<script setup lang='ts'>
const props = defineProps({
	link: {
		type: String,
		default: null,
	},
	newTab: {
		type: Boolean,
		default: false,
	},
});
</script>
