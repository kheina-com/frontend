<template>
	<h4>{{group}}</h4>
	<ul>
		<li v-if='tags !== null' v-for='tag in tags'>
			<router-link :to='`/s/${tag}`' :style='`color: var(${colorMap[group]})`'>
				{{tag}}
			</router-link>
		</li>
	</ul>
</template>

<script>
import Loading from './Loading.vue'

export default {
	name: 'TagGroup',
	props: {
		group: {
			type: String,
			default: null,
		},
		tags: {
			type: Array[String], 
			default: null,
		},
	},
	data() {
		return {
			post: null,
			errorDump: null,
			errorMessage: null,
			colorMap: {
				artist: '--pink',
				sponsor: '--green',
				participant: '--violet',
				species: '--red',
				gender: '--blue',
				misc: '--cyan',
			},
		}
	},
	components: {
		Loading,
	},
	computed: {
		isLoading()
		{ return this.post === null; },
		isError()
		{ return this.errorDump !== null || this.errorMessage !== null; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
	},
	methods: {
		getColorGroup(tagGroup) {
		},
	},
}
</script>

<style scoped>

</style>
