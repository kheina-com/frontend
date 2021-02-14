<template>
	<div>
		<h3>Tags</h3>
		<ul v-if='tags'>
			<li v-for='(value, name) in sortTagGroups(tags)'>
				<TagGroup :group='name' :tags='value' />
			</li>
		</ul>
		<ul v-else>
			<li v-for='i in 3' style='margin: 0 0 5px'>
				<Loading style='height: 1em' />
			</li>
		</ul>
	</div>
</template>

<script>
import { getMediaThumbnailUrl, sortTagGroups } from '../utilities'
import Loading from './Loading.vue'
import TagGroup from './TagGroup.vue'

export default {
	name: 'Sidebar',
	props: {
		tags: {
			type: Object,
			default: null,
		},
	},
	data() {
		return {
			post: null,
			errorDump: null,
			errorMessage: null,
		}
	},
	components: {
		Loading,
		TagGroup,
	},
	computed: {
		isLoading()
		{ return this.post === null; },
		isError()
		{ return this.errorDump !== null || this.errorMessage !== null; },
		mediaUrl()
		{ return this.post !== null ? getMediaThumbnailUrl(this.postId, this.post.filename) : ''; },
	},
	methods: {
		sortTagGroups,
	},
}
</script>

<style scoped>
h3 {
	margin: 0 12.5px 12px;
	border-bottom: solid 1px var(--bordercolor);
	padding: 0 12.5px 12px;
}

ul {
	list-style: none;
	margin: 0 25px 0;
	padding: 0;
}
</style>