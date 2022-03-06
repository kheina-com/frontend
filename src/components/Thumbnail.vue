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
			webpFailed: false,
			isLoading: true,
		};
	},
	mounted() {
		lazyObserver.observe(this.$refs.media);
	},
	computed: {
		parentStyle() {
			return this.isLoading && this.width ? `aspect-ratio: ${this.width}/${this.height};` : null;
		},
		imageStyle()
		{
			if (this.isLoading)
			{ return `width: ${this.width || '30vw'}px; padding-top: ${this.width ? this.height / this.width * 100 : '30vh'}%;`; }
			else if (this.isError)
			{ return 'background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); ' + `width: ${this.width || '30vw'}px; height: ${this.height || '30vh'};`; }
		},
		src() {
			return getMediaThumbnailUrl(this.post, this.size);
		},
	},
	methods: {
		loaded(event) {
			this.isLoading = false;
			this.onLoad(event);
		},
		onError() {
			if (this.post)
			{ this.$refs.media.src = getMediaThumbnailUrl(this.post, 1200, 'jpg'); }
		},
	},
}
</script>

<style scoped>
img {
	object-fit: cover;
	display: block;
	max-height: inherit;
	max-width: inherit;
}
.loading {
	overflow: hidden;
}
</style>
