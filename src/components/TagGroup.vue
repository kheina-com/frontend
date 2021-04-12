<template>
	<!-- eslint-disable vue/no-use-v-if-with-v-for-->
	<!-- eslint-disable vue/require-v-for-key-->
	<Loading :isLoading='tags === null'><h4>{{group}}</h4></Loading>
	<ul>
		<li v-if='tags !== null' v-for='tag in tags'>
			<router-link :to='`/s/${tag}`' :style='`color: var(${colorMap[group]})`'>
				{{tag.replace(/_/g, ' ')}}
			</router-link>
		</li>
		<li v-else v-for='i in loadingMap[group]'>
			<Loading><p>hello</p></Loading>
		</li>
	</ul>
</template>

<script>
import Loading from '@/components/Loading.vue'

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
				misc: '--subtlecolor',
			},
			loadingMap: {
				artist: 1,
				sponsor: 1,
				participant: 1,
				species: 3,
				gender: 1,
				misc: 3,
			},
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
ul {
	list-style: none;
	margin: 0 0 0 25px;
	padding: 0;
}
ul li {
	margin: 0 0 0.5em;
}
h4 {
	margin: 0.25em 0;
}
html.solarized-dark .loading, html.solarized-light .loading {
	--bg2color: var(--bg1color);
}
</style>
