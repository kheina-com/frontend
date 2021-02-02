<template>
	<div class='container' v-if='!isError && !isMobile'>
		<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>
		<div class='content'>
			<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
			<main v-resize='onResize'>
				<Subtitle static='right' class='privacy' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
				<Title :isLoading='isLoading' size='2rem' static='left'>{{post? post.title : 'this is an example title'}}</Title>
				<router-link :to='`/darius`' class='profile-link'>
					<div class='inner'>
						<Loading :isLoading='isLoading' class='image'><img :src='mediaUrl'></Loading>
						<div class='user'>
							<Loading :isLoading='isLoading' span class='name'>{{post ? post?.user.name : 'user name'}}</Loading>
							<Loading :isLoading='isLoading' span class='handle'>@{{post ? post.user.handle : 'handle'}}</Loading>
						</div>
					</div>
				</router-link>
				<Loading :isLoading='isLoading' class='description' v-if='!post'><p>this is a very long example description</p></Loading>
				<Markdown v-else :content='post.description' />
				<Loading :isLoading='isLoading'><Subtitle static='left'>posted <Timestamp :time='post?.created' />{{isUpdated ? ' (edited ' : ''}}<Timestamp :time='post?.updated' v-if='isUpdated' />{{isUpdated ? ')' : ''}}</Subtitle></Loading>
				<ThemeMenu />
			</main>
		</div>
	</div>
	<div class='content' v-else-if='!isError && isMobile'>
		<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
		<div class='container'>
			<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>
			<main v-resize='onResize'>
				<Subtitle static='right' class='privacy' v-if='true'>{{post?.privacy}}</Subtitle>
				<Title :isLoading='isLoading' size='2rem' static='left'>{{post? post.title : 'this is an example title'}}</Title>
				<router-link :to='`/darius`' class='profile-link'>
					<div class='inner'>
						<Loading :isLoading='isLoading' class='image'><img :src='mediaUrl'></Loading>
						<div class='user'>
							<Loading :isLoading='isLoading' span class='name'>{{post ? post?.user.name : 'user name'}}</Loading>
							<Loading :isLoading='isLoading' span class='handle'>@{{post ? post.user.handle : 'handle'}}</Loading>
						</div>
					</div>
				</router-link>
				<Loading :isLoading='isLoading' class='description'><p>{{post ? post.description : 'this is a very long example description'}}</p></Loading>
				<Loading :isLoading='isLoading'><Subtitle static='left'>posted <Timestamp :time='post?.created' />{{isUpdated ? ' (edited ' : ''}}<Timestamp :time='post?.updated' v-if='isUpdated' />{{isUpdated ? ')' : ''}}</Subtitle></Loading>
				<ThemeMenu />
			</main>
		</div>
	</div>
	<Error :dump='errorDump' :message='errorMessage' v-else/>
</template>

<script>
import { getCookie, getMediaUrl, isMobile } from '../utilities';
import { apiErrorMessage, postsHost } from '../config/constants';
import Loading from '../components/Loading.vue';
import Title from '../components/Title.vue';
import Subtitle from '../components/Subtitle.vue';
import Error from '../components/Error.vue';
import ThemeMenu from '../components/ThemeMenu.vue';
import Media from '../components/Media.vue';
import Sidebar from '../components/Sidebar.vue';
import Timestamp from '../components/Timestamp.vue';
import Markdown from '../components/Markdown.vue';

export default {
	name: 'Post',
	props: {
		postId: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			post: null,
			errorDump: null,
			errorMessage: null,
			sidebarStyle: null,
		};
	},
	created() {
		fetch(`${postsHost}/v1/post/${this.postId}`,
			{
				credentials: 'include',
				headers: {
					'authorization': getCookie('kh-auth'),
				},
			})
			.then(response => {
				response.json()
					.then(r => {
						if (response.status < 300)
						{ this.post = r[this.postId]; }
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
	// mounted() {
	// 	this.onResize();
	// },
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
		Markdown,
	},
	computed: {
		isMobile,
		isLoading()
		{ return this.post === null; },
		isError()
		{ return this.errorMessage !== null; },
		isUpdated()
		{ return this.post !== null ? Math.round(this.post.created) !== Math.round(this.post.updated) : false; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		mediaElement() {
			let media = document.getElementsByClassName('media');
			if (media.length > 0)
			{ return media[0]; }
			return null;
		},
		showPrivacy()
		{ return this.post?.privacy != 'public'; }
	},
	methods: {
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
			{ this.mediaElement.style = 'margin: 0 auto 25px; right: 10vw'; }
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
	background: var(--bgcolor);
	grid-area: main;
	border-radius: 3px 0 0 3px;
	display: flex;
	flex-direction: column;
	align-items: start;
	position: relative;
	padding: 25px;
	overflow: hidden;
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
.privacy {
	position: absolute;
	right: 25px;
}
.content {
	grid-area: main;
	display: flex;
	flex-direction: column;
}
.description {
	font-size: 1.3em;
	margin: 0 0 25px;
}
.profile-link {
	display: inline-block;
	align-items: center;
	margin: 0.25em auto 25px 0;
}
.profile-link .inner {
	display: flex;
	align-items: center;
}
.profile-link .image {
	border-radius: 3px;
}
.profile-link .image, .profile-link .image img {
	width: 50px;
	height: 50px;
}
.profile-link .user {
	display: inline-block;
	margin: 0 0 0 0.5em;
	display: flex;
	flex-direction: column;
	align-items: start;
}
.profile-link .name {
	font-size: 1.3em;
	margin: 0 0 0.1em;
}
.profile-link .handle {
	color: var(--subtlecolor);
}
@media screen and (min-width:1000px) {

}
</style>