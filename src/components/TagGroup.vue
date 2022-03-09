<template>
	<!-- eslint-disable vue/no-use-v-if-with-v-for-->
	<!-- eslint-disable vue/require-v-for-key-->
	<Loading :isLoading='tags === null'><h4>{{group.substr(0, 1).toUpperCase()}}{{group.substr(1).toLowerCase()}}</h4></Loading>
	<ol :class='group'>
		<li v-if='tags !== null' :class='tag' v-for='tag in tags'>
			<router-link :to='`/t/${tag}`'>
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
			loadingMap: {
				artist: 1,
				sponsor: 1,
				subject: 1,
				species: 3,
				gender: 1,
				misc: 5,
				rating: 1,
			},
		};
	},
	components: {
		Loading,
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

.artist a {
	color: var(--pink);
}

.sponsor a {
	color: var(--green);
}

.subject a {
	color: var(--violet);
}

.species a {
	color: var(--orange);
}

.gender a {
	color: var(--blue);
}

.misc a {
	color: var(--subtle);
}


/* theme overrides */
html.e621 .subject a {
	color: var(--green);
}

html.e621 .sponsor a {
	color: var(--violet);
}
</style>
