<template>
	<img ref='media' :data-src='src' @load='loaded' @error='onError'>
</template>

<script>
import { ref } from 'vue';
import { getIconUrl, getMediaThumbnailUrl, lazyObserver } from '@/utilities';
import { defaultUserIcon } from '@/config/constants';

export default {
	name: 'Media',
	props: {
		isLoading: Boolean,
		handle: String,
		post: String,
	},
	setup() {
		const media = ref(null);
		return {
			media,
		};
	},
	data() {
		return {
			webp: true,
		};
	},
	mounted() {
		if (this.handle)
		{ lazyObserver.observe(this.$refs.media); }
	},
	computed: {
		src() {
			if (!this.handle)
			{ return null; }

			if (this.post)
			{ return getIconUrl(this.post, this.handle.toLowerCase()); }
			else
			{ return getMediaThumbnailUrl(defaultUserIcon, 400); }
		},
	},
	methods: {
		loaded(event) {
			if (this.handle)
			{ this.$emit('update:isLoading', false); }
		},
		onError() {
			if (!this.handle)
			{ return; }

			if (this.webp && this.post)
			{
				this.webp = false;
				this.$refs.media.src = getMediaThumbnailUrl(this.post, 1200, 'jpg');
			}
			else if (this.handle)
			{ this.$refs.media.src = getMediaThumbnailUrl(defaultUserIcon, 400); }
			else
			{ this.$emit('update:isLoading', false); }
		},
	},
	watch: {
		handle(value) {
			if (value)
			{ lazyObserver.observe(this.$refs.media); }
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
