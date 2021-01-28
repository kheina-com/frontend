<template>
	<a :href='src' class='media'>
		<img :src='src' :alt='alt' @load='load' style='{{style}}' v-if='isImage'>
		<video :src='src' :title='alt' :controls='controls' @load='load' style='{{style}}' v-else-if='isVideo' >Your browser does not support this type of video.</video>
	</a>
</template>

<script>
export default {
	name: 'Media',
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
		}
	},
	computed: {
		isImage()
		{ return this.mime.startsWith('image'); },
		isVideo()
		{ return this.mime.startsWith('video'); },
	},
}
</script>

<style scoped>
.media img, .media video {
	width: 100%;
}
</style>
