<template>
	<div ref='loader' class='loader'><div ref='loaderContent'><p></p><!-- yes, there needs to be two p tags --><p></p></div></div>
	<Loading class='media' :style='parentStyle' :isLoading='isLoading'>
		<div ref='mediaContainer'>
			<div class='media-container'>
				<p v-if='isError'>Could not load media.</p>
				<video ref='media' :src='src' :title='alt' :controls='controls' @load='onLoad' @error='onError' :style='linkStyle' v-else-if='isVideo'>Your browser does not support this type of video.</video>
				<img ref='media' :alt='alt' @error='onError' :style='linkStyle' v-else>
			</div>
		</div>
	</Loading>
</template>

<script lang="ts">
import { authRegex } from '@/config/constants';
import { defineComponent, ref } from 'vue';
import { base64ToBytes, createToast } from '@/utilities';
import Loading from '@/components/Loading.vue';
import { thumbHashToDataURL } from 'thumbhash';

// function abbreviate(value) {
// 	if (value >= 995e7)
// 	{ return `${Math.round(value / 1e9)}GB`; }
// 	if (value >= 9995e5)
// 	{ return `${(value / 1e9).toFixed(1)}GB`; }
// 	if (value >= 995e4)
// 	{ return `${Math.round(value / 1e6)}MB`; }
// 	if (value >= 9995e2)
// 	{ return `${(value / 1e6).toFixed(1)}MB`; }
// 	if (value >= 9950)
// 	{ return `${Math.round(value / 1e3)}KB`; }
// 	if (value >= 1e3)
// 	{ return `${(value / 1e3).toFixed(1)}KB`; }
// 	return `${value}B`;
// }

function abbreviate(value) {
	const e3 = Math.log(value) * Math.LOG10E / 3| 0;

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
	name: 'Media',
	components: {
		Loading,
	},
	props: {
		mime: {
			type: String,
			default: null,
		},
		src: {
			type: String,
			default: null,
		},
		alt: {
			type: String,
			default: null,
		},
		controls: {
			type: Boolean,
			default: true,
		},
		style: {
			type: String,
			default: null,
		},
		width: {
			type: Number,
			default: 0,
		},
		height: {
			type: Number,
			default: 0,
		},
		bg: {
			type: Boolean,
			default: false,
		},
		thumbhash: {
			type: String,
			default: null,
		},
	},
	setup() {
		const media = ref(null);
		const mediaContainer = ref(null);
		const loader = ref(null);
		const loaderContent = ref(null);
		return {
			media,
			mediaContainer,
			loader,
			loaderContent,
		};
	},
	data() {
		return {
			isLoading: !this.thumbhash,
			isError: false,
		};
	},
	created() {
		const store = this.$store;
		Image.prototype.load = function(url, callback) {
			// const img = this;
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);

			// if (url.match(authRegex)) {
			// 	const auth = store.state.auth?.token;
			// 	if (auth) {			
			// 		xhr.setRequestHeader('authorization', 'bearer ' + auth);
			// 	}
			// }

			// xhr.setRequestHeader('Cache-Control', 'max-stale=10000000');
			xhr.responseType = 'arraybuffer';
			xhr.onload = () => {
				// TODO: until I figure out the caching issue, use blobs
				const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('content-type') ?? undefined });
				// console.log(blob)
				this.src = window.URL.createObjectURL(blob);

				// TODO: in the future, the browser should just cache the image locally and be able to load it directly from img.src
				// this.src = url;
				const ms = blob.size / 60000;
				console.debug('render time:', ms / 1000);
				this.onload = () => {
					URL.revokeObjectURL(this.src);
					// wait for the image to fully render (based on image size) before fading in
					setTimeout(() => this.dispatchEvent(new Event('render')), ms);
				};
			};
			xhr.onprogress = callback;
			xhr.send();
		};
	},
	mounted() {
		this.th(this.thumbhash);
		this.$refs.media.addEventListener('render', this.onLoad);

		if (this.src.substring(0, 5) === "data:") {
			// image is a local file, skip
			this.$refs.media.src = this.src;
			return;
		}

		// return this.$refs.media.src = this.src;

		if (this.isImage) {
			const show = setTimeout(() => this.$refs.loader.style.display = "flex", 1000);

			// const i = new Image();
			// i.onlo
			this.$refs.media.load(this.src, e => {
				this.$refs.loaderContent.firstElementChild.innerText = (e.loaded / e.total * 100).toFixed(1) + "%";
				this.$refs.loaderContent.lastElementChild.innerText = `${abbreviate(e.loaded)} / ${abbreviate(e.total)}`;
			});
			// i.dataset = this.$refs.media.dataset;
			// i.className = this.$refs.media.className;
			// this.$refs.media.parentNode.replaceChild(i, this.$refs.media);
			// this.$refs.media = i;
			this.$refs.media.addEventListener('load', () => clearTimeout(show));
			this.$refs.media.addEventListener('render', () => this.$refs.loader.style.display = "none");
		}
		// else if (this.isVideo) {

		// }
		else {
			this.$refs.media.src = this.src;
			// error
		}
	},
	computed: {
		isImage()
		{ return this.mime && this.mime.startsWith('image'); },
		isVideo()
		{ return this.mime && this.mime.startsWith('video'); },
		parentStyle() {
			return this.width ? `aspect-ratio: ${this.width}/${this.height}; max-width: ${this.width}px` : null;
		},
		linkStyle() {
			if (this.width)
			{ return `width: ${this.width}px;`; }
			else if (this.isError)
			{ return 'background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); ' + `width: ${this.width || '30vw'}px; height: ${this.height || '30vh'};`; }
			return this.style;
		},
	},
	methods: {
		onLoad() {
			if (!this.$refs.media) {
				return;
			}
			this.isLoading = false;
			// this.$refs.loader.style = null;
			// this.$refs.media.parentNode.style.background = null;
			if (this.bg) {
				const div = document.createElement('div');
				// div.style.opacity = 0;
				for (let data in this.$refs.media.dataset) {
					div.dataset[data] = "";
				}
				div.classList.add('bg');
				this.$refs.media.parentNode.prepend(div);
			}
			this.$emit(`update:width`, this.$refs.media.naturalWidth);
			this.$emit(`update:height`, this.$refs.media.naturalHeight);
		},
		onError(event) {
			if (!this.mime || !this.src)
			{ return; }
			this.isLoading = false;
			this.isError = true;
			createToast({
				title: 'Failed To Load Media',
				dump: this.src,
			});
		},
		th(value) {
			// console.log('thumbhash:', value);
			if (!value) return;

			let dataurl;
			try {
				dataurl = thumbHashToDataURL(base64ToBytes(value));
				this.$refs.mediaContainer.style.background = "url('" + dataurl + "')";
				this.$refs.mediaContainer.style.backgroundSize = "cover";
				this.$refs.media.parentNode.style.opacity = 0;
				this.$refs.mediaContainer.classList.add("th");
				// this.isLoading = false;
				this.$refs.media.addEventListener('render', () => {
					// this.$refs.media.parentNode.style.background = null;
					this.$refs.media.parentNode.style.opacity = 1;
					// setTimeout(() => this.$refs.media.style.opacity = 100, 150);
				}, { once: true });
			}
			catch (e) {
				console.error("thumbhash:", value, "dataurl:", dataurl, "error:", e);
			}
		},
	},
	watch: {
		src() {
			this.isLoading = !this.thumbhash;
			this.$refs.media.parentNode.classList.remove('bg');	
		},
		thumbhash(value) {
			return this.th(value);
		},
	},
})
</script>

<style scoped>
.media.loading {
	overflow: hidden;
}
.media {
	margin: auto;
}
.loader {
	display: none;
	position: absolute;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
	text-align: center;
}
.loader div {
	background: var(--screen-cover);
	padding: 0.5em;
	border-radius: var(--border-radius);
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
</style>
