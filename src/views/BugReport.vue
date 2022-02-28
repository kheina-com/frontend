<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			this is where you would normally go to report a bug
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'BugReport',
	components: {
		ThemeMenu,
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