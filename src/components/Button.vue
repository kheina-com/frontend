<template>
	<router-link :class='buttonClass' :to='href' v-if='href'><slot/></router-link>
	<button :class='buttonClass' v-else><slot/></button>
</template>

<script>
export default {
	name: 'Button',
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
			let buttonClass = 'interactable';
			if (!this.nested)
			{ buttonClass += ' unnested'; }
			if (this.isLoading)
			{ buttonClass += ' loading stripes'; }
			if (this.red)
			{ return buttonClass + ' red'; }
			else if (this.yellow)
			{ return buttonClass + ' yellow'; }
			else if (this.green)
			{ return buttonClass + ' green'; }
			return buttonClass;
		},
	},
}
</script>

<style scoped>
button {
	background: var(--bg2color);
}
button.unnested.interactable, button.unnested {
	background: var(--bg1color);
}
button.loading {
	pointer-events: none;
}

button:deep(i:first-child) {
	margin-right: 0.25em;
	font-size: 1.2em;
}
button:deep(i:last-child) {
	margin-left: 0.25em;
	font-size: 1.2em;
}
button:deep(i:only-child) {
	margin: 0;
}

a, button {
	display: flex;
	align-items: center;
	padding: 0.5em 1em;
	white-space: nowrap;
	/* word-break: break-word; */
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
}
</style>
