<template>
	<div class='_media' ref='container'>
		<Loading class='media' :style='parentStyle' :isLoading='isLoading'>
			<div ref='mediaContainer'>
				<span v-if='isError'>
					<p>Could not load media.</p>
					<i class='material-icons icon'>close</i>
				</span>
				<div class='media-container'>
					<video
						ref='media'
						:title='alt'
						:controls='controls'
						:style='linkStyle'
						:autoplay='autoplay'
						loop
						@load='onLoad'
						@error='onError'
						v-if='isVideo'
					>Your browser does not support this type of video.</video>
					<img ref='media' :alt='alt' @error='onError' :style='linkStyle' v-else>
				</div>
			</div>
		</Loading>
		<div ref='loader' class='spinner'>
			<Spinner :loaded='loaded' :total='total'/>
		</div>
	</div>
</template>
<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, toRaw, toRef, watch, type Ref } from 'vue';
import { base64ToBytes, createToast } from '@/utilities';
import { cdnRegex } from '@/config/constants';
import store from '@/globals';
import Loading from '@/components/Loading.vue';
import Spinner from '@/components/Spinner.vue';
import { thumbHashToDataURL } from 'thumbhash';
import lightnoise from '$/lightnoise.png?url';

const globals = store();
const props = withDefaults(defineProps<{
	mime?:        string | null,
	src?:         string,
	alt?:         string,
	controls?:    boolean,
	style?:       string | null,
	width?:       number,
	height?:      number,
	bg?:          boolean,
	thumbhash?:   string | null,
	scaleHeight?: boolean,
	blob?:        string,
	autoplay?:    boolean,
}>(), {
	mime: null,
	src: "",
	controls: true,
	style: null,
	width: 0,
	height: 0,
	bg: false,
	thumbhash: null,
	autoplay: false,
});

const isLoading: Ref<boolean> = ref(!props.thumbhash);
const isError: Ref<boolean> = ref(false);
const media = ref<HTMLImageElement | HTMLVideoElement | null>(null) as Ref<HTMLImageElement | HTMLVideoElement>;
const mediaContainer = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const loader = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const container = ref<HTMLDivElement | null>(null);
defineExpose({ container });
const loaded: Ref<number> = ref(0);
const scalar: Ref<boolean> = toRef(props, "scaleHeight");
let total: number = 0; // don't bother with this one since it's mostly loaded that will be updating
let blobUrl: string | null = null;
let unmounted: boolean = false;
const revoke = (src: string) => {
	if (!unmounted) return;
	URL.revokeObjectURL(src);
	console.debug("[Media] revoked", src);
};

interface Image extends HTMLImageElement {
	load(url: string, callback: { (this: XMLHttpRequest, ev: ProgressEvent): any }): void;
}

Image.prototype.load = function(url: string, callback: { (this: XMLHttpRequest, ev: ProgressEvent): void }) {
	// const img = this;
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);

	if (url.startsWith("blob:")) {
		this.src = url;
		return this.addEventListener("load", () => this.dispatchEvent(new Event("render")));
	}

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
		this.src = blobUrl = window.URL.createObjectURL(blob);
		console.debug("[Media] blob created", url, "->", this.src);
		emits("update:blob", this.src);

		// TODO: in the future, the browser should just cache the image locally and be able to load it directly from img.src
		// this.src = url;
		const ms = blob.size / 60000;
		console.debug("[Media] render time:", ms / 1000);
		this.onload = () => {
			revoke(this.src);
			// wait for the image to fully render (based on image size) before fading in
			setTimeout(() => this.dispatchEvent(new Event("render")), ms);
		};
	};
	xhr.onprogress = callback;
	xhr.send();
};

const allowScalar = () => {
	if (!scalar.value) {
		emits("update:scaleHeight", mediaContainer.value.getBoundingClientRect().height > window.innerHeight - 90 ? false : undefined);
	}
};

onMounted(() => {
	th(props.thumbhash);

	allowScalar();
	window.addEventListener("resize", allowScalar);
	loadMedia();
});

onUnmounted(() => {
	// just in case they're not removed during render, for whatever reason
	window.removeEventListener("scroll", onScroll);
	window.removeEventListener("resize", onScroll);
	window.removeEventListener("resize", allowScalar);
	unmounted = true;
	if (blobUrl) revoke(blobUrl);
});

const isImage = computed(() => props.mime && props.mime.startsWith("image"));
const isVideo = computed(() => props.mime && props.mime.startsWith("video"));
const parentStyle = computed(() => props.width ? `aspect-ratio: ${props.width}/${props.height}; max-width: ${props.width}px` : null);
const linkStyle = computed(() => {
	if (props.width) return `width: ${props.width}px;`;
	// else if (isError.value) return "background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); " + `width: ${props.width || "30vw"}px; height: ${props.height || "30vh"};`;
	return props.style;
});

const emits = defineEmits([
	"update:width",
	"update:height",
	"update:scaleHeight",
	"update:blob",
]);

function loadMedia() {
	if (props.src === media.value?.src) return;
	isError.value = false;
	isLoading.value = !props.thumbhash;
	media.value.addEventListener("render", onLoad, { once: true });

	if (isImage.value) {
		const m = media.value as Image;
		const show = setTimeout(() => {
			window.addEventListener("scroll", onScroll);
			window.addEventListener("resize", onScroll);
			onScroll();
			loader.value.style.opacity = "1";
		}, 1000);

		m.load(props.src, e => {
			loaded.value = e.loaded;
			total = e.total;
		});
		m.addEventListener("load", () => {
			clearTimeout(show);
			if (m.naturalWidth) emits("update:width", m.naturalWidth);
			if (m.naturalHeight) emits("update:height", m.naturalHeight);
		});
		m.addEventListener("render", () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		});
	}
	else if (isVideo.value) {
		const m = media.value as HTMLVideoElement;
		const show = setTimeout(() => {
			window.addEventListener("scroll", onScroll);
			window.addEventListener("resize", onScroll);
			onScroll();
			loader.value.style.opacity = "1";
		}, 1000);
		m.addEventListener("canplay", () => {
			clearTimeout(show);
			if (m.videoWidth) emits("update:width", m.videoWidth);
			if (m.videoHeight) emits("update:height", m.videoHeight);
			m.dispatchEvent(new Event("render"));
		});
		m.src = props.src;
	}
	else {
		media.value.src = props.src;
		// error ?
	}
}

function onLoad() {
	if (!media.value) return;
	allowScalar();

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
	if (loader.value) loader.value.style.display = "none";
	if (media.value && media.value.parentNode) (media.value.parentNode as HTMLDivElement).style.opacity = "1";
}

function onError() {
	if (!props.mime || !props.src) return;
	if (loader.value) loader.value.style.display = "none";

	isLoading.value = false;
	isError.value = true;
	mediaContainer.value.classList.add("error");
	(media.value.parentNode as HTMLDivElement).style.opacity = "0";

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
		mediaContainer.value.style.background = "url('" + lightnoise + "') repeat center, url('" + dataurl + "') 0% 0% / cover";
		(media.value.parentNode as HTMLDivElement).style.opacity = "0";
		mediaContainer.value.classList.add("th");
		// this.isLoading = false;
	}
	catch (e) {
		console.error("thumbhash:", value, "dataurl:", dataurl, "error:", e);
	}
}

function onScroll() {
	if (!container.value) return;
	const rect = container.value.getBoundingClientRect();

	if (rect.height < rect.width) return;
	const margin = (window.innerHeight - loader.value.offsetHeight) / 2;
	const bottom = window.innerHeight - rect.bottom;

	if (rect.top > margin) {
		// fix to top
		loader.value.style.position = "absolute";
		loader.value.style.top = "0";
		loader.value.style.bottom = "";
		loader.value.style.left = "";
		loader.value.style.width = "";
	}
	else if (bottom > margin) {
		// fix to bottom
		loader.value.style.position = "absolute";
		loader.value.style.top = "unset";
		loader.value.style.bottom = "0";
		loader.value.style.left = "";
		loader.value.style.width = "";
	}
	else {
		// fix to center
		loader.value.style.position = "fixed";
		loader.value.style.top = `${margin}px`;
		loader.value.style.bottom = "";
		loader.value.style.left = `${rect.left}px`;	
		loader.value.style.width = `${rect.width}px`;
	}
}

watch(scalar, (value: boolean) => {
	if (!mediaContainer.value || !mediaContainer.value.parentElement) return;
	const mcp = mediaContainer.value.parentElement as HTMLDivElement;
	if (value) {
		mcp.classList.add("scale-height");
	}
	else {
		mcp.classList.remove("scale-height");
	}
});
watch(() => props.thumbhash, th);
// timeout required or else the media may be loaded into the wrong media type
// ie img -> <video> or video -> <img>
watch(props, () => setTimeout(loadMedia, 0));
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
.scale-height {
	max-height: calc(100vh - 2.5rem - var(--margin) * 2);
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
	pointer-events: none;
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
	text-align: center;
	text-shadow: 0 0 1em var(--shadowcolor);
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
.error {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
	overflow: hidden;
}
.error > span {
	position: absolute;
	text-align: center;
}
.error > span i {
	color: var(--error);
	font-size: 2em;
}
</style>
