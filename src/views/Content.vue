<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			I haven't gotten around to building a proper content policy yet, but here's the gist:
			<p style='margin-bottom: 0; padding-top: 25px'>
				pretty much everything is allowed with exception to the following:
				<ul>
					<li>NSFW underage content</li>
				</ul>
			</p>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'Content',
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
