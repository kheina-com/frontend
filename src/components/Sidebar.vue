<template>
	<div>
		<h3>Tags</h3>
		<ol v-if='tags'>
			<li v-for='(value, name) in sortTagGroups(tags)'>
				<TagGroup :group='name' :tags='value' />
			</li>
		</ol>
		<ol v-else>
			<li v-for='name in tagGroups'>
				<TagGroup :group='name' />
			</li>
		</ol>
	</div>
</template>

<script>
import { getMediaThumbnailUrl, sortTagGroups } from '@/utilities'
import { tagGroups } from '@/config/constants'
import Loading from '@/components/Loading.vue'
import TagGroup from '@/components/TagGroup.vue'

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
			tagGroups,
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
	border-bottom: 1px solid var(--bordercolor);
	padding: 0 12.5px 12px;
}

ol {
	list-style: none;
	margin: 0 25px 0;
	padding: 0;
}
</style>