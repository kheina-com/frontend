<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			I haven't gotten around to building a proper terms of service yet, but it's pretty much summed up by the privacy and content policies:
			<p style='margin-bottom: 0; padding-top: var(--margin)'>
				<router-link to='/priv'>Privacy Policy</router-link> <router-link to='/con'>Content Policy</router-link>
			</p>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import ThemeMenu from '@/components/ThemeMenu.vue';
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
</style>
