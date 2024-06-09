<template>
	<div class='content' ref='main' v-show='content'>
		<span></span>
		<a role='button' @click='copy'><i class='material-icons'>content_copy</i></a>
		<div ref='popup' class='popup'>
			<div/>
			<p style='position: relative'>copied!</p>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CopyText',
	setup() {
		const main = ref(null);
		const popup = ref(null);
		return {
			main,
			popup,
		};
	},
	props: {
		content: Object,
		inline: {
			type: Boolean,
			default: false,
		},
	},
	mounted() {
		this.$refs.main.firstElementChild.innerText = this.copyValue;
		if (this.inline) {
			this.$refs.main.classList.add('inline');
		}
		else {
			this.$refs.main.classList.add('block');
		}
	},
	computed: {
		copyValue() {
			if (this.content instanceof Error) {
				return JSON.stringify({ 'error': this.content.toString(), 'stacktrace': this.content.stack.split('\n').filter(x => x) });
			}
			if (this.content instanceof Object) {
				return JSON.stringify(this.content);
			}
			return this.content;
		},
	},
	methods: {
		copy() {
			navigator.clipboard.writeText(this.copyValue)
			// don't even bother supporting old shit anymore
			.then(() => {
				this.$refs.popup.style.display = 'block';
				if (this.t) {
					clearTimeout(this.t);
				}
				this.t = setTimeout(() => { this.$refs.popup.style.display = this.t = null }, 5000);
			});
		},
	},
}
</script>

<style scoped>
i {
	font-size: inherit;
}
a {
	font-size: 1.2em;
}

.content {
	position: relative;
	font-size: 0.9em;
	color: var(--textolor);
	background: var(--bg1color);
	white-space: pre-wrap;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.block.content {
	/* margin: 0 auto var(--margin); */
	width: 400px;
}
.inline.content {
	display: inline-block;
	padding: 0 0.3em;
}

.block {
	span {
		width: 100%;
		width: calc(100% - 16px);
		padding: 0.5em;
		white-space: nowrap;
		overflow: hidden;
		display: block;
	}
	a {
		position: absolute;
		right: 0;
		top: 0;
		background: linear-gradient(to right, #0000 0, var(--bg1color) 50%);
		padding: 0.4em 0.4em 0.4em 1.5em;
		height: 1em;
	}
}

.inline {
	span {
		padding: 0.2em;
	}
	a {
		position: relative;
		top: 0.2em;
		margin-left: 0.5em;
	}
}

span {
	display: inline-block;
}

.popup {
	display: none;
	position: absolute;
	pointer-events: none;
	color: var(--textcolor);
	bottom: 150%;
	bottom: calc(100% + 1.2em);
	right: -1.4em;
	background: var(--bg1color);
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
}
.popup div {
	border-bottom: var(--border-size) solid var(--bordercolor);
	border-right: var(--border-size) solid var(--bordercolor);
	width: 1.2em;
	height: 1.2em;
	border-bottom-right-radius: var(--border-radius);
	position: absolute;
	bottom: -0.67em;
	background: var(--bg1color);
	left: 50%;
	transform: translateX(-50%) rotate(45deg);
}
.popup p {
	position: relative;
	white-space: nowrap;
}
</style>
