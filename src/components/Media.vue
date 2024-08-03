<template>
	<div class='_media' ref='container'>
		<Loading class='media' :style='parentStyle' :isLoading='isLoading'>
			<div ref='mediaContainer'>
				<div class='media-container'>
					<p v-if='isError'>Could not load media.</p>
					<video ref='media' :src='props.src' :title='props.alt' :controls='props.controls' @load='onLoad' @error='onError' :style='linkStyle' v-else-if='isVideo'>Your browser does not support this type of video.</video>
					<img ref='media' :alt='props.alt' @error='onError' :style='linkStyle' v-else>
				</div>
			</div>
		</Loading>
		<div ref='loader' class='spinner'>
			<Spinner :loaded='loaded' :total='total'/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { cdnRegex } from '@/config/constants';
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import { base64ToBytes, createToast } from '@/utilities';
import Loading from '@/components/Loading.vue';
import Spinner from '@/components/Spinner.vue';
import { thumbHashToDataURL } from 'thumbhash';
import store from '@/globals';


const globals = store();
const props = withDefaults(defineProps<{
	mime: string | null,
	src: string,
	alt?: string,
	controls: boolean,
	style: string | null,
	width: number,
	height: number,
	bg: boolean,
	thumbhash: string | null,
}>(), {
	mime: null,
	src: "",
	controls: true,
	style: null,
	width: 0,
	height: 0,
	bg: false,
	thumbhash: null,
});

const isLoading: Ref<boolean> = ref(!props.thumbhash);
const isError: Ref<boolean> = ref(false);
const media = ref<HTMLImageElement | null>(null) as Ref<HTMLImageElement>;
const mediaContainer = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const loader = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const container = ref<HTMLImageElement | HTMLVideoElement | null>(null) as Ref<HTMLImageElement | HTMLVideoElement>;
const loaded: Ref<number> = ref(0);
let total: number = 0; // don't bother with this one since it's mostly loaded that will be updating

interface Image extends HTMLImageElement {
	load(url: string, callback: { (this: XMLHttpRequest, ev: ProgressEvent): any }): void;
}

Image.prototype.load = function(url: string, callback: { (this: XMLHttpRequest, ev: ProgressEvent): any }) {
	// const img = this;
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);

	if (url.match(cdnRegex)) {
		const auth = globals.auth?.token;
		if (auth) {
			xhr.setRequestHeader("authorization", "bearer " + auth);
		}
	}

	// xhr.setRequestHeader("Cache-Control", "max-stale=10000000");
	xhr.responseType = "arraybuffer";
	xhr.onload = () => {
		// TODO: until I figure out the caching issue, use blobs
		const blob = new Blob([xhr.response], { type: xhr.getResponseHeader("content-type") ?? undefined });
		// console.log(blob)
		this.src = window.URL.createObjectURL(blob);

		// TODO: in the future, the browser should just cache the image locally and be able to load it directly from img.src
		// this.src = url;
		const ms = blob.size / 60000;
		console.debug("render time:", ms / 1000);
		this.onload = () => {
			URL.revokeObjectURL(this.src);
			// wait for the image to fully render (based on image size) before fading in
			setTimeout(() => this.dispatchEvent(new Event("render")), ms);
		};
	};
	xhr.onprogress = callback;
	xhr.send();
};

onMounted(() => {
	th(props.thumbhash);

	media.value.addEventListener("render", onLoad);
	// return this.$refs.media.src = this.src;

	if (isImage.value) {
		const show = setTimeout(() => {
			window.addEventListener("scroll", onScroll);
			window.addEventListener("resize", onScroll);
			onScroll();
			loader.value.style.opacity = "1";
		}, 1000);

		// const i = new Image();
		// i.onlo
		(media.value as Image).load(props.src, e => {
			loaded.value = e.loaded;
			total = e.total;
		});
		// i.dataset = this.$refs.media.dataset;
		// i.className = this.$refs.media.className;
		// this.$refs.media.parentNode.replaceChild(i, this.$refs.media);		
		// this.$refs.media = i;
		media.value.addEventListener("load", () => clearTimeout(show));
		media.value.addEventListener("render", () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (loader.value) loader.value.style.display = "none";
		});
	}
	// else if (this.isVideo) {

	// }
	else {
		media.value.addEventListener("load", () => media.value.dispatchEvent(new Event("render")));
		media.value.src = props.src;
		// error
	}
});

onUnmounted(() => {
	// just in case they're not removed during render, for whatever reason
	window.removeEventListener("scroll", onScroll);
	window.removeEventListener("resize", onScroll);
});
	
const isImage = computed(() => props.mime && props.mime.startsWith("image"));
const isVideo = computed(() => props.mime && props.mime.startsWith("video"));
const parentStyle = computed(() => props.width ? `aspect-ratio: ${props.width}/${props.height}; max-width: ${props.width}px` : null);
const linkStyle = computed(() => {
	if (props.width)
	{ return `width: ${props.width}px;`; }
	else if (isError.value)
	{ return "background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); " + `width: ${props.width || "30vw"}px; height: ${props.height || "30vh"};`; }
	return props.style;
});

const emits = defineEmits([
	"update:width",
	"update:height",
])

function onLoad() {
	if (!media.value) return;

	isLoading.value = false;
	// this.$refs.loader.style = null;
	// this.$refs.media.parentNode.style.background = null;
	if (props.bg) {
		const div = document.createElement("div");
		// div.style.opacity = 0;
		for (let data in media.value.dataset) {
			div.dataset[data] = "";
		}
		div.classList.add("bg");
		(media.value.parentNode as HTMLElement).prepend(div);
	}
	emits("update:width", media.value.naturalWidth);
	emits("update:height", media.value.naturalHeight);
}

function onError() {
	if (!props.mime || !props.src) return;

	isLoading.value = false;
	isError.value = true;

	createToast({
		title: "Failed To Load Media",
		dump: props.src,
	});
}

function th(value: string | null) {
	// console.log('thumbhash:', value);
	if (!value) return;

	let dataurl;
	try {
		dataurl = thumbHashToDataURL(base64ToBytes(value));
		mediaContainer.value.style.background = "url('/assets/lightnoise.png') repeat center, url('" + dataurl + "') 0% 0% / cover";
		(media.value.parentNode as HTMLDivElement).style.opacity = "0";
		mediaContainer.value.classList.add("th");
		// this.isLoading = false;
		media.value.addEventListener("render", () => {
			// this.$refs.media.parentNode.style.background = null;
			if (media.value && media.value.parentNode) (media.value.parentNode as HTMLDivElement).style.opacity = "1";
			// setTimeout(() => this.$refs.media.style.opacity = 100, 150);
		}, { once: true });
	}
	catch (e) {
		console.error("thumbhash:", value, "dataurl:", dataurl, "error:", e);
	}
}

function onScroll() {
	const rect = container.value.getBoundingClientRect();

	if (rect.height < rect.width) return;

	const margin = (window.innerHeight - loader.value.offsetHeight) / 2;
	const bottom = window.innerHeight - rect.bottom;

	if (rect.top > margin) {
		// fix to top
		loader.value.style.position = 'absolute';
		loader.value.style.top = "0";
		loader.value.style.bottom = "";
		loader.value.style.left = "";
		loader.value.style.width = "";
	}
	else if (bottom > margin) {
		// fix to bottom
		loader.value.style.position = 'absolute';
		loader.value.style.top = "unset";
		loader.value.style.bottom = "0";
		loader.value.style.left = "";
		loader.value.style.width = "";
	}
	else {
		// fix to center
		loader.value.style.position = 'fixed';
		loader.value.style.top = `${margin}px`;
		loader.value.style.bottom = "";
		loader.value.style.left = `${rect.left}px`;	
		loader.value.style.width = `${rect.width}px`;
	}
}

watch(() => props.thumbhash, th);
watch(() => props.src, (value: string) => {
	if (!isImage.value) return;

	loaded.value = total = 0;
	(media.value as Image).load(value, e => {
		loaded.value = e.loaded;
		total = e.total;
	});

	isLoading.value = !props.thumbhash;
	(media.value.parentNode as HTMLDivElement).classList.remove("bg");	
});
</script>

<style scoped>
._media {
	position: relative;
}
.media.loading {
	overflow: hidden;
}
.media {
	margin: auto;
}
.spinner {
	display: flex;
	opacity: 0;
	top: 0;
	width: 100%;
	height: 100vh;
	max-height: 100%;
	aspect-ratio: 1/1;
	justify-content: center;
	align-items: center;
	text-align: center;
	position: absolute;
}
.media img, .media video {
	max-width: 100%;
	max-height: 100%;
	margin: 0 auto;
	display: block;
	position: relative;
	/* add a background to transparent images */
}
.bg {
	background: var(--bg0color) url(/assets/lightnoise.png) repeat center;
	position: absolute;
	height: 100%;
	width: 100%;
	top: 0;
	left: 0;
}
.media p {
	align-self: center;
	text-align: center;
}
.th {
	height: 100%;
	width: 100%;
}
.th img, .media-container {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.media-container {
	position: relative;
}
</style>
