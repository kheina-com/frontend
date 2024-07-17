<template>
	<div class='spinner'>
		<div class='loader'>
			<div ref='loader'>
				<p></p>
				<div style='border-top: var(--border-size) solid var(--subtle)'></div>
				<p></p>
			</div>
		</div>
		<svg width='100%' height='100%' viewBox='0 0 68 68' xmlns='http://www.w3.org/2000/svg'>
			<circle ref='spinner' class='path' fill='none' stroke-width='4' stroke-linecap='round' cx='34' cy='34' r='30'></circle>
		</svg>
	</div>
</template>
<script lang='ts'>
import { defineComponent, ref } from 'vue';

function abbreviate(value) {
	// const e3 = Math.log(value) * Math.LOG10E / 3 | 0;

	// more concise but slower (I think)
	// const abr = ['B', 'KB', 'MB', 'GB', 'TB'];
	// if (value >= 9995 * 10 ** (e3 * 3 - 1)) {
	// 	return `${Math.round(value / (10 ** ((e3 + 1) * 3)))}${abr[e3 + 1]}`;
	// }
	// if (value >= 995 * 10 ** (e3 * 3 - 2)) {
	// 	return `${Math.round(value / (10 ** (e3 * 3)))}${abr[e3]}`;
	// }
	// return `${(value / (10 ** (e3 * 3))).toFixed(1)}${abr[e3]}`;

	switch (Math.log(value) * Math.LOG10E | 0) {
		case 0:
		case 1:
		case 2:
			return `${value}B`;
		case 3:
			if (value < 9950)
			{ return `${(value / 1e3).toFixed(1)}KB`; }
			return `${Math.round(value / 1e3)}KB`; // necessary to avoid double check
		case 5:
			if (value >= 9995e2)
			{ return `${(value / 1e6).toFixed(1)}MB`; }
		case 4:
			return `${Math.round(value / 1e3)}KB`;
		case 6:
			if (value < 995e4)
			{ return `${(value / 1e6).toFixed(1)}MB`; }
			return `${Math.round(value / 1e6)}MB`; // necessary to avoid double check
		case 8:
			if (value >= 9995e5)
			{ return `${(value / 1e9).toFixed(1)}GB`; }
		case 7:
			return `${Math.round(value / 1e6)}MB`;
		case 9:
			if (value < 995e7)
			{ return `${(value / 1e9).toFixed(1)}GB`; }
		default:
			return `${Math.round(value / 1e9)}GB`;
	}
}

export default defineComponent({
	name: 'Spinner',
	setup() {
		const loader = ref(null);
		const spinner = ref(null);
		return {
			loader,
			spinner,
		};
	},
	props: {
		loaded: Number,
		total: Number,
	},
	watch: {
		loaded(value) {
			const percent = value / this.total * 100;
			this.$refs.loader.firstElementChild.innerText = percent >= 99.95 ? "100%" : percent.toFixed(1) + "%";
			this.$refs.loader.lastElementChild.innerText = abbreviate(value);
			this.$refs.spinner.style.strokeDashoffset = 186 - (value / this.total * 186);
		},
	},
})
</script>
<style scoped>
.spinner {
	position: relative;
	width: 5em;
	height: 5em;
}
.loader {
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

/* .loader div {
	background: var(--screen-cover);
	padding: 0.5em;
	border-radius: var(--border-radius);
} */

.spinner svg {
	pointer-events: none;
	--offset: 187;
	--duration: 1.5s;
	animation: rotator var(--duration) linear infinite;
}

@keyframes rotator {
	0%   { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.path {
	stroke-dasharray: var(--offset);
	stroke-dashoffset: 186;
	transform-origin: center;
	stroke: var(--interact);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
</style>