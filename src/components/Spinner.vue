<template>
	<div class='_spinner'>
		<div class='_loader'>
			<div ref='loader'>
				<p></p>
				<div></div>
				<p></p>
			</div>
		</div>
		<svg viewBox='0 0 68 68' xmlns='http://www.w3.org/2000/svg'>
			<circle ref='spinner' class='path' cx='34' cy='34' r='30'></circle>
		</svg>
	</div>
</template>
<script setup lang='ts'>
import { abbreviateBytes } from '@/utilities';
import { ref, watch, type Ref } from 'vue';

const loader = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const spinner = ref<SVGCircleElement | null>(null) as Ref<SVGCircleElement>;

interface Props {
	loaded: number,
	total:  number,
}

const props = defineProps<Props>();

watch(props, (props: Props) => {
	if (props.loaded >= props.total) {
		spinner.value.style.strokeDasharray = "31";
		spinner.value.style.transition = "none";
	}
	else if (spinner.value.style.strokeDasharray) {
		spinner.value.style.strokeDasharray = "";
		spinner.value.style.transition = "";
	}
	const percent = props.loaded / props.total * 100;

	(loader.value.firstElementChild as HTMLParagraphElement).innerText = percent >= 99.95 ? "100%" : percent.toFixed(1) + "%";
	(loader.value.lastElementChild as HTMLParagraphElement).innerText = abbreviateBytes(props.loaded);
	spinner.value.style.strokeDashoffset = (186 - (props.loaded / props.total * 186)).toString();
});
</script>
<style scoped>
._spinner {
	position: relative;
	width: 5em;
	height: 5em;
}
._loader {
	display: flex;
	pointer-events: none;
	position: absolute;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
	text-align: center;
	background: var(--screen-cover);
	border-radius: 50%;
}

._loader > div > div {
	border-top: var(--border-size) solid var(--subtle)
}

._spinner svg {
	pointer-events: none;
	animation: rotator 2s linear infinite;
	width: 100%;
	height: 100%;
}

@keyframes rotator {
	0%   { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.path {
	fill: none;
	stroke-width: 4;
	stroke-linecap: round;
	stroke-dasharray: 187;
	stroke-dashoffset: 186;
	transform-origin: center;
	stroke: var(--interact);
	-webkit-transition: var(--transition) 0.5s;
	-moz-transition: var(--transition) 0.5s;
	-o-transition: var(--transition) 0.5s;
	transition: var(--transition) 0.5s;
}
</style>
