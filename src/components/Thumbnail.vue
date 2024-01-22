<template>
	<Loading class='thumbnail' :isLoading='isLoading'>
		<img ref='media' :data-src='src' @load='loaded' @error='onError'>
	</Loading>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, isMobile, lazyObserver } from '@/utilities';
import Loading from '@/components/Loading.vue';

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

		lazyObserver.observe(this.$refs.media);

		const parentStyle = getComputedStyle(this.$refs.media.parentElement);
		const maxWidth = parentStyle.maxWidth.endsWith('%') ? this.$refs.media.parentElement.parentElement.parentElement.getBoundingClientRect().width - 50 : parseFloat(parentStyle.maxWidth);

		if (!this.width || !this.height) {
			this.$refs.media.style = `width: ${maxWidth / (!isMobile + 1)}px; height: ${parentStyle.maxHeight}`;
			return;
		}

		const maxHeight = parseFloat(parentStyle.maxHeight);
		console.log("maxWidth:", maxWidth, "maxHeight:", maxHeight);

		const boundingBox = maxWidth / maxHeight;
		const aspectRatio = this.width / this.height;

		if (aspectRatio > boundingBox) {
			// image is wider

			const adjustment = maxWidth / this.width;
			this.$refs.media.style = `width: ${maxWidth}px; height: ${Math.round(this.height * adjustment)}px`;
		}
		else {
			// image is taller

			const adjustment = maxHeight / this.height;
			this.$refs.media.style = `width: ${Math.round(this.width * adjustment)}px; height: ${parentStyle.maxHeight}`;
		}
	},
	computed: {
		isMobile,
		src() {
			return this.post ? getMediaThumbnailUrl(this.post, this.size) : null;
		},
	},
	methods: {
		loaded(event) {
			this.isLoading = false;
			this.onLoad(event);
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
			// console.log("post:", value);
			// reset state
			this.isLoading = true;
			this.webp = true;
			this.isError = false;

			if (this.$refs.media.dataset.intersected) {
				// console.log("update:", value);
				this.$refs.media.src = getMediaThumbnailUrl(this.post, this.size);
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
img {
	object-fit: cover;
	display: block;
}
.loading {
	overflow: hidden;
}
</style>
