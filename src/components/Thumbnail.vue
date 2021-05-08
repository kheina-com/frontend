<template>
	<img :src='src' @load='loaded' @error='onError'>
</template>

<script>
import { getMediaThumbnailUrl } from '@/utilities';

export default {
	name: 'Media',
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
		isLoading: Boolean,
	},
	data() {
		return {
			webpFailed: false,
		};
	},
	computed: {
		src() {
			if (this.webpFailed)
			{ return getMediaThumbnailUrl(this.post, 1200, 'jpg'); }
			return getMediaThumbnailUrl(this.post, this.size);
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
}
</style>
