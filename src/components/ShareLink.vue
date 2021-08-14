<template>
	<button @click.prevent.stop='copy'>
		<div ref='popup' class='popup'>
			<div/>
			<p style="position: relative;">link copied!</p>
		</div>
		<i class='material-icons-round'>share</i>
	</button>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CopyText',
	setup() {
		const popup = ref(null);
		return {
			popup,
		};
	},
	props: {
		content: String,
	},
	methods: {
		copy() {
			const element = document.createElement('textarea');
			element.value = this.content;
			document.body.appendChild(element);
			element.select();
			document.execCommand('copy');
			document.body.removeChild(element);

			this.$refs.popup.style.display = 'block';
			setTimeout(() => this.$refs.popup.style.display = null, 5000);
		},
	},
}
</script>

<style scoped>
i {
	border-radius: var(--border-radius);
	padding: 0.25em;
	font-size: 1.5em;
	display: block;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
button {
	color: var(--subtle);
	background: #0000;
	position: relative;
}
button:hover i {
	color: var(--icolor);
	background: var(--bg2color);
}
.nested button:hover i {
	background: var(--bg1color);
}
.popup {
	display: none;
	position: absolute;
	pointer-events: none;
	color: var(--textcolor);
	transform: translateX(calc(-50% + 1.1em));
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
	border-bottom-right-radius: var(--border-radius);
	position: absolute;
	bottom: -0.65em;
	background: var(--bg2color);
	left: 50%;
	transform: translateX(-50%) rotate(45deg);
}
.popup p {
	position: relative;
	white-space: nowrap;
}
</style>
