<template>
	<div class='thumbnail loading wave'>
		<img ref='media' :data-src='src' @load='loaded' @error='onError'>
		<ul class='flags' v-if='props.media?.flags?.length'>
			<li class='flag' v-for='flag in props.media.flags'>{{ flag }}</li>
		</ul>
	</div>
</template>
<script setup lang='ts'>
import type { MediaLike } from '@/types/post';
import { computed, onMounted, ref, watch, type Ref, toRef } from 'vue';
import { base64ToBytes, getMediaThumbnailUrl, lazyObserver } from '@/utilities';
import { isMobile } from '@/config/constants';
import { thumbHashToDataURL } from 'thumbhash';
import lightnoise from '$/lightnoise.png?url';

const props = withDefaults(defineProps<{
	media:   MediaLike | null,
	size?:   number,
	render?: boolean,
}>(), {
	size: 400,
	render: true,
});

const media = ref<HTMLImageElement | null>(null) as Ref<HTMLImageElement>;
const isLoading: Ref<boolean> = ref(true);
let webp: boolean = true;
// let isError: boolean = false;

const src = computed(() => props.media ? getMediaThumbnailUrl(props.media, props.size) : null);

onMounted(() => {
	if (props.render) lazyObserver.observe(media.value);
	loadThumbnail();
});

function loadThumbnail() {
	const parentStyle = getComputedStyle((media.value.parentElement as HTMLDivElement));
	// console.debug("[Thumbnail] parentStyle: maxWidth:", parentStyle.maxWidth, "maxHeight", parentStyle.maxHeight);
	const maxWidth = ((): number => {
		if (parentStyle.maxWidth.endsWith("%")) {
			return (((media.value.parentElement as HTMLDivElement).parentElement as HTMLElement).parentElement as HTMLElement).getBoundingClientRect().width - 50 * (parseFloat(parentStyle.maxWidth) / 100)
		}

		if (parentStyle.maxWidth.endsWith("em")) {
			return parseFloat(parentStyle.maxWidth) * parseFloat(parentStyle.fontSize);
		}

		return parseFloat(parentStyle.maxWidth);
	})();

	if (!props.media) {
		media.value.style.width = (maxWidth / (Number(!isMobile) + 1)).toString() + "px";
		media.value.style.height = parentStyle.maxHeight;
		return;
	}

	const maxHeight = ((): number => {
		if (parentStyle.maxHeight.endsWith("%")) {
			return (((media.value.parentElement as HTMLDivElement).parentElement as HTMLElement).parentElement as HTMLElement).getBoundingClientRect().height - 50 * (parseFloat(parentStyle.maxHeight) / 100)
		}

		if (parentStyle.maxHeight.endsWith("em")) {
			return parseFloat(parentStyle.maxHeight) * parseFloat(parentStyle.fontSize);
		}

		return parseFloat(parentStyle.maxHeight);
	})();
	const boundingBox = maxWidth / maxHeight;
	const aspectRatio = props.media.size.width / props.media.size.height;

	if (aspectRatio > boundingBox) {
		// image is wider

		const ratio = maxWidth / props.media.size.width;
		const width = maxWidth.toString() + "px";
		media.value.style.width = width;
		const height = Math.round(props.media.size.height * ratio).toString() + "px";
		media.value.style.height = height;
		// console.debug("[Thumbnail] (wider) width:", width, "height:", height);
	}
	else {
		// image is taller

		const ratio = maxHeight / props.media.size.height;
		const width = Math.round(props.media.size.width * ratio).toString() + "px";
		media.value.style.width = width;
		const height = maxHeight.toString() + "px";
		media.value.style.height = height;
		// console.debug("[Thumbnail] (taller) width:", width, "height:", height);
	}

	// don't bother with the loading animations if the image has already loaded
	if (media.value.complete) isLoading.value = false;
	// skip thumbhash if the image has already loaded
	else th(props.media.thumbhash);
}

function loaded(event: Event) {
	if (!media.value) return;

	(media.value.parentElement as HTMLDivElement).classList.remove("loading");
	isLoading.value = false;
}

function onError() {
	// console.log(event);
	if (!media.value || !props.media) return;

	if (webp) {
		webp = false;
		media.value.src = getMediaThumbnailUrl(props.media, props.size, "jpeg");
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
	const parent = media.value.parentElement as HTMLDivElement;

	let dataurl: string = "";
	try {
		const th = document.createElement("div");
		th.classList.add("th");
		dataurl = thumbHashToDataURL(base64ToBytes(value));
		th.style.background = "url('" + lightnoise + "') repeat center, url('" + dataurl + "') 0% 0% / cover";
		parent.classList.remove("wave");

		for (const data in parent.dataset) {
			th.dataset[data] = "";
		}

		parent.prepend(th);
		media.value.style.opacity = "0";
		if (isLoading.value) {
			media.value.addEventListener("load", () => {
				if (!media.value) return;
				isLoading.value = false;

				media.value.style.opacity = "";
				setTimeout(() => parent.removeChild(th), 500);
			}, { once: true });
		}
		else {
			media.value.style.opacity = "";
			th.style.opacity = "0";
			setTimeout(() => parent.removeChild(th), 500);
		}
	}
	catch (e) {
		console.error("thumbhash:", value, "dataurl:", dataurl, "error:", e);
	}
}

watch(toRef(props, "media"), (value: MediaLike | null, prev: MediaLike | null) => {
	if (value?.crc === prev?.crc) return;
	// reset state
	isLoading.value = true;
	(media.value.parentElement as HTMLDivElement).classList.add("loading");
	webp = true;
	// isError = false;

	if (!value) return;
	loadThumbnail();
	if (media.value.dataset.intersected) media.value.src = media.value.dataset.src || "";
});

watch(toRef(props, "render"), (value: boolean) => {
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

.th {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	position: absolute;
	height: 100%;
	width: 100%;
	left: 0;
	top: 0;
}

img {
	/* -webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime); */
	/* object-fit: cover; */
	display: block;
	max-height: inherit;
	max-width: inherit;
	/* width: 100%;
	height: 100%; */
	position: relative;
	background: var(--bg2color);
}
/* only use transition if we're using thumbhash */
.th + img {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}

.flags {
	position: absolute;
	list-style: none;
	top: 0;
	right: 0;
	margin: 0;
	padding: 0;
}
.flag {
	background: var(--bg2color);
	margin: 0.5em;
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	font-size: 0.8em;
}
/* 
really cool, but too heavy.
TODO: probably still need another anim, but not sure what
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
} */
</style>
