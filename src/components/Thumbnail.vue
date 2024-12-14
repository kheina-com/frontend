<template>
	<div class='thumbnail loading wave'>
		<div class='thumbhash loader'></div>
		<img ref='media' :data-src='src' @load='loaded' @error='onError'>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { base64ToBytes, getMediaThumbnailUrl, lazyObserver } from '@/utilities';
import { isMobile } from '@/config/constants';
import { thumbHashToDataURL } from 'thumbhash';
import lightnoise from '$/lightnoise.png?url';

const props = withDefaults(defineProps<{
	post?:      string | null,
	crc?:       number | null,
	size?:      number,
	width?:     number,
	height?:    number,
	maxWidth?:  number | null,
	thumbhash?: string | null,
	load?:      boolean,
}>(), {
	post: null,
	crc: null,
	size: 400,
	width: 0,
	height: 0,
	maxWidth: null,
	thumbhash: null,
	load: true,
});

const emits = defineEmits(["load"]);
const media = ref<HTMLImageElement | null>(null) as Ref<HTMLImageElement>;
const isLoading: Ref<boolean> = ref(true);
let webp: boolean = true;
// let isError: boolean = false;

const src = computed(() => props.post ? getMediaThumbnailUrl(props.post, props.crc ?? 0, props.size) : null);

onMounted(() => {
	if (props.load) lazyObserver.observe(media.value);

	const parentStyle = getComputedStyle((media.value.parentElement as HTMLDivElement));
	const maxWidth = props.maxWidth ?? (parentStyle.maxWidth.endsWith('%') ? (
		(((media.value.parentElement as HTMLDivElement).parentElement as HTMLElement).parentElement as HTMLElement).getBoundingClientRect().width - 50 * (parseFloat(parentStyle.maxWidth) / 100)
		) : parseFloat(parentStyle.maxWidth));

	if (!props.width || !props.height) {
		media.value.style.cssText = `width: ${maxWidth / (Number(!isMobile) + 1)}px; height: ${parentStyle.maxHeight}`;
		return;
	}

	const maxHeight = parseFloat(parentStyle.maxHeight);
	// console.log("maxWidth:", maxWidth, "maxHeight:", maxHeight);

	const boundingBox = maxWidth / maxHeight;
	const aspectRatio = props.width / props.height;

	if (aspectRatio > boundingBox) {
		// image is wider

		const ratio = maxWidth / props.width;
		media.value.style.cssText = `width: ${maxWidth}px; height: ${Math.round(props.height * ratio)}px`;
	}
	else {
		// image is taller

		const ratio = maxHeight / props.height;
		media.value.style.cssText = `width: ${Math.round(props.width * ratio)}px; height: ${parentStyle.maxHeight}`;
	}
	th(props.thumbhash);
});

function loaded(event: Event) {
	if (!media.value) return;

	(media.value.parentElement as HTMLDivElement).classList.remove("loading");
	isLoading.value = false;
	emits("load", event);
}

function onError() {
	// console.log(event);
	if (!media.value) return;

	if (props.post && webp) {
		webp = false;
		media.value.src = getMediaThumbnailUrl(props.post, props.crc ?? 0, 1200, "jpg");
	}
	else {
		isLoading.value = false;
		media.value.alt = "failed to load media thumbnail";
		// isError = true;
	}
}

function th(value: string | null) {
	// this.isLoading = !this.thumbhash;
	if (!value) return;

	let dataurl: string = "";
	try {
		const th = (media.value.parentElement as HTMLDivElement);
		dataurl = thumbHashToDataURL(base64ToBytes(value));
		th.style.background = "url('" + lightnoise + "') repeat center, url('" + dataurl + "') 0% 0% / cover";
		th.classList.remove("wave");

		media.value.style.opacity = "0";
		th.classList.add("th");
		if (isLoading.value) {
			media.value.addEventListener("load", () => {
				if (!media.value) return;
				isLoading.value = false;

				media.value.style.opacity = "";
				setTimeout(() => th.style.background = "", 500);
			}, { once: true });
		}
		else {
			media.value.style.opacity = "";
			setTimeout(() => th.style.background = "", 500);
		}
	}
	catch (e) {
		console.error("thumbhash:", value, "dataurl:", dataurl, "error:", e);
	}
}

watch(() => props.post, (value: string | null) => {
	// reset state
	isLoading.value = true;
	(media.value.parentElement as HTMLDivElement).classList.add("loading");
	webp = true;
	// isError = false;

	if (!value) return;
	if (media.value.dataset.intersected) {
		media.value.src = getMediaThumbnailUrl(value, props.size);
	}
});

watch(() => props.thumbhash, th);
watch(() => props.load, (value: boolean) => {
	if (value) lazyObserver.observe(media.value);
});
</script>

<style scoped>
.thumbnail {
	position: relative;
	pointer-events: none;
	border-radius: var(--border-radius);
	overflow: hidden;
}

.th img {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	position: relative;
}

img {
	/* object-fit: cover; */
	display: block;
	max-height: inherit;
	max-width: inherit;
	/* width: 100%;
	height: 100%; */
}
.loading.th > div {
	animation: wave 5s infinite linear forwards;
	-webkit-animation: wave 5s infinite linear forwards;
	background: linear-gradient(100deg, black 40vw, #fff8 50vw, black 60vw);
	background-size: auto;
	background-size: 100vw 100%;
	height: 100%;
	width: 100%;
	position: absolute;
	mix-blend-mode: color-dodge;
}
</style>
