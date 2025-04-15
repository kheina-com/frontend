<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='buttons'>
		<div>
			<CheckBox
				:border='false'
				id='search-results-tiles'
				name='search-results-tiles'
				class='checkbox'
				v-model:checked='tiles'
			>Tiles</CheckBox>
		</div>
	</div>
	<main>
		<ol class='results'>
			<p v-if='posts?.length === 0' style='text-align: center'>Your timeline is empty!</p>
			<li v-for='post in posts || 20' v-else-if='tiles'>
				<PostTile :key='post?.post_id' :postId='post?.post_id' :nested='true' v-bind='post' link/>
			</li>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length >= count ? 10000 : 0' v-if='posts'/>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import { ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/globals';
import { khatch, saveToHistory } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Post from '@/components/Post.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';
import CheckBox from '@/components/CheckBox.vue';
import PostTile from '@/components/PostTile.vue';

const path = "/tl";
const route = useRoute();
const router = useRouter();
const globals = store();

// undefined for on pageload stuff
const posts: Ref<any[] | null | void> = ref();
const page: Ref<number> = ref(1);
const count: Ref<number> = ref(64);
const tiles: Ref<boolean> = ref(globals.tiles);

fetchPosts();

function fetchPosts() {
	if (route.path !== path) return;

	page.value = route.query?.page ? parseInt(route.query.page.toString()) : page.value || 1;
	count.value = route.query?.count ? parseInt(route.query.count.toString()) : count.value || 64;
	posts.value = null;

	khatch(`${host}/v1/posts/timeline`, {
		method: "POST",
		errorHandlers: {
			401: () => router.push("/a/login?path=" + encodeURIComponent(route.fullPath)),
		},
		body: {
			page: page.value,
			count: count.value,
		},
	}).then(r => r.json())
	.then(r => {
		saveToHistory({ posts: r })
		posts.value = r;
	});
}

function pageLink(p: number) {
	let query = [];

	if (p !== 1)
	{ query.push(`page=${p}`); }

	if (count.value !== 64)
	{ query.push(`count=${count.value}`); }

	return page + "?" + query.join("&");
}

function setPage(p: number) {
	page.value = p;
	router.push(pageLink(page.value));
}

watch(() => route.query, fetchPosts);
watch(tiles, globals.searchResultsTiles);
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}

.tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: var(--neg-half-margin);
}
.tiles ol li {
	margin: var(--half-margin);
}

.page-links {
	margin-top: var(--margin);
}

.sort-dropdown {
	left: 50px;
}
.sort-dropdown button {
	display: inline-block;
}
.sort-by {
	display: flex;
	align-items: center;
	color: var(--subtle);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.sort-by i {
	margin-right: 0.25em;
}
.sort-by:hover {
	color: var(--interact);
}

/* theme overrides */
.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 var(--margin);
}
.buttons {
	margin: 0 var(--margin);
	display: flex;
	justify-content: end;
}
.buttons button {
	color: var(--subtle);
	margin-right: var(--margin);
}
.buttons button:hover {
	color: var(--interact);
}
</style>
