<template>
	<Loading :span='span' :isLoading='isLoading'><p class='title' :style='titleStyle'><slot name='default'/><span class='super'><slot name='super'/></span></p></Loading>
</template>

<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import { computed } from 'vue';

const props = defineProps({
	static: {
		type: String,
		default: null,
	},
	size: {
		type: String,
		default: '4rem',
	},
	isLoading: {
		type: Boolean,
		default: false,
	},
	span: {
		type: Boolean,
		default: false,
	}
});
const titleStyle = computed(() => `font-size: ${props.size}; text-align: ${props.static};`);
</script>

<style scoped>
p {
	word-wrap: anywhere;
	text-align: center;
	margin: 0;
}
p .super {
	position: absolute;
	font-size: 1rem;
	font-weight: bold;
}
.super, .super *
{ color: var(--subtle) !important; }
.title {
	padding: 0;
	overflow: hidden;
}
</style>
