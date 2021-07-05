<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<DropDown class='sort-dropdown' v-model:value='sort' :options="[
		{ name: 'Hot', value: 'hot' },
		{ name: 'Top', value: 'top' },
		{ name: 'Best', value: 'best' },
		{ name: 'Newest', value: 'new' },
		{ name: 'Oldest', value: 'old' },
		{ name: 'Controversial', value: 'controversial' },
	]">
		<span class='sort-by'>
			<i class='material-icons-round'>sort</i>
			sort by
		</span>
	</DropDown>
	<main v-if='!isError'>
		<ol class='results'>
			<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{query}}</em></p>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<div class='page-links' v-if='page !== 1 || posts?.length >= count'>
			<button @click='setPage(page - 1)' v-if='page > 1'>
				◄
			</button>
			<button @click='setPage(toPage)' v-for='toPage in pagesBeforeCurrent'>
				{{toPage}}
			</button>
			<b>
				{{page}}
			</b>
			<button @click='setPage(toPage)' v-for='toPage in pagesAfterCurrent'>
				{{toPage}}
			</button>
			<button @click='setPage(page + 1)' v-if='posts?.length >= count'>
				►
			</button>
		</div>
		<ThemeMenu />
	</main>
	<main v-else>
		<Error v-model:dump='errorDump' v-model:message='errorMessage' />
		<ThemeMenu />
	</main>
</template>

<script>
import { khatch, tagSplit, isMobile } from '@/utilities';
import { apiErrorMessage, postsHost } from '@/config/constants';
import Loading from '@/components/Loading';
import Title from '@/components/Title';
import Subtitle from '@/components/Subtitle';
import Error from '@/components/Error';
import ThemeMenu from '@/components/ThemeMenu';
import Media from '@/components/Media';
import Sidebar from '@/components/Sidebar';
import Timestamp from '@/components/Timestamp';
import Post from '@/components/Post';
import DropDown from '@/components/DropDown';


export default {
	name: 'Search',
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
			errorDump: null,
			errorMessage: null,
			sort: null,
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
	components: {
		Timestamp,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Error,
		Media,
		Post,
		DropDown,
	},
	computed: {
		isMobile,
		isError()
		{ return this.errorMessage !== null; },
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
						else if (response.status === 401)
						{ this.errorMessage = r.error; }
						else if (response.status === 404)
						{ this.errorMessage = r.error; }
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
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
			this.$router.push(this.pageLink(this.page));
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
	text-align: center;
	margin-top: 25px;
}
.page-links button, .page-links b {
	padding: 0.25em 0.5em;
}
.page-links b {
	color: var(--subtle);
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
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
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