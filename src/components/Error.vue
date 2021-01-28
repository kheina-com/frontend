<template>
	<Title static>Error</Title>
	<Subtitle style='margin: 0 0 25px' static>If you think this may have been an issue with the website, <a href='https://gitlab.com/kheina/kheina.com/issues' target='_blank'>please report it here</a>.</Subtitle>
	<p class='message'>Hmmm, looks like something went wrong.</p>
	<div class='top'>
		<pre class='message'>{{error ? error + '\n' : ''}}{{message}}</pre>
	</div>
	<div v-if='dump'>
		<p class='message'>If you submit a bug report, please include the data below.</p>
		<CopyText :content='dump' />
	</div>
	<router-link :to='`/`' class='interactable centerx'>home</router-link>
</template>
<script>
import Subtitle from './Subtitle.vue'
import Title from './Title.vue'
import CopyText from './CopyText.vue'

export default {
	name: 'ProgressBar',
	components: {
		Subtitle,
		Title,
		CopyText,
	},
	props: {
		message: String,
		error: {
			type: String,
			default: null,
		},
		dump: {
			type: Object,
			default: null,
		},
	},
}
</script>

<style scoped>

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
	background: var(--boxcolor);
	margin: 0 0 25px;
	line-height: 2em;
	white-space: pre-wrap;
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
@media screen and (max-width:90rem)
{
	p.message
	{ padding: 0; }
}

</style>
