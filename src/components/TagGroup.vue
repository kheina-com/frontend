<template>
	<!-- eslint-disable vue/no-use-v-if-with-v-for-->
	<!-- eslint-disable vue/require-v-for-key-->
	<Loading :isLoading='!tags'><h4>{{props.group.substr(0, 1).toUpperCase()}}{{props.group.substr(1).toLowerCase()}}</h4></Loading>
	<ol :class='props.group'>
		<li v-if='tags' :class='tag' v-for='tag in tags'>
			<router-link :to='`/t/${encodeURIComponent(tag.tag)}`'>
				{{tag.tag.replace(new RegExp(`_\\(${props.group}\\)$`), '').replace(/_/g, ' ')}}
			</router-link>
		</li>
		<li v-else v-for='i in loadingMap[props.group]'>
			<Loading><p>hello</p></Loading>
		</li>
	</ol>
</template>

<script setup lang="ts">
import Loading from '@/components/Loading.vue';

const props = defineProps<{
	group: "artist" | "sponsor" | "subject" | "species" | "gender" | "misc" | "rating",
	tags?: null | TagPortable[],
}>();

const loadingMap = {
	artist:  1,
	sponsor: 1,
	subject: 1,
	species: 3,
	gender:  1,
	misc:    5,
	rating:  1,
};
</script>

<style scoped>
ol {
	list-style: none;
	margin: 0 0 0 10px;
	padding: 0;
}
ol li {
	margin: 0 0 .5em 1em;
	text-indent: -1em;
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
