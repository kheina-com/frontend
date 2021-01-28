<template>
	<div class='cookies' v-show='displayWindow'>
		<span>This website uses cookies.</span>
		<a id='cookies' class='interactable' @click='goAway'>coolio</a>
	</div>
</template>

<script>
import {setCookie, getCookie} from '../utilities'

export default {
	name: 'Cookies',
	data() {
		return {
			displayWindow: false,
		}
	},
	mounted() {
		this.displayWindow = getCookie('cookies') ? false : true;
	},
	methods: {
		goAway() {
			setCookie('cookies', true);
			this.displayWindow = false;
		},
	},
}
</script>

<style scoped>
div.cookies
{
	position: fixed;
	left: 25px;
	bottom: 25px;
	background: var(--bgcolor);
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	padding: 25px;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
div.cookies .interactable
{
	margin: 0 0 0 25px;
	display: inline-block;
}
</style>
