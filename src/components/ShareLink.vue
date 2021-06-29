<template>
	<button @click.prevent.stop='copy'>
		<div ref='popup' class='popup'>
			<div/>
			<p style="position: relative;">link copied!</p>
		</div>
		<i class='material-icons-round'>share</i>
	</button>
	<input ref='text' :value='content'>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CopyText',
	setup() {
		const text = ref(null);
		const popup = ref(null);
		return {
			text,
			popup,
		};
	},
	props: {
		content: String,
	},
	methods: {
		copy() {
			this.$refs.text.select();
			document.execCommand('copy');

			this.$refs.popup.style.display = 'block';
			setTimeout(() => this.$refs.popup.style.display = null, 5000);
		},
	},
}
</script>

<style scoped>
i {
	font-size: 1.5em;
	display: block;
}
button {
	padding: 0.25em;
	color: var(--subtle);
	background: #0000;
	border-radius: var(--border-radius);
	position: relative;
}
button:hover {
	color: var(--icolor);
	background: var(--bg2color);
}
input {
	position: absolute;
	opacity: 0;
	pointer-events: none;
	left: -100vh;
	width: 0;
	height: 0;
}
.popup {
	display: none;
	position: absolute;
	pointer-events: none;
	color: var(--textcolor);
	transform: translateX(calc(-50% + 0.75em));
	bottom: 150%;
	background: var(--bg2color);
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
}
.popup div {
	border-bottom: var(--border-size) solid var(--bordercolor);
	border-right: var(--border-size) solid var(--bordercolor);
	width: 1.2em;
	height: 1.2em;
	border-radius: var(--border-radius);
	position: absolute;
	bottom: -0.6em;
	background: var(--bg2color);
	left: 50%;
	transform: translateX(-50%) rotate(45deg);
}
p {
	position: relative;
	white-space: nowrap;
}
</style>
