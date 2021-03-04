<template>
	<Error :dump='errorDump' :message='errorMessage'>
		<div class='container' v-if='!isMobile'>
			<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>
			<div class='content'>
				<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
				<main v-resize='onResize'>
					<div class='post-header'>
						<Score :score='post?.score' :postId='postId' />
						<div>
							<input ref='title' v-if='editing' class='interactable text' :value='post?.title'>
							<Title v-else :isLoading='isLoading' size='2em' static='left'>{{post?.title || 'this is an example title'}}</Title>
							<div class='privacy'>
								<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
								<button class='interactable edit-button' v-if='post?.user_is_uploader' @click='editToggle'><i class='material-icons-round'>{{editing ? 'close' : 'mode_edit'}}</i></button>
							</div>
							<Profile :isLoading='isLoading' :username='post?.user.name' :handle='post?.user.handle' />
						</div>
					</div>
					<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
					<div v-else-if='editing' style='width: 100%'>
						<textarea ref='description' class='interactable text'>{{post?.description}}</textarea>
						<button @click='updatePost' class='interactable update-button'>update</button>
					</div>
					<Markdown v-else :content='post.description' style='margin: 0 0 25px' />
					<Loading :isLoading='isLoading'><Subtitle static='left'>posted <Timestamp :datetime='post?.created' />{{isUpdated ? ' (edited ' : ''}}<Timestamp :datetime='post?.updated' v-if='isUpdated' />{{isUpdated ? ')' : ''}}</Subtitle></Loading>
					<ThemeMenu />
				</main>
			</div>
		</div>
		<div class='content' v-else-if='isMobile'>
			<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
			<div class='container'>
				<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>
				<main v-resize='onResize'>
					<Subtitle static='right' class='privacy' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
					<Title :isLoading='isLoading' size='2rem' static='left'>{{post?.title || 'this is an example title'}}</Title>
					<Profile :isLoading='isLoading' :username='post?.user.name' :handle='post?.user.handle' />
					<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
					<Markdown v-else :content='post.description' style='margin: 0 0 25px' />
					<Loading :isLoading='isLoading'><Subtitle static='left'>posted <Timestamp :datetime='post?.created' />{{isUpdated ? ' (edited ' : ''}}<Timestamp :datetime='post?.updated' v-if='isUpdated' />{{isUpdated ? ')' : ''}}</Subtitle></Loading>
					<ThemeMenu />
				</main>
			</div>
		</div>
	</Error>
</template>

<script>
import { ref } from 'vue';
import { khatch, getMediaUrl, isMobile } from '../utilities';
import { apiErrorMessage, postsHost, uploadHost } from '../config/constants';
import Loading from '../components/Loading.vue';
import Title from '../components/Title.vue';
import Subtitle from '../components/Subtitle.vue';
import Error from '../components/Error.vue';
import ThemeMenu from '../components/ThemeMenu.vue';
import Media from '../components/Media.vue';
import Sidebar from '../components/Sidebar.vue';
import Timestamp from '../components/Timestamp.vue';
import Markdown from '../components/Markdown.vue';
import Profile from '../components/Profile.vue';
import Score from '../components/Score.vue';

export default {
	name: 'Post',
	props: {
		postId: {
			type: String,
			default: null,
		},
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
		Profile,
		Score,
	},
	setup() {
		const description = ref(null);
		const title = ref(null);
		return {
			description,
			title,
		};
	},
	data() {
		return {
			editing: false,
			post: null,
			errorDump: null,
			errorMessage: null,
			sidebarStyle: null,
		};
	},
	created() {
		khatch(`${postsHost}/v1/post/${this.postId}`)
			.then(response => {
				response.json().then(r => {
					console.log(r);
					if (response.status < 300)
					{ this.post = r; }
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
	unmounted() {
		window.removeEventListener('resize', this.onResize);
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
		{ return this.post?.privacy != 'public'; },
		showEdit()
		{ return true; },
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
		editToggle() {
			this.editing = !this.editing;
		},
		updatePost() {
			khatch(`${uploadHost}/v1/update_post`, {
					method: 'POST',
					body: {
						post_id: this.postId,
						title: this.$refs.title.value,
						description: this.$refs.description.value,
					},
				})
				.then(response => {
					response.json().then(r => {
						console.log(r);
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
			this.post.title = this.$refs.title.value;
			this.post.description = this.$refs.description.value;
			this.post.updated = Date.now();
			this.editing = false;
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
	background: var(--bg1color);
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
	display: flex;
	position: absolute;
	right: 25px;
	align-items: center;
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
.profile {
	margin-top: 0.25em;
}
.post-header {
	display: flex;
	margin-bottom: 25px;
}
.edit-button {
	margin-left: 0.5em;
	padding: 0.25em;
}
.edit-button i {
	display: block;
}
.score {
	margin-right: 10px;
	margin-left: -10px;
}
form {
	width: 100%;
}
textarea {
	width: 100%;
	height: 30em;
	margin: 0 0 25px;
	background: var(--bg2color);
	color: var(--textcolor);
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	padding: 0.5em;
}
.update-button {
	position: absolute;
	right: 25px;
	bottom: 25px;
}
input {
	display: block;
}
</style>