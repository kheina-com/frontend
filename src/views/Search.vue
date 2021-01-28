<template>
	<main v-if='!isError'>
		<Loading :isLoading='isLoading'>
			<h2>Results</h2>
			<ul>
				<li v-if='!isLoading' v-for='post in posts'>
					<router-link :to='`/p/${post.post_id}`' class='profile-link'>
						<img :src='getMediaThumbnailUrl(post.post_id, 400)'>
						{{post.title ? post.title : post.post_id}}
					</router-link>
				</li>
			</ul>
		</Loading>
		<ThemeMenu />
	</main>
	<main v-else>
		<Error :dump='errorDump' :message='errorMessage' />
		<ThemeMenu />
	</main>
</template>

<script>
import { tagSplit, getMediaThumbnailUrl, isMobile } from '../utilities';
import { apiErrorMessage } from '../config/constants';
import Loading from '../components/Loading.vue';
import Title from '../components/Title.vue';
import Subtitle from '../components/Subtitle.vue';
import Error from '../components/Error.vue';
import ThemeMenu from '../components/ThemeMenu.vue';
import Media from '../components/Media.vue';
import Sidebar from '../components/Sidebar.vue';
import Timestamp from '../components/Timestamp.vue';
import { useRoute } from 'vue-router';


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
			errorDump: null,
			errorMessage: null,
			sidebarStyle: null,
		}
	},
	created() {
		const route = useRoute();
		fetch('http://dev.kheina.com/posts/v1/fetch_posts', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					sort: route.query.sort ? route.query.sort : 'hot',
					tags: tagSplit(this.query),
				}),
			}
		).then(response => {
				response.json()
					.then(r => {
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

		window.addEventListener('resize', this.onResize);
	},
	destroyed() {
		window.removeEventListener('resize', this.onResize);
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
	},
	computed: {
		isMobile,
		isLoading()
		{ return this.result === null; },
		isError()
		{ return this.errorMessage !== null; },
		mediaElement()
		{
			let media = document.getElementsByClassName('media');
			if (media.length > 0)
			{ return media[0]; }
			return null;
		},
	},
	methods: {
		getMediaThumbnailUrl,
		onResize()
		{
			if (!this.mediaElement)
			{ return; }

			if (this.isMobile)
			{
				this.mediaElement.style = 'margin: 0 auto 25px; max-width: 100%';
				return;
			}

			let rect = this.mediaElement.getBoundingClientRect();
			let right = window.innerWidth - rect.right;
			let margin = Math.max(window.innerWidth * 0.2, 200) - 0.1;

			if (rect.left < margin)
			{ this.mediaElement.style = 'margin: 0 auto 25px 0'; }
			else if (rect.left < right - 0.1)
			{ this.mediaElement.style = 'margin: 0 auto 25px; right: calc(10vw)'; }
		},
	},
}
</script>

<style scoped>
.container {
	display: grid;
	grid-template-columns: [sidebar-start] max(20vw, 200px) [sidebar-end main-start] auto [main-end];
	grid-template-rows: [sidebar-start main-start] auto [sidebar-end main-end];
}
main {
	grid-area: main;
	border-radius: 3px 0 0 3px;
}
.media {
	grid-area: media;
	margin: 0 auto 25px 0;
	position: relative;
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
	max-width: calc(100vw - max(20vw, 200px) - 25px);
}
.sidebar {
	grid-area: sidebar;
	position: relative;
	margin: 0;
}
.content {
	grid-area: main;
	display: flex;
	flex-direction: column;
}
.description {
	font-size: 1.4em;
	margin: 0 0 25px;
}
.profile-link {
	display: inline-block;
	align-items: center;
	margin: 0 auto 25px 0;
}
.profile-link img {
	width: 50px;
	height: 50px;
	border-radius: 3px;
}
.profile-link .user {
	display: inline-block;
	margin: 0 0 0 0.5em;
}
.profile-link .name {
	font-size: 1.3em;
}
.profile-link .handle {
	color: var(--subtlecolor);
}
@media screen and (min-width:1000px) {

}
</style>