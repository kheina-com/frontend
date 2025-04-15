<template>
	<canvas :id='id' :title='props.content'/>
</template>
<script setup lang='ts'>
import { onMounted, watch } from 'vue';
import qrcode from 'qrcode-generator';

const props = withDefaults(defineProps<{
	content?: string,
	width?:   number | string,
	height?:  number | string,
	level?:   "L" | "M" | "Q" | "H",
}>(), {
	width:  "20em",
	height: "20em",
	level:  "L",
});

const mdMaxId = 0xffffffff;
const mdRefId = () => Math.round(Math.random() * mdMaxId).toString(16).padStart(8, "0");
const id      = mdRefId();
const scale   = 3;

function drawQR() {
	if (!props.content) return;
	const qr = qrcode(0, props.level);
	qr.addData(props.content);
	qr.make();

	const canvas = document.getElementById(id);
	if (!canvas || !(canvas instanceof HTMLCanvasElement) || !canvas.getContext) return;

	const width = (() => {
		if (typeof props.width === "number") return props.width;
		const parentStyle = getComputedStyle((canvas.parentElement as HTMLElement));
		if (props.width.endsWith("em")) return parseFloat(props.width) * parseFloat(parentStyle.fontSize);
		if (props.width.endsWith("%")) return parseFloat(props.width) * parseFloat(parentStyle.width);
		return parseFloat(props.width);
	})();
	const height = (() => {
		if (typeof props.height === "number") return props.height;
		const parentStyle = getComputedStyle((canvas.parentElement as HTMLElement));
		if (props.height.endsWith("em")) return parseFloat(props.height) * parseFloat(parentStyle.fontSize);
		if (props.height.endsWith("%")) return parseFloat(props.height) * parseFloat(parentStyle.height);
		return parseFloat(props.height);
	})();

	canvas.style.width = typeof props.width === "number" ? props.width.toString() + "px" : props.width;
	canvas.style.height = typeof props.height === "number" ? props.height.toString() + "px" : props.height;
	canvas.width = width * scale;
	canvas.height = height * scale;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const textcolor = getComputedStyle(document.documentElement).getPropertyValue("--textcolor");
	ctx.fillStyle = textcolor;

	const modules   = qr.getModuleCount();
	const size      = Math.min(canvas.width, canvas.height);
	const spacing   = size / modules;
	const radius    = spacing / 3;

	for (let x = 0; x < modules; x++) {
		for (let y = 0; y < modules; y++) {
			if (x < 8 && y < 8)            continue;
			if (x >= modules - 8 && y < 8) continue;
			if (x < 8 && y >= modules - 8) continue;
			const dark = qr.isDark(x, y);

			if (dark) {
				ctx.beginPath();
				ctx.arc(x * spacing + spacing / 2, y * spacing + spacing / 2, radius, 0, Math.PI * 2, true);
				ctx.fill();
				ctx.closePath();
			}
		}
	}

	// anchor = (x: number, y: number)  => {
	// 	ctx.beginPath();

	// 	// outer
	// 	ctx.arc((x + 1) * spacing + spacing / 2, (y + 1) * spacing + spacing / 2, radius * 4, Math.PI,       Math.PI * 1.5, false);
	// 	ctx.arc((x + 5) * spacing + spacing / 2, (y + 1) * spacing + spacing / 2, radius * 4, Math.PI * 1.5, 0,             false);
	// 	ctx.arc((x + 5) * spacing + spacing / 2, (y + 5) * spacing + spacing / 2, radius * 4, 0,             Math.PI / 2,   false);
	// 	ctx.arc((x + 1) * spacing + spacing / 2, (y + 5) * spacing + spacing / 2, radius * 4, Math.PI / 2,   Math.PI,       false);

	// 	ctx.lineTo(x * spacing + radius / 2,   (y + 1) * spacing + spacing / 2);

	// 	// inner
	// 	ctx.lineTo(x * spacing + radius * 2.5, (y + 1) * spacing + spacing / 2);
	// 	ctx.arc((x + 1) * spacing + spacing / 2, (y + 5) * spacing + spacing / 2, radius * 2, Math.PI,       Math.PI / 2,   true);
	// 	ctx.arc((x + 5) * spacing + spacing / 2, (y + 5) * spacing + spacing / 2, radius * 2, Math.PI / 2,   0,             true);
	// 	ctx.arc((x + 5) * spacing + spacing / 2, (y + 1) * spacing + spacing / 2, radius * 2, 0,             Math.PI * 1.5, true);
	// 	ctx.arc((x + 1) * spacing + spacing / 2, (y + 1) * spacing + spacing / 2, radius * 2, Math.PI * 1.5, Math.PI,       true);

	// 	ctx.fillStyle = textcolor;
	// 	ctx.fill();
	// 	// ctx.stroke();
	// 	ctx.closePath();

	// 	// inner square
	// 	ctx.beginPath();
	// 	ctx.arc((x + 2) * spacing + spacing / 2, (y + 4) * spacing + spacing / 2, radius, Math.PI,       Math.PI / 2,   true);
	// 	ctx.arc((x + 4) * spacing + spacing / 2, (y + 4) * spacing + spacing / 2, radius, Math.PI / 2,   0,             true);
	// 	ctx.arc((x + 4) * spacing + spacing / 2, (y + 2) * spacing + spacing / 2, radius, 0,             Math.PI * 1.5, true);
	// 	ctx.arc((x + 2) * spacing + spacing / 2, (y + 2) * spacing + spacing / 2, radius, Math.PI * 1.5, Math.PI,       true);

	// 	ctx.fillStyle = textcolor;
	// 	ctx.fill();
	// 	// ctx.stroke();
	// 	ctx.closePath();
	// }

	const anchor = (x: number, y: number)  => {
		ctx.beginPath();

		// outer
		ctx.arc((x +  5 / 6) * spacing + spacing / 2, (y +  5 / 6) * spacing + spacing / 2, radius * 4, Math.PI,       Math.PI * 1.5, false);
		ctx.arc((x + 31 / 6) * spacing + spacing / 2, (y +  5 / 6) * spacing + spacing / 2, radius * 4, Math.PI * 1.5, 0,             false);
		ctx.arc((x + 31 / 6) * spacing + spacing / 2, (y + 31 / 6) * spacing + spacing / 2, radius * 4, 0,             Math.PI / 2,   false);
		ctx.arc((x +  5 / 6) * spacing + spacing / 2, (y + 31 / 6) * spacing + spacing / 2, radius * 4, Math.PI / 2,   Math.PI,       false);

		ctx.lineTo((x - 1 / 6) * spacing + radius / 2,   (y + 5 / 6) * spacing + spacing / 2);

		// // inner
		// ctx.lineTo(x * spacing + radius * 2.5, (y + 1) * spacing + spacing / 2);
		// ctx.arc((x + 1) * spacing + spacing / 2, (y + 5) * spacing + spacing / 2, radius * 2, Math.PI,       Math.PI / 2,   true);
		// ctx.arc((x + 5) * spacing + spacing / 2, (y + 5) * spacing + spacing / 2, radius * 2, Math.PI / 2,   0,             true);
		// ctx.arc((x + 5) * spacing + spacing / 2, (y + 1) * spacing + spacing / 2, radius * 2, 0,             Math.PI * 1.5, true);
		// ctx.arc((x + 1) * spacing + spacing / 2, (y + 1) * spacing + spacing / 2, radius * 2, Math.PI * 1.5, Math.PI,       true);

		// inner
		ctx.lineTo((x +  1 / 6) * spacing + radius * 2.5, (y + 1)      * spacing + spacing / 2);
		ctx.arc(   (x +  7 / 6) * spacing + spacing / 2,  (y + 29 / 6) * spacing + spacing / 2, radius * 2, Math.PI,       Math.PI / 2,   true);
		ctx.arc(   (x + 29 / 6) * spacing + spacing / 2,  (y + 29 / 6) * spacing + spacing / 2, radius * 2, Math.PI / 2,   0,             true);
		ctx.arc(   (x + 29 / 6) * spacing + spacing / 2,  (y +  7 / 6) * spacing + spacing / 2, radius * 2, 0,             Math.PI * 1.5, true);
		ctx.arc(   (x +  7 / 6) * spacing + spacing / 2,  (y +  7 / 6) * spacing + spacing / 2, radius * 2, Math.PI * 1.5, Math.PI,       true);

		ctx.fillStyle = textcolor;
		ctx.fill();
		// ctx.stroke();
		ctx.closePath();

		// inner square
		ctx.beginPath();
		ctx.arc((x + 2) * spacing + spacing / 2, (y + 4) * spacing + spacing / 2, radius, Math.PI,       Math.PI / 2,   true);
		ctx.arc((x + 4) * spacing + spacing / 2, (y + 4) * spacing + spacing / 2, radius, Math.PI / 2,   0,             true);
		ctx.arc((x + 4) * spacing + spacing / 2, (y + 2) * spacing + spacing / 2, radius, 0,             Math.PI * 1.5, true);
		ctx.arc((x + 2) * spacing + spacing / 2, (y + 2) * spacing + spacing / 2, radius, Math.PI * 1.5, Math.PI,       true);

		ctx.fillStyle = textcolor;
		ctx.fill();
		// ctx.stroke();
		ctx.closePath();
	}

	anchor(0,           0);
	anchor(modules - 7, 0);
	anchor(0, modules - 7);
}

onMounted(drawQR);

watch(props, drawQR);
</script>
<style scoped>
canvas {
	display: block;
	margin: var(--margin) auto;
}
</style>
