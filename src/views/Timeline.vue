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

<script>
import { khatch, saveToHistory } from '@/utilities';
import { postsHost } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Sidebar from '@/components/Sidebar.vue';
import Timestamp from '@/components/Timestamp.vue';
import Post from '@/components/Post.vue';
import DropDown from '@/components/DropDown.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';
import CheckBox from '@/components/CheckBox.vue';
import PostTile from '@/components/PostTile.vue';


const path = '/timeline';
export default {
	name: 'Timeline',
	data() {
		return {
			// undefined for on pageload stuff
			posts: undefined,
			page: null,
			count: null,
			errorDump: null,
			errorMessage: null,
			tiles: this.$store.state.searchResultsTiles,
		}
	},
	created() {
		this.fetchPosts();

		this.$watch(
			() => this.$route.query,
			this.fetchPosts,
		);
	},
	components: {
		Timestamp,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Post,
		DropDown,
		ResultsNavigation,
		CheckBox,
		PostTile,
	},
	computed: {
		pagesBeforeCurrent() {
			if (this.posts === null)
			{ return null; }

			if (this.page - 2 > 0)
			{ return [this.page - 2, this.page - 1]; }

			if (this.page - 1 > 0)
			{ return [this.page - 1]; }

			return [];
		},
		pagesAfterCurrent() {
			if (this.posts === null)
			{ return null; }

			if (this.posts.length >= this.count)
			{ return [this.page + 1, this.page + 2]; }
		},
	},
	methods: {
		fetchPosts() {
			if (this.$route.path !== path)
			{ return; }

			this.page = parseInt(this.$route.query?.page) || 1;
			this.count = parseInt(this.$route.query?.count) || 64;

			if (window.history.state.posts)
			{
				this.posts = window.history.state.posts;
				return;
			}

			this.posts = null;

			khatch(`${postsHost}/v1/timeline_posts`, {
					handleError: true,
					method: 'POST',
					body: {
						page: this.page,
						count: this.count,
					},
				})
				.then(response => {
					response.json().then(r => {
						saveToHistory({ posts: r })
						this.posts = r;
					});
				})
				.catch(() => { });
		},
		pageLink(page) {
			let query = [];

			if (page !== 1)
			{ query.push(`page=${page}`); }

			if (this.count !== 64)
			{ query.push(`count=${this.count}`); }

			return '/timeline?' + query.join('&');
		},
		setPage(page) {
			this.page = page;
			this.$router.push(this.pageLink(page));
		},
	},
	watch: {
		tiles(value) {
			this.$store.commit('searchResultsTiles', value);
		},
	},
}
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