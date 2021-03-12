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
			type: String,
			default: null,
		},
	},
	data () {
		return {
			src: null,
		};
	},
	mounted() {
		this.src = getMediaThumbnailUrl(this.post, this.size);
	},
	methods: {
		onLoad() {
		},
		onError() {
			this.src = getMediaThumbnailUrl(this.post, 1200, 'jpg');
		},
	},
}
</script>

<style scoped>
.media img, .media video {
	width: 100%;
}
.media p {
	align-self: center;
	text-align: center;
}
</style>
