<template>
	<Loading class='media' :style='parentStyle' :isLoading='isLoading && lazy'>
		<p v-if='isError'>Could not load media.</p>
		<video ref='media' :src='src' :title='alt' :controls='controls' @load='onLoad' @error='onError' :style='linkStyle' v-else-if='isVideo'>Your browser does not support this type of video.</video>
		<img ref='media' :src='src' :alt='alt' @load='onLoad' @error='onError' :style='linkStyle' v-else>
	</Loading>
</template>

<script>
import { ref } from 'vue';
import Loading from '@/components/Loading.vue';

export default {
	name: 'Media',
	components: {
		Loading,
	},
	props: {
		mime: {
			type: String,
			default: null,
		},
		src: {
			type: String,
			default: null,
		},
		alt: {
			type: String,
			default: null,
		},
		controls: {
			type: Boolean,
			default: true,
		},
		load: {
			type: Function,
			default: () => { },
		},
		style: {
			type: String,
			default: null,
		},
		width: {
			type: Number,
			default: 0,
		},
		height: {
			type: Number,
			default: 0,
		},
		lazy: {
			type: Boolean,
			default: true,
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
			isError: false,
		};
	},
	computed: {
		isImage()
		{ return this.mime && this.mime.startsWith('image'); },
		isVideo()
		{ return this.mime && this.mime.startsWith('video'); },
		parentStyle() {
			return this.isLoading && this.width ? `aspect-ratio: ${this.width}/${this.height};` : null;
		},
		linkStyle()
		{
			if (this.isLoading && this.lazy)
			{ return `width: ${this.width || '30vw'}px; padding-top: ${this.width ? this.height / this.width * 100 : '30vh'}%;`; }
			else if (this.isError)
			{ return 'background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); ' + `width: ${this.width || '30vw'}px; height: ${this.height || '30vh'};`; }
			return this.style;
		},
	},
	mounted() {
		this.load();
	},
	methods: {
		onLoad() {
			this.isLoading = false;
			this.$emit(`update:width`, this.$refs.media.naturalWidth);
			this.$emit(`update:height`, this.$refs.media.naturalHeight);
			// don't ask me why the timeout is necessary, I don't know.
			setTimeout(this.load, 0);
		},
		onError(event) {
			if (!this.mime || !this.src)
			{ return; }
			console.log(event);
			this.isLoading = false;
			this.isError = true;
			// don't ask me why the timeout is necessary, I don't know.
			setTimeout(this.load, 0);
		},
	},
}
</script>

<style scoped>
.media.loading {
	overflow: hidden;
}
.media img, .media video {
	max-width: 100%;
	max-height: 100%;
	margin: 0 auto;
	display: block;
}
.media p {
	align-self: center;
	text-align: center;
}
</style>
