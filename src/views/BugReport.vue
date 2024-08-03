<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			<p>this is where you would normally go to report a bug</p>
			<p>link to the <a href='https://rich-braid-6ee.notion.site/d111b02628a24e4695520df7a04828fe?v=0f7bcca871f84e34a37964cd7bc86c5e'>Bug Tracker</a></p>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import ThemeMenu from '@/components/ThemeMenu.vue';
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
p a, p a:link, p a:visited {
	text-decoration: underline;
	text-decoration-style: dotted;
}
</style>