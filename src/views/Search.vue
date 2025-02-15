<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='buttons'>
		<div>
			<button v-if='false'><i class='material-icons'>notification_add</i></button>
			<DropDown v-model:value='sort' :options="[
				{ html: 'Newest', value: 'new' },
				{ html: 'Oldest', value: 'old' },
				{ html: 'Top', value: 'top' },
				{ html: 'Hot', value: 'hot' },
				{ html: 'Best', value: 'best' },
				{ html: 'Controversial', value: 'controversial' },
			]">
				<span class='sort-by'>
					<i class='material-icons-round'>sort</i>
					sort by
				</span>
			</DropDown>
		</div>
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
			<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{query}}</em></p>
			<li v-for='post in posts || count' v-else-if='tiles'>
				<PostTile :key='post?.post_id' :postId='post?.post_id' :nested='true' v-bind='post' link/>
			</li>
			<li v-for='post in posts || count' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length ? Math.ceil(total_results / count) : 0' v-if='posts'/>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { khatch, saveToHistory, tagSplit } from '@/utilities';
import { useRoute, useRouter } from 'vue-router';
import store, { Rating } from '@/globals';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Post from '@/components/Post.vue';
import DropDown from '@/components/DropDown.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';
import CheckBox from '@/components/CheckBox.vue';
import PostTile from '@/components/PostTile.vue';


const path = "/q/";
const routes: Set<string | void> = new Set(["home", "search"]);
const route = useRoute();
const router = useRouter();
const globals = store();

const props = defineProps({
	query: {
		type: String,
		default: null,
	},
});

// undefined for on pageload stuff
const posts: Ref<any[] | null | void> = ref();
const page: Ref<number> = ref(1);
const count: Ref<number> = ref(64);
const sort: Ref<string | undefined> = ref();
const total_results: Ref<number> = ref(1);
const tiles: Ref<boolean> = ref(globals.tiles);

fetchPosts();

function defaultSearch() {
	switch (globals.rating) {
	case Rating.mature :
		return ["-explicit"];
	case Rating.explicit :
		return [];
	default :
		return ["general"];
	}
}

function fetchPosts() {
	if (route.path.length > 1 && !route.path.startsWith(path)) return;
	if (posts.value === null || !routes.has(route.name?.toString())) return;

	page.value = route.query?.page ? parseInt(route.query.page.toString()) : page.value || 1;
	count.value = route.query?.count ? parseInt(route.query.count.toString()) : count.value || 64;
	sort.value = route.query?.sort ? route.query?.sort.toString() : "hot";

	// console.log(window.history.state)
	if (window.history.state.posts) {
		posts.value = window.history.state.posts;
		total_results.value = window.history.state.total;
		return;
	}

	posts.value = null;

	khatch(`${host}/v1/posts`, {
		method: "POST",
		body: {
			sort: sort.value,
			tags: props.query ? tagSplit(props.query) : defaultSearch(),
			page: page.value,
			count: count.value,
		},
		handleError: true,
	})
	.then(r => r.json())
	.then(r => {
		// if (this.$route.hash)
		// {}
		// console.log(this.$route)
		saveToHistory(r)
		posts.value = r.posts;
		total_results.value = r.total;
	}).catch(() => { });
}

function pageLink(p: number) {
	let url = props.query ? `/q/${props.query}` : "/";
	let query = [];

	if (p !== 1) {
		query.push(`page=${p}`);
	}

	if (count.value !== 64) {
		query.push(`count=${count.value}`);
	}

	if (sort.value !== "hot") {
		query.push(`sort=${sort.value}`);
	}

	return url + "?" + query.join("&");
}

function setPage(p: number) {
	page.value = p;
	router.push(pageLink(page.value));
}

// this.$watch(
// 	() => this.$route.hash,
// 	hash => history.replaceState(window.history.state, "", this.$route.path.replace("#", "")),
// );

watch(() => route.query, fetchPosts);
watch(tiles, globals.searchResultsTiles);
watch(sort, (_: string | undefined): void => {
	if (!routes.has(route.name?.toString())) return;
	router.push(pageLink(page.value));
});
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

.buttons {
	margin: 0 var(--margin);
	display: flex;
	justify-content: space-between;
}
.buttons button {
	color: var(--subtle);
	margin-right: var(--margin);
}
.buttons button:hover {
	color: var(--interact);
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
.checkbox {
	color: var(--subtle);
}

/* theme overrides */
.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 var(--margin);
}
</style>
