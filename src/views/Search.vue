<template>
	<main v-if='!isError'>
		<ol class='results'>
			<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{query}}</em></p>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<div class='page-links' v-if='page !== 1 || posts?.length >= count'>
			<router-link :to='pageLink(page - 1)' v-if='page > 1'>
				◄
			</router-link>
			<router-link :to='pageLink(page)' v-for='page in pagesBeforeCurrent'>
				{{page}}
			</router-link>
			<b>
				{{page}}
			</b>
			<router-link :to='pageLink(page)' v-for='page in pagesAfterCurrent'>
				{{page}}
			</router-link>
			<router-link :to='pageLink(page + 1)' v-if='posts?.length >= count'>
				►
			</router-link>
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
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Timestamp from '@/components/Timestamp.vue';
import Post from '@/components/Post.vue';


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
			posts: null,
			page: null,
			count: null,
			errorDump: null,
			errorMessage: null,
		}
	},
	mounted() {
		this.page = parseInt(this.$route.query.page || 1);
		this.count = parseInt(this.$route.query.count || 64);
		this.fetchPosts();
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
			khatch(`${postsHost}/v1/fetch_posts`, {
					method: 'POST',
					body: {
						sort: this.$route.query.sort ? this.$route.query.sort : 'hot',
						tags: this.query ? tagSplit(this.query) : [],
						page: this.page,
						count: this.count,
					},
				})
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{ this.posts = r; }
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

			if (this.$route.query.count && this.count !== 64)
			{ query.push(`count=${this.count}`); }

			return url + '?' + query.join('&');
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
.page-links a, .page-links b {
	padding: 0.25em 0.5em;
}
</style>