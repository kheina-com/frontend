<template>
	<button :class='buttonClass' @click='openLink' v-if='link'><slot/></button>
	<router-link :class='buttonClass' :to='href' v-else-if='href'><slot/></router-link>
	<button :class='buttonClass' v-else><slot/></button>
</template>

<script>
export default {
	name: 'Button',
	props: {
		link: {
			type: String,
			default: null,
		},
		href: {
			type: String,
			default: null,
		},
		red: {
			type: Boolean,
			default: false,
		},
		yellow: {
			type: Boolean,
			default: false,
		},
		green: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		buttonClass() {
			const buttonClass = 'interactable button';
			if (this.red)
			{ return buttonClass + ' red'; }
			else if (this.yellow)
			{ return buttonClass + ' yellow'; }
			else if (this.green)
			{ return buttonClass + ' green'; }
			else
			{ return buttonClass; }
		},
	},
	methods: {
		openLink() {
			this.$router.push(this.link);
		},
	},
}
</script>

<style scoped>
a, button {
	display: flex;
	align-items: center;
}
.green:hover {
	color: var(--valid);
	border-color: var(--valid);
}
.yellow:hover {
	color: var(--warning);
	border-color: var(--warning);
}
.red:hover {
	color: var(--error);
	border-color: var(--error);
}
.inline {
	border-radius: 3px;
	padding: 0.1em 0.25em !important;
	margin: -0.1em -0.25em !important;
}
.inline:hover {
	color: var(--icolor);
	background: var(--bg1color);
}
</style>

<style>
.button.interactable i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
/* button.interactable > :last-child {
	margin-right: 0;
}
button.interactable > :first-child {
	margin-left: 0;
} */
</style>