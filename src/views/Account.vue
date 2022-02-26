<template>
	<main v-if='!isError'>
		<p style='text-align: center'>hey u logged in, nice</p>
		<ThemeMenu/>
	</main>
	<Error v-model:dump='errorDump' v-model:message='errorMessage' v-else/>
</template>

<script>
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'Login',
	data() {
		return {
			errorMessage: null,
			errorDump: null,
		};
	},
	components: {
		ThemeMenu,
		Error,
	},
	computed: {
	},
	methods: {
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
</style>