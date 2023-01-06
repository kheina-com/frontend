<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Mod Queue</Title>
		<div class='container' v-if='$store.state.auth?.isMod'>
			<div class='icon'>
				<i class='material-icons'>verified_user</i> You are a mod!
			</div>
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
	name: 'ModQueue',
	components: {
		ThemeMenu,
		Title,
	},
}
</script>

<style scoped>
main {
	background: var(--main);
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
}
.container {
	margin: 25px auto 0;
	text-align: center;
}
</style>
