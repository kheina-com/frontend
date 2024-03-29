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
			<li v-for='post in posts || 20' v-else-if='tiles'>
				<PostTile :key='post?.post_id' :postId='post?.post_id' :nested='true' v-bind='post' link/>
			</li>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length ? Math.ceil(total_results / count) : 0' v-if='posts'/>
		<ThemeMenu/>
	</main>
</template>

<script>
import { khatch, saveToHistory, tagSplit } from '@/utilities';
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


const path = '/q/';
const routes = new Set(['home', 'search']);


export default {
	name: 'Search',
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
	props: {
		query: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			// undefined for on pageload stuff
			posts: undefined,
			page: null,
			count: null,
			sort: null,
			tiles: this.$store.state.searchResultsTiles,
			total_results: 0,
		}
	},
	setup() {
	},
	created() {
		this.fetchPosts();

		// this.$watch(
		// 	() => this.$route.hash,
		// 	hash => history.replaceState(window.history.state, '', this.$route.path.replace('#', '')),
		// );

		this.$watch(
			() => this.$route.query,
			this.fetchPosts,
		);
	},
	methods: {
		defaultSearch() {
			switch (this.$store.state.maxRating) {
				case 1 :
					return ['-explicit'];
				case 2 :
					return [];
				default :
					return ['general'];
			}
		},
		fetchPosts() {
			if (this.$route.path.length > 1 && !this.$route.path.startsWith(path))
			{ return; }

			if (this.posts === null || !routes.has(this.$route.name))
			{ return; }

			this.page = parseInt(this.$route.query?.page) || 1;
			this.count = parseInt(this.$route.query?.count) || 64;
			this.sort = this.$route.query?.sort || 'hot';

			// console.log(window.history.state)
			if (window.history.state.posts)
			{
				this.posts = window.history.state.posts;
				this.total_results = window.history.state.total;
				return;
			}

			this.posts = null;

			khatch(`${postsHost}/v1/posts`, {
					method: 'POST',
					body: {
						sort: this.sort,
						tags: this.query ? tagSplit(this.query) : this.defaultSearch(),
						page: this.page,
						count: this.count,
					},
					handleError: true,
				})
				.then(response => {
					response.json().then(r => {
						// if (this.$route.hash)
						// {}
						// console.log(this.$route)
						saveToHistory(r)
						this.posts = r.posts;
						this.total_results = r.total;
					});
				})
				.catch(() => { });
		},
		pageLink(page) {
			let url = this.query ? `/q/${this.query}` : '/';

			let query = [];

			if (page !== 1)
			{ query.push(`page=${page}`); }

			if (this.count !== 64)
			{ query.push(`count=${this.count}`); }

			if (this.sort !== 'hot')
			{ query.push(`sort=${this.sort}`); }

			return url + '?' + query.join('&');
		},
		setPage(page) {
			this.page = page;
			this.$router.push(this.pageLink(page));
		},
	},
	watch: {
		sort() {
			if (!routes.has(this.$route.name))
			{ return; }
			this.$router.push(this.pageLink(this.page));
		},
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