<template>
	<button @click.prevent.stop='copy'>
		<div ref='popup' class='popup'>
			<div/>
			<p style="position: relative;">link copied!</p>
		</div>
		<i class='material-icons-round'>share</i>
	</button>
</template>

<script setup lang="ts">
import { environment } from '@/config/constants';
import { ref, type Ref } from 'vue';

const popup = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
let t: number | null = null;
const props = defineProps<{ content: string}>();
function copy() {
	const root = environment === "prod" ? "https://fuzz.ly" : "https://dev.fuzz.ly";
	const value = root + props.content;

	navigator.clipboard.writeText(value)
	.catch(() => {
		const element = document.createElement("textarea");
		element.value = value;
		document.body.appendChild(element);
		element.select();
		document.execCommand("copy");
		document.body.removeChild(element);
	}).then(() => {
		popup.value.style.display = "block";
		if (t) clearTimeout(t);
		t = setTimeout(() => { t = null; popup.value.style.display = "" }, 5000);
	});
}
</script>

<style scoped>
i {
	border-radius: var(--border-radius);
	padding: 0.25em;
	font-size: 1.5em;
	display: block;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
button {
	color: var(--subtle);
	background: #0000;
	position: relative;
}
button:hover i {
	color: var(--interact);
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
	bottom: -0.67em;
	background: var(--bg2color);
	left: 50%;
	transform: translateX(-50%) rotate(45deg);
}
.popup p {
	position: relative;
	white-space: nowrap;
}
</style>
