<template>
	<!-- eslint-disable vue/no-use-v-if-with-v-for-->
	<!-- eslint-disable vue/require-v-for-key-->
	<Loading :isLoading='tags === null'><h4>{{group.substr(0, 1).toUpperCase()}}{{group.substr(1).toLowerCase()}}</h4></Loading>
	<ol>
		<li v-if='tags !== null' v-for='tag in tags'>
			<router-link :to='`/q/${tag}`' :style='`color: var(--${tag})`' v-if='rating.has(tag)'>
				{{tag.replace(new RegExp(`_\\(${group}\\)$`), '').replace(/_/g, ' ')}}
			</router-link>
			<router-link :to='`/t/${tag}`' :style='`color: var(--${tagColorMap[group]})`' v-else>
				{{tag.replace(new RegExp(`_\\(${group}\\)$`), '').replace(/_/g, ' ')}}
			</router-link>
		</li>
		<li v-else v-for='i in loadingMap[group]'>
			<Loading><p>hello</p></Loading>
		</li>
	</ol>
</template>

<script>
import Loading from '@/components/Loading.vue';
import { tagColorMap } from '@/config/constants';

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
			tagColorMap,
			post: null,
			errorDump: null,
			errorMessage: null,
			loadingMap: {
				artist: 1,
				sponsor: 1,
				subject: 1,
				species: 3,
				gender: 1,
				misc: 3,
			},
			rating: new Set([
				'general',
				'mature',
				'explicit',
			]),
		};
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
ol {
	list-style: none;
	margin: 0 0 0 10px;
	padding: 0;
}
ol li {
	margin: 0 0 0.5em;
}
h4 {
	margin: 0.25em 0;
}
html.solarized-dark .loading, html.solarized-light .loading, html.midnight .loading {
	--bg2color: var(--bg1color);
}
</style>
