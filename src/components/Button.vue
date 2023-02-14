<template>
	<router-link :class='buttonClass' :to='href' v-if='href'><slot/></router-link>
	<button :class='buttonClass' v-else><Loading :isLoading='isLoading' :nested='!unnested' type='stripes' span><slot/></Loading></button>
</template>

<script>
import Loading from '@/components/Loading.vue';

export default {
	name: 'Button',
	components: {
		Loading,
	},
	props: {
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
		nested: {
			type: Boolean,
			default: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		buttonClass() {
			let buttonClass = 'interactable button';
			if (!this.nested)
			{ buttonClass += ' unnested'; }
			if (this.isLoading)
			{ buttonClass += ' loading'; }
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
a, button, button > span {
	display: flex;
	align-items: center;
	padding: 0.5em 1em;
	overflow: hidden;
	white-space: pre-wrap;
	word-break: break-word;
}
button > span {
	margin: -0.5em -1em;
	border-radius: 0;
}
button > span.loading {
	border-radius: 0;
}
button.loading {
	pointer-events: none;
}
.button.unnested.interactable, .button.unnested {
	background: var(--bg1color);
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
	border-radius: var(--border-radius);
	padding: 0.1em 0.25em !important;
	margin: -0.1em -0.25em !important;
}
.inline:hover {
	color: var(--interact);
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