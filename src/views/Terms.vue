<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			I haven't gotten around to building a proper terms of service yet, but it's pretty much summed up by the privacy and content policies:
			<p style='margin-bottom: 0; padding-top: 25px'>
				<router-link to='/privacy'>Privacy Policy</router-link> <router-link to='/content'>Content Policy</router-link>
			</p>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'Terms',
	components: {
		ThemeMenu,
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
