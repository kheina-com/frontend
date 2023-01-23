<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			I haven't gotten around to building a proper content policy yet, but here's the gist:
			<p style='margin-bottom: 0; padding-top: 25px'>
				pretty much everything is allowed with exception to the following:
				<ul>
					<li>NSFW underage content</li>
					<li>EXPLICIT real-world content</li>
					<p>This does not include the following content</p>
					<ul>
						<li>photographs of depicting nudity or genitals, so long as genitals are not the main focus (i.e. post must be tagged 'mature', not 'explicit')</li>
						<li>photographs of paintings or artwork containing NSFW content</li>
						<li>photographs of statues depicting NSFW content</li>
					</ul>
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
	background: var(--main);
	position: relative;
	padding: 25px;
}
</style>
