<template>
	<a :href='src' class='media'>
		<Loading :isLoading='isLoading' :style='linkStyle'>
			<video :src='src' :title='alt' :controls='controls' @load='onLoad' :style='style' v-if='isVideo' >Your browser does not support this type of video.</video>
			<img :src='src' :alt='alt' @load='onLoad' :style='style' v-else>
		</Loading>
	</a>
</template>

<script>
import Loading from '../components/Loading.vue';

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
	},
	data() {
		return {
			isLoading: true,
		};
	},
	computed: {
		isImage()
		{ return this.mime && this.mime.startsWith('image'); },
		isVideo()
		{ return this.mime && this.mime.startsWith('video'); },
		linkStyle()
		{ return this.isLoading ? this.loadingStyle : null; },
	},
	mounted() {
		this.load();
	},
	methods: {
		onLoad() {
			this.isLoading = false;
			// don't ask me why the timeout is necessary, I don't know.
			setTimeout(this.load, 0.000001); // just set it to 1ns, I guess
		},
	},
}
</script>

<style scoped>
.media img, .media video {
	width: 100%;
}
</style>
