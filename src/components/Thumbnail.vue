<template>
	<Loading class='thumbnail' :isLoading='isLoading'>
		<img ref='media' :data-src='src' @load='loaded' @error='onError'>
	</Loading>
</template>

<script>
import { ref } from 'vue';
import { base64ToBytes, getMediaThumbnailUrl, lazyObserver } from '@/utilities';
import { isMobile } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import { thumbHashToDataURL } from 'thumbhash';

export default {
	name: 'Thumbnail',
	components: {
		Loading,
	},
	props: {
		post: {
			type: String,
			default: null,
		},
		size: {
			type: Number,
			default: 400,
		},
		onLoad: { 
			type: Function,
			default() { },
		},
		width: {
			type: Number,
			default: 0,
		},
		height: {
			type: Number,
			default: 0,
		},
		maxWidth: {
			type: Number,
			default: null,
		},
		thumbhash: {
			type: String,
			default: null,
		},
	},
	setup() {
		const media = ref(null);
		return {
			media,
		};
	},
	data() {
		return {
			isLoading: true,
			webp: true,
			isError: false,
		};
	},
	mounted() {
		// this.isLoading = true;
		// this.webp = true;
		// this.isError = false;

		// if (this.thumbhash) {
		// 	this.$refs.media.src = thumbHashToDataURL(base64ToBytes(this.thumbhash))
		// 	this.isLoading = false;
		// }

		lazyObserver.observe(this.$refs.media);

		const parentStyle = getComputedStyle(this.$refs.media.parentElement);
		const maxWidth = this.maxWidth ?? (parentStyle.maxWidth.endsWith('%') ? (
			this.$refs.media.parentElement.parentElement.parentElement.getBoundingClientRect().width - 50 * (parseFloat(parentStyle.maxWidth) / 100)
			) : parseFloat(parentStyle.maxWidth));

		if (!this.width || !this.height) {
			this.$refs.media.style = `width: ${maxWidth / (!isMobile + 1)}px; height: ${parentStyle.maxHeight}`;
			return;
		}

		const maxHeight = parseFloat(parentStyle.maxHeight);
		// console.log("maxWidth:", maxWidth, "maxHeight:", maxHeight);

		const boundingBox = maxWidth / maxHeight;
		const aspectRatio = this.width / this.height;

		if (aspectRatio > boundingBox) {
			// image is wider

			const ratio = maxWidth / this.width;
			this.$refs.media.style = `width: ${maxWidth}px; height: ${Math.round(this.height * ratio)}px`;
		}
		else {
			// image is taller

			const ratio = maxHeight / this.height;
			this.$refs.media.style = `width: ${Math.round(this.width * ratio)}px; height: ${parentStyle.maxHeight}`;
		}
	},
	computed: {
		src() {
			return this.post ? getMediaThumbnailUrl(this.post, this.size) : null;
		},
	},
	methods: {
		loaded(event) {
			if (this.$refs.media) {
				this.isLoading = false;
				this.$refs.media.style = null;
				this.onLoad(event);
			}
		},
		onError(event) {
			// console.log(event);
			if (this.post && this.webp) {
				this.webp = false;
				this.$refs.media.src = getMediaThumbnailUrl(this.post, 1200, 'jpg');
			}
			else {
				this.isLoading = false;
				this.$refs.media.alt = 'failed to load media thumbnail';
				this.isError = true;
			}
		},
	},
	watch: {
		post(value) {
			// reset state
			this.isLoading = !this.thumbhash;
			this.webp = true;
			this.isError = false;

			if (this.$refs.media.dataset.intersected) {
				this.$refs.media.src = getMediaThumbnailUrl(this.post, this.size);
			}
		},
		thumbhash(value) {
			console.log('thumbhash:', value);
			if (value) {
				this.$refs.media.style.opacity = 0;
				this.$refs.media.classList.add("th");
				this.$refs.media.parentNode.style.background = "url('" + thumbHashToDataURL(base64ToBytes(value)) + "')";
				this.$refs.media.parentNode.style.backgroundSize = "cover";
				this.isLoading = false;
			}
		},
	},
}
</script>

<style scoped>
/* .desktop img {
	max-height: inherit;
	max-width: inherit;
}
.mobile img {
	height: 100%;
	width: 100%;
} */
.th {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
img {
	/* object-fit: cover; */
	display: block;
	max-height: inherit;
	max-width: inherit;
	/* width: 100%;
	height: 100%; */
}
.loading {
	overflow: hidden;
}
</style>
