<template>
	<div>
		<h3>Tags</h3>
		<ul>
			<li v-if='tags !== null' v-for='(value, name) in tags'>
				<TagGroup :group='name' :tags='value' />
			</li>
		</ul>
	</div>
</template>

<script>
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
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
	},
	methods: {
	},
}
</script>

<style>
h3 {
	margin: 0 12px 12px;
	border-bottom: solid 1px var(--bordercolor);
	padding: 0 12px 12px;
}
ul {
	list-style: none;
	margin: 0 0 0 25px;
	padding: 0;
}
h4 {
	margin: 0.25em 0;
}
</style>
