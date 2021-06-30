<template>
	<div class='cookies' v-if='displayWindow'>
		<span>This website uses cookies.</span>
		<button id='cookies' class='interactable' @click='goAway'>coolio</button>
	</div>
</template>

<script>
import {setCookie, getCookie} from '@/utilities'

export default {
	name: 'Cookies',
	data() {
		return {
			displayWindow: false,
		}
	},
	mounted() {
		this.displayWindow = !getCookie('cookies');
	},
	methods: {
		goAway() {
			setCookie('cookies', true, 31536000);
			this.displayWindow = false;
		},
	},
}
</script>

<style scoped>
.cookies
{
	position: fixed;
	left: 25px;
	bottom: 25px;
	background: var(--bg1color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: 25px;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	z-index: 1;
}
.cookies .interactable
{
	margin: 0 0 0 25px;
	display: inline-block;
}
</style>
