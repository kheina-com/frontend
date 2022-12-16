<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Moderate Content</Title>
		<div class='container' v-if='$store.state.auth?.isMod'>
			<div class='icon'>
				<i class='material-icons'>verified_user</i> You are a mod!
			</div>
			<pre>{{JSON.stringify($route.query, null, 4)}}</pre>
		</div>
		<div class='container' v-else>
			<div class='icon'>
				<i class='material-icons'>remove_moderator</i> You cannot access this content without being a moderator
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';

export default {
	name: 'Moderate',
	components: {
		ThemeMenu,
		Title,
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	margin: 25px auto;
}
.container {
}
pre {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
	width: 70vw;
	margin: auto;
}
pre code {
	padding: 0;
}
</style>
