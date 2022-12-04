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
				<PostTile :postId='post?.post_id' :nested='true' v-bind='post' labels/>
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
import { khatch, tagSplit } from '@/utilities';
import { apiErrorMessage, postsHost } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Timestamp from '@/components/Timestamp.vue';
import Post from '@/components/Post.vue';
import DropDown from '@/components/DropDown.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';
import CheckBox from '@/components/CheckBox.vue';
import PostTile from '@/components/PostTile.vue';


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
		Media,
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
		}
	},
	setup() {
	},
	created() {
		this.fetchPosts();

		this.$watch(
			() => this.$route.query,
			this.fetchPosts,
		);
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
			this.page = parseInt(this.$route.query?.page) || 1;
			this.count = parseInt(this.$route.query?.count) || 64;
			this.sort = this.$route.query?.sort || 'hot';

			this.posts = null;

			khatch(`${postsHost}/v1/fetch_posts`, {
					method: 'POST',
					body: {
						sort: this.sort,
						tags: this.query ? tagSplit(this.query) : [],
						page: this.page,
						count: this.count,
					},
				})
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{
							if (this.$store.state.scroll)
							{ setTimeout(() => { window.scrollTo(0, this.$store.state.scroll); this.$store.state.scroll = null; }, 0); }
							this.posts = r;
						}
						else if (response.status === 400)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 401)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 404)
						{ this.$store.commit('error', r.error); }
						else
						{ this.$store.commit('error', apiErrorMessage, r); }
					});
				})
				.catch(error => {
					this.$store.commit('error', apiErrorMessage, error);
					console.error(error);
				});
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
	background: var(--bg1color);
	position: relative;
	padding: 25px;
	display: block;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 25px;
}
ol > :last-child {
	margin-bottom: 0;
}

.tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-between;
	margin: -12.5px;
}

.tiles ol li {
	margin: 12.5px;
}

.page-links {
	margin-top: 25px;
}

.buttons {
	margin: 0 25px;
	display: flex;
	justify-content: space-between;
}
.buttons button {
	color: var(--subtle);
	margin-right: 25px;
}
.buttons button:hover {
	color: var(--icolor);
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
	color: var(--icolor);
}
.checkbox {
	color: var(--subtle);
}

/* theme overrides */
.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 25px;
}
</style>