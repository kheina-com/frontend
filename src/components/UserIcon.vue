<template>
	<img ref='media' :data-src='src' @load='loaded' @error='onError'>
</template>

<script>
import { ref } from 'vue';
import { getIconUrl, lazyObserver } from '@/utilities';
import { defaultUserIcon } from '@/config/constants';

export default {
	name: 'UserIcon',
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
			{ return defaultUserIcon; }
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

			this.$emit('update:isLoading', false);
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
