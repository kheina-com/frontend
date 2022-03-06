<template>
	<img ref='media' :data-src='src' @load='loaded' @error='onError'>
</template>

<script>
import { ref } from 'vue';
import { getIconUrl, getMediaThumbnailUrl, lazyObserver } from '@/utilities';

export default {
	name: 'Media',
	props: {
		isLoading: Boolean,
		handle: String,
		post: String,
		onLoad: { 
			type: Function,
			default() { },
		},
	},
	setup() {
		const media = ref(null);
		return {
			media,
		};
	},
	mounted() {
		lazyObserver.observe(this.$refs.media);
	},
	computed: {
		src() {
			if (!this.post && !this.handle)
			{ return null; }
			if (this.post)
			{ return getIconUrl(this.post, this.handle.toLowerCase()); }
			else
			{ return getMediaThumbnailUrl('_V-EGBtH', 400); }
		},
	},
	methods: {
		loaded(event) {
			this.$emit('update:isLoading', false);
			this.onLoad(event);
		},
		onError() {
			if (this.post)
			{ this.$refs.media.src = getMediaThumbnailUrl(this.post, 1200, 'jpg'); }
			else if (this.handle)
			{ this.$refs.media.src = getMediaThumbnailUrl('_V-EGBtH', 400); }
		},
	},
}
</script>

<style scoped>
img {
	object-fit: cover;
	display: block;
}
</style>
