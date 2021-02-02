<template>
	<footer class='footer'>
		<!-- <div id='progress'>
			<ProgressBar fillColor='#FAAF3A' textColor='#000000' :fill='furAffinityPercent' link='https://www.furaffinity.net/'>Fur Affinity</ProgressBar>
			<ProgressBar fillColor='#2E76B4' textColor='#000000' :fill='furryNetworkPercent' link='https://furrynetwork.com/'>Furry Network</ProgressBar>
		</div> -->
		<ThemeButton />
		<div class='anchor'>
			<a href='https://www.patreon.com/kheina' target='_blank' class='left'><img src='/static/patreon-logo.svg'> support the project</a>
			<a href='https://gitlab.com/kheina.com' target='_blank' class='right'>view source code <img src='/static/gitlab-logo.svg'></a>
		</div>
		<p style='text-align: center'>Found a bug? <a href='https://gitlab.com/groups/kheina.com/-/issues' target='_blank'>Report it here</a>.</p>		
	</footer>
</template>

<script>
import ThemeButton from './ThemeButton.vue'
import ProgressBar from './ProgressBar.vue'

export default {
	name: 'Footer',
	props: {
		content: String,
		stats: null,
	},
	components: {
		ThemeButton,
		ProgressBar,
	},
	computed: {
		furAffinityPercent() {
			if (this.stats && this.stats.hasOwnProperty('fan') && this.stats.hasOwnProperty('fao'))
			{ return (this.stats.fan - this.stats.fao) * 100 / this.stats.fan; }
			return NaN;
		},
		furryNetworkPercent() {
			if (this.stats && this.stats.hasOwnProperty('fnn') && this.stats.hasOwnProperty('fno'))
			{ return (this.stats.fnn - this.stats.fno) * 100 / this.stats.fnn; }
			return NaN;
		},
	},
}
</script>

<style scoped>
.footer span
{
	cursor: pointer;
	pointer-events: all;
	text-decoration: none;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}

.footer
{
	width: 100%;
	min-height: 1.5em;
	margin: 4px 0 0;
	font-size: 0.9rem;
	white-space: nowrap;
	text-align: center;
}
.footer .anchor
{
	/*bottom: 4px;*/
	left: 50%;
	left: calc(50% - 0.5px);
	position: relative;
	height: 1.2em;
	width: 1px;
	background: var(--textcolor);
}
.footer .anchor img, .header img
{
	height: 1em;
	margin-bottom: -0.2em;
}
.footer .anchor a
{ text-shadow: 0 0.125em 0.1875em var(--shadowcolor); }
.footer .anchor a:hover
{ text-shadow: 0 0 0.625em var(--activeshadowcolor); }
.footer .anchor .left
{
	position: absolute;
	right: 8px;
}
.footer .anchor .right
{
	position: absolute;
	left: 8px;
}

</style>
