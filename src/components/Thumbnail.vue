<template>
	<Loading class='thumbnail' :style='parentStyle' :isLoading='isLoading'>
		<img ref='media' :style='imageStyle' :data-src='src' @load='loaded' @error='onError'>
	</Loading>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, lazyObserver } from '@/utilities';
import Loading from '@/components/Loading.vue';

export default {
	name: 'Media',
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
		};
	},
	mounted() {
		lazyObserver.observe(this.$refs.media);
	},
	computed: {
		parentStyle() {
			return this.isLoading && this.width ? `aspect-ratio: ${this.width}/${this.height};` : null;
		},
		adjustment() {
			return this.width ? Math.min(this.size / Math.max(this.width, this.height), 1) : null;
		},
		imageStyle() {
			if (this.isLoading)
			{ return `width: ${this.width ? Math.round(this.width * this.adjustment) + 'px' : '30vw'}; padding-top: ${this.width ? this.height / this.width * 100 : 100}%;`; }
			else if (this.isError)
			{ return 'background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); ' + `width: ${this.width ? Math.round(this.width * this.adjustment) + 'px' : '30vw'}; height: ${this.height ? Math.round(this.height * this.adjustment) + 'px' : '30vw'};`; }
		},
		src() {
			return this.post ? getMediaThumbnailUrl(this.post, this.size) : null;
		},
	},
	methods: {
		loaded(event) {
			this.isLoading = false;
			this.onLoad(event);
		},
		onError() {
			if (this.post && this.webp)
			{
				this.webp = false;
				this.$refs.media.src = getMediaThumbnailUrl(this.post, 1200, 'jpg');
			}
			else
			{
				this.isLoading = false;
				this.$refs.media.alt = 'failed to load media thumbnail';
				this.isError = true;
			}
		},
	},
	watch: {
		post(value) {
			if (this.$refs.media.dataset.intersected) {
				this.$refs.media.src = getMediaThumbnailUrl(this.post, this.size);
			}
		},
	},
}
</script>

<style scoped>
.desktop img {
	max-height: inherit;
	max-width: inherit;
}
.mobile img {
	height: 100%;
	width: 100%;
}
img {
	object-fit: cover;
	display: block;
}
.loading {
	overflow: hidden;
}
</style>
