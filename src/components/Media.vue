<template>
	<a :href='src' class='media' v-if='link'>
		<Loading :isLoading='isLoading && lazy'>
			<p v-if='isError'>Could not load media.</p>
			<video :src='src' :title='alt' :controls='controls' @load='onLoad' @error='onError' :style='linkStyle' v-else-if='isVideo'>Your browser does not support this type of video.</video>
			<img :src='src' :alt='alt' @load='onLoad' @error='onError' :style='linkStyle' v-else>
		</Loading>
	</a>
	<Loading class='media' :isLoading='isLoading && lazy' v-else>
		<p v-if='isError'>Could not load media.</p>
		<video :src='src' :title='alt' :controls='controls' @load='onLoad' @error='onError' :style='linkStyle' v-else-if='isVideo'>Your browser does not support this type of video.</video>
		<img :src='src' :alt='alt' @load='onLoad' @error='onError' :style='linkStyle' v-else>
	</Loading>
</template>

<script>
import Loading from '@/components/Loading.vue';

export default {
	name: 'Media',
	components: {
		Loading,
	},
	props: {
		link: {
			type: Boolean,
			default: true,
		},
		mime: {
			type: String,
			default: null,
		},
		src: {
			type: String,
			default: null,
		},
		poster: {
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
		loadingStyle: {
			type: String,
			default: 'width: 30vw; height: 30vh;',
		},
		lazy: {
			type: Boolean,
			default: true,
		},
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
		linkStyle()
		{
			if (this.isLoading && this.lazy)
			{ return this.loadingStyle; }
			else if (this.isError)
			{ return 'background: var(--error); display: flex; justify-content: center; border-radius: var(--border-radius); ' + this.loadingStyle; }
			return this.style;
		},
	},
	mounted() {
		this.load();
	},
	methods: {
		onLoad() {
			this.isLoading = false;
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
.media img, .media video {
	max-width: 100%;
	max-height: 100%;
	display: block;
}
.media p {
	align-self: center;
	text-align: center;
}
</style>
