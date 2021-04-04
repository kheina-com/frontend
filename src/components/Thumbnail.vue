<template>
	<img :src='src' @load='onLoad' @error='onError'>
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
			default: null,
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
		onLoad() {
			console.log('thumbnail loaded');
			this.$emit('update:isLoading', false);
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
