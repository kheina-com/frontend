<template>
	<DivLink class='progressbar' :style='barColors' :link='link' :newTab='newTab'>
		<span :style='spanFill'>
			<div>{{target ? target : (fill * 100).toFixed(2) + '%'}}</div>
		</span>
		<p :class='pClass'><slot/></p>
	</DivLink>
</template>

<script>
import DivLink from '@/components/DivLink.vue';

export default {
	name: 'ProgressBar',
	components: {
		DivLink,
	},
	props: {
		fill: Number,
		target: {
			type: String,
			default: null
		},
		textColor: {
			type: String,
			default: null
		},
		fillColor: {
			type: String,
			default: null
		},
		link: {
			type: String,
			default: null,
		},
		newTab: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		spanFill() {
			return 'width:' + (this.fill * 100).toString() + '%;';
		},
		pClass() {
			if (this.fill >= 1)
			{ return 'center'; }
			else if (this.fill > 0.5)
			{ return 'left'; }
			else
			{ return 'right'; }
		},
		barColors() {
			return (this.textColor ? ('--bartextcolor:' + this.textColor + ';') : '') + (this.fillColor ? ('--barfillcolor:' + this.fillColor + ';') : '');
		},
	},
}
</script>

<style scoped>
.progressbar
{
	--barfillcolor: var(--interact);
	--bartextcolor: var(--textcolor);
	display: block;
	position: relative;
	width: 100%;
	height: 1.1em;
	border: var(--border-size) solid var(--bordercolor);
	background: var(--bg2color);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	border-radius: var(--border-radius);
	overflow: hidden;
	margin: 8px auto 6px;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.progressbar span
{
	position: absolute;
	left: 0;
	height: 100%;
	color: var(--bartextcolor);
	text-align: right;
	font-weight: bold;
	padding-right: 4px;
	box-sizing: border-box;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.progressbar p
{
	position: absolute;
	font-style: italic;
	bottom: 1px;
	font-size: 0.85em;
	color: var(--subtle);
}
.progressbar p.left
{
	text-align: left;
	left: 4px;
}
.progressbar p.right
{
	text-align: right;
	right: 4px;
}
.progressbar p.center
{
	text-align: center;
	width: 100%;
}
.progressbar span
{
	text-shadow: 0 0 4px var(--barfillcolor);
	background: linear-gradient(to right, #0000, var(--barfillcolor));
}

a.progressbar:hover
{
	border-color: var(--borderhover);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
a.progressbar:hover *
{ opacity: 0.5; }
</style>
