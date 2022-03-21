<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<ol class='results'>
			<p v-if='posts?.length === 0' style='text-align: center'>Your timeline is empty!</p>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length >= count ? 10000 : 0' v-if='posts'/>
		<ThemeMenu/>
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorDescriptionToast, apiErrorMessage, apiErrorMessageToast, postsHost } from '@/config/constants';
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


export default {
	name: 'Search',
	data() {
		return {
			// undefined for on pageload stuff
			posts: undefined,
			page: null,
			count: null,
			errorDump: null,
			errorMessage: null,
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
		Media,
		Post,
		DropDown,
		ResultsNavigation,
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
						if (this.$store.state.scroll)
						{ setTimeout(() => { window.scrollTo(0, this.$store.state.scroll); this.$store.state.scroll = null; }, 0); }
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

.page-links {
	margin-top: 25px;
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
	color: var(--icolor);
}

/* theme overrides */
.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 25px;
}
</style>