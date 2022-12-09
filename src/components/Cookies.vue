<template>
	<div class='cookies' v-show='!cookiesAllowed'>
		<div>
			<p>This website uses cookies.</p>
			<p><a href='https://en.wikipedia.org/wiki/HTTP_cookie'>what are cookies?</a></p>
		</div>
		<button id='cookies' class='interactable' @click='cookiesAllowed=true'>coolio</button>
	</div>
</template>

<script>
import { getCookie } from '@/utilities'

export default {
	name: 'Cookies',
	data() {
		return {
			cookiesAllowed: this.$store.state.cookiesAllowed,
		}
	},
	watch: {
		cookiesAllowed(value) {
			this.$store.commit('cookiesAllowed', value);
		},
	},
}
</script>

<style scoped>
.cookies {
	position: fixed;
	left: 25px;
	bottom: 25px;
	background: var(--bg1color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: 25px;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	z-index: 1;
	display: flex;
}
.interactable {
	margin: 0 0 0 25px;
	display: inline-block;
}
.cookies a:link, .cookies a:visited {
	font-size: 0.8em;
	color: var(--subtle);
}
</style>
