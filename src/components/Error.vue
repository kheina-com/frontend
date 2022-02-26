<template>
	<main class='error' v-if='isError'>
		<Title static='center'>Error</Title>
		<Subtitle style='margin: 0 0 25px' static='center'>If you think this may have been an issue with the website, <a href='https://gitlab.com/kheina/kheina.com/issues' target='_blank'>please report it here</a>.</Subtitle>
		<p class='message'>Hmmm, looks like something went wrong.</p>
		<div class='top'>
			<pre class='message'>{{message}}</pre>
		</div>
		<div v-if='dump'>
			<p class='message'>If you submit a bug report, please include the data below.</p>
			<CopyText :content='dump'/>
		</div>
		<div style='display: flex; justify-content: center'>
			<router-link :to='`/`' class='interactable'>Home</router-link>
		</div>
		<ThemeMenu/>
	</main>
	<slot v-else/>
</template>

<script>
import Subtitle from '@/components/Subtitle.vue';
import Title from '@/components/Title.vue';
import CopyText from '@/components/CopyText.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'ProgressBar',
	components: {
		Subtitle,
		Title,
		CopyText,
		ThemeMenu,
	},
	props: {
		message: String,
		dump: {
			type: Object,
			default: null,
		},
	},
	computed: {
		isError() {
			return Boolean(this.message);
		},
	},
}
</script>

<style scoped>
main.error {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
	overflow: hidden;
	display: block;
}
.top
{
	width: 800px;
	max-width: calc(100% - 50px);
	margin: 0 auto;
	position: relative;
	padding: 0;
}

p.message
{
	text-align: center;
	width: 100%;
	margin: 0 0 8px;
	padding: 0;
	padding: 0;
}
pre.message
{
	display: block;
	padding: 8px 16px;
	background: var(--bg2color);
	margin: 0 0 25px;
	line-height: 2em;
	white-space: pre-wrap;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
button {
	margin-right: 25px;
}
</style>
