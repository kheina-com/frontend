<template>
	<main >
		<Error :dump='errorDump' :message='errorMessage'>
			<div>
				{{tagData}}
			</div>
			<div class='results'>
				<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{query}}</em></p>
				<Post v-for='post in posts || 3' :postId='post?.post_id' :nested='true' v-bind='post' v-else/>
			</div>
		</Error>
		<ThemeMenu />
	</main>
</template>

<script>
import { useRoute } from 'vue-router';
import { khatch, isMobile } from '@/utilities';
import { apiErrorMessage, postsHost, tagsHost } from '@/config/constants';
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
	name: 'Tag',
	props: {
		tag: String,
	},
	data() {
		return {
			tagData: null,
			posts: null,
			errorDump: null,
			errorMessage: null,
		}
	},
	mounted() {
		const route = useRoute();
		khatch(`${postsHost}/v1/fetch_posts`, {
				method: 'POST',
				body: {
					sort: route.query.sort ? route.query.sort : 'hot',
					tags: [this.tag],
				},
			})
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.posts = r.posts; }
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

		khatch(`${tagsHost}/v1/tag/${this.tag}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.tagData = r; }
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
		isLoading()
		{ return this.posts === null; },
		isError()
		{ return this.errorMessage !== null; },
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
.results {
	display: flex;
	flex-direction: column;
}
</style>

<style>
.post {
	margin: 0 0 25px;
}
.results > :last-child {
	margin-bottom: 0;
}
</style>