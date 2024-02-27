<template>
	<!-- <div ref='loader' class='loader'><div ref='loaderContent'/></div> -->
	<Loading class='media' :style='parentStyle' :isLoading='isLoading'>
		<p v-if='isError'>Could not load media.</p>
		<video ref='media' :src='src' :title='alt' :controls='controls' @load='onLoad' @error='onError' :style='linkStyle' v-else-if='isVideo'>Your browser does not support this type of video.</video>
		<img ref='media' :alt='alt' @load='onLoad' @error='onError' :style='linkStyle' v-else>
	</Loading>
</template>

<script>
import { ref } from 'vue';
import { authRegex } from '@/config/constants';
import { base64ToBytes, createToast } from '@/utilities';
import Loading from '@/components/Loading.vue';
import { thumbHashToDataURL } from 'thumbhash';

function abbreviate(value) {
	if (value >= 995e7)
	{ return `${Math.round(value / 1e9)}GB`; }
	if (value >= 9995e5)
	{ return `${(value / 1e9).toFixed(1)}GB`; }
	if (value >= 995e4)
	{ return `${Math.round(value / 1e6)}MB`; }
	if (value >= 9995e2)
	{ return `${(value / 1e6).toFixed(1)}MB`; }
	if (value >= 9950)
	{ return `${Math.round(value / 1e3)}KB`; }
	if (value >= 1e3)
	{ return `${(value / 1e3).toFixed(1)}KB`; }
	return `${value}B`;
}

export default {
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
		// const loader = ref(null);
		const loaderContent = ref(null);
		return {
			media,
			// loader,
			loaderContent,
		};
	},
	data() {
		return {
			isLoading: !this.thumbhash,
			isError: false,
		};
	},
	mounted() {
		this.th(this.thumbhash);
		this.$refs.media.src = this.src;

		// if (this.src.substring(0, 5) === "data:") {
		// 	// image is a local file, skip
		// 	this.$refs.media.src = this.src;
		// 	return;
		// }

		// if (this.isImage) {
		// 	const show = setTimeout(() => this.$refs.loader.style.display = "flex", 3000);
		// 	// Image.prototype.load = function(url, callback) {
		// 		// const img = this;
		// 		const xhr = new XMLHttpRequest();
		// 		xhr.open('GET', this.src, true);

		// 		if (this.src.match(authRegex)) {
		// 			const auth = this.$store.state.auth?.token;
		// 			if (auth) {
		// 				xhr.setRequestHeader('authorization', 'bearer ' + auth);
		// 			}
		// 		}

		// 		xhr.responseType = 'arraybuffer';
		// 		xhr.onload = () => {
		// 			clearTimeout(show);
		// 			const blob = new Blob([xhr.response]);
		// 			this.$refs.media.src = window.URL.createObjectURL(blob);
		// 		};
		// 		xhr.onprogress = this.onProgress
		// 		xhr.send();
		// 	// };

		// 	// const i = new Image();
		// 	// i.load(this.src, this.onProgress);
		// 	// this.$refs.media.parentNode.replaceChild(i, this.$refs.media);
		// 	// this.$refs.media = i;
		// }
		// else if (this.isVideo) {

		// }
		// else {
		// 	// error
		// }
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
			this.isLoading = false;
			// this.$refs.loader.style = null;
			if (this.bg) {
				this.$refs.media.parentNode.classList.add('bg');
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
		// onProgress(e) {
		// 	this.$refs.loaderContent.innerHTML = `${(e.loaded / e.total * 100).toFixed(1)}%<br>${abbreviate(e.loaded)} / ${abbreviate(e.total)}`;
		// },
		th(value) {
			// console.log('thumbhash:', value);
			if (value) {
				try {
					// this.$refs.media.style.opacity = 0;
					this.$refs.media.classList.add("th");
					this.$refs.media.parentNode.style.background = "url('" + thumbHashToDataURL(base64ToBytes(value)) + "')";
					this.$refs.media.parentNode.style.backgroundSize = "cover";
					// this.isLoading = false;
				}
				catch (e) {
					console.error(e);
				}
			}
		},
	},
	watch: {
		src() {
			this.isLoading = !this.thumbhash;
		},
		thumbhash(value) {
			return this.th(value);
		},
	},
}
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
	/* add a background to transparent images */
}
.media.bg img, .media.bg video {
	background: var(--bg0color) url(/assets/lightnoise.png) repeat center;
}
.media p {
	align-self: center;
	text-align: center;
}
</style>
