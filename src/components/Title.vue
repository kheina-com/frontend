<template>
	<Loading :span='span' :isLoading='isLoading'><p class='title' :style='titleStyle'><slot name='default'/><span class='super'><slot name='super'/></span></p></Loading>
</template>

<script>
import Loading from '@/components/Loading.vue';

export default {
	name: 'Title',
	components: {
		Loading,
	},
	props: {
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
	},
	computed: {
		titleStyle() {
			return `font-size: ${this.size}; text-align: ${this.static};`;
		},
	},
}
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
