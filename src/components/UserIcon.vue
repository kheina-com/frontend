<template>
	<img :src='src' @load='loaded' @error='onError'>
</template>

<script>
import { getIconUrl, getMediaThumbnailUrl } from '@/utilities';

export default {
	name: 'Media',
	props: {
		handle: String,
		post: {
			type: String,
			default: null,
		},
		onLoad: { 
			type: Function,
			default() { },
		},
		isLoading: Boolean,
	},
	data() {
		return {
			webpFailed: false,
		};
	},
	computed: {
		src() {
			if (!this.post && !this.handle)
			{ return null; }
			if (this.post)
			{
				if (this.webpFailed)
				{ return getIconUrl(this.post, this.handle.toLowerCase(), 'jpg'); }
				return getIconUrl(this.post, this.handle.toLowerCase());
			}
			else
			{
				if (this.webpFailed)
				{ return getMediaThumbnailUrl('_V-EGBtH', 1200, 'jpg'); }
				return getMediaThumbnailUrl('_V-EGBtH', 800);
			}
		},
	},
	methods: {
		loaded(event) {
			this.$emit('update:isLoading', false);
			this.onLoad(event);
		},
		onError() {
			if (this.post)
			{ this.webpFailed = true; }
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
