<template>
	<!-- eslint-disable vue/valid-v-for -->
	<Error :dump='errorDump' :message='errorMessage'>
		<div ref='header' class='header' :style='`background-image: url("https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png")`'>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
		</div>
		<main ref='main'>
		<div ref='profile' class='user'>
			<Loading :isLoading='isIconLoading' class='profile-image'>
				<button class='thumbnail' v-if='isEditing' @click='toggleIconUpload'>
					<div class='add-image-button'>
						<i class='material-icons-round'>add_a_photo</i>
					</div>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading'/>
				</button>
				<router-link :to='`/p/${user?.icon}`' class='thumbnail' v-else>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading'/>
				</router-link>
			</Loading>
			<div class='profile-buttons'>
				<div class='tabs'>
					<button @click='selectTab' class='posts'>
						Posts
					</button>
					<div class='separator'></div>
					<button @click='selectTab' class='tags'>
						Tags
					</button>
					<div class='separator'></div>
					<button @click='selectTab' class='favs'>
						Favorites
					</button>
					<div class='separator' v-if='isSelf'></div>
					<button @click='selectTab' class='uploads' v-if='isSelf'>
						<i class='material-icons' title='this tab is only visible to you'>lock</i>
						Uploads
					</button>
				</div>
				<Button @click='following = !following' :red='following'>
					<i class='material-icons'>{{following ? 'person_off' : 'person_add_alt'}}</i>
					{{following ? 'Unfollow' : 'Follow'}}
				</Button>
			</div>
		</div>
			<div class='user-info'>
				<p class='user-field' v-if='!isEditing'><i class='material-icons'>schedule</i><Loading :isLoading='!user' span>{{isMobile ? '' : 'Joined '}}<Timestamp :datetime='user?.created' :short='isMobile'/></Loading></p>
				<div class='user-field' v-if='isEditing'>
					<i class='material-icons'>public</i>
					<input v-model='user.website' class='interactable text'>
				</div>
				<p v-else-if='user?.website' class='user-field'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
				<div class='user-name'>
					<input v-model='user.name' class='interactable text' v-if='isEditing'>
					<h2 v-else>
						<Loading :isLoading='!user' span>{{user?.name || 'username'}}</Loading>
						<i class='material-icons' v-if='user?.privacy === "private"' :title="`@${user.handle}'s account is private`">lock</i>
						<i class='kheina-icons' v-if='user?.admin' :title="`@${user.handle} is an admin`">sword</i>
						<i class='material-icons' v-else-if='user?.mod' :title="`@${user.handle} is a moderator`">verified_user</i>
						<i class='material-icons-round' v-else-if='user?.verified' :title="`@${user.handle} is a verified artist`">verified</i>
					</h2>
					<p><Loading :isLoading='!user' span>@{{user?.handle || 'handle'}}</Loading></p>
				</div>
			</div>
			<MarkdownEditor v-model:value='user.description' class='description' v-if='isEditing'/>
			<Markdown :content='user?.description' class='description' v-else/>
			<Button class='interactable edit-profile-button' title='Edit profile' @click='toggleEdit' v-if='isSelf'>
				<i class='material-icons'>{{isEditing ? 'edit_off' : 'edit'}}</i>
				{{isEditing ? 'Cancel' : 'Edit Profile'}}
			</Button>
			<div v-show='tab === "posts"'>
				<ol class='results'>
					<p v-if='posts?.length === 0' style='text-align: center'>{{user?.name || handle}} hasn't made any posts yet.</p>
					<li v-for='post in posts || 3' v-else>
						<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
					</li>
				</ol>
			</div>
			<div v-show='tab === "tags"'>
				<div class='results'>
					<p v-if='!userTags' style='text-align: center'>loading tags...</p>
					<p v-else-if='userTags?.length === 0' style='text-align: center'>{{user?.name || handle}} has no tags.</p>
					<ul class='tags' v-else>
						<li v-for='tag in userTags'>
							<Tag :inheritedTags='tag.inherited_tags' v-bind='tag'/>
						</li>
					</ul>
				</div>
			</div>
			<div v-show='tab === "favs"'>
				<p style='text-align: center'>hey, this tab doesn't exist yet.</p>
			</div>
			<div v-show='tab === "uploads"'>
				<ol class='results'>
					<p v-if='posts?.length === 0' style='text-align: center'>you haven't made any posts yet.</p>
					<li v-for='post in posts || 3' v-else>
						<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
					</li>
				</ol>
			</div>
			<ThemeMenu/>
		</main>
		<div class='image-uploader' v-if='isUploadBanner || isUploadIcon' @mousedown='disableUploads'>
			<div style='background: var(--bg2color)' @mousedown.stop>
				<Cropper
					ref='cropper'
					src='https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png'
					:stencil-props='{
						aspectRatio: isUploadBanner ? 4 : 1,
					}'
					:style='`height: 800px; width: 800px`'
				/>
				<Button @click.prevent.stop='showData'><i class='material-icons'>science</i>test</Button>
			</div>
		</div>
	</Error>
</template>

<script>
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { khatch, setTitle, isMobile } from '@/utilities';
import { apiErrorMessage, postsHost, usersHost , tagsHost} from '@/config/constants';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Submit from '@/components/Submit.vue'
import Thumbnail from '@/components/Thumbnail.vue';
import Markdown from '@/components/Markdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Post from '@/components/Post.vue';
import Tag from '@/components/Tag.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';


export default {
	name: 'User',
	props: {
		handle: {
			type: String,
			default: null,
		},
		resizeTrigger: Boolean,
	},
	components: {
		Cropper,
		Submit,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Error,
		Media,
		Thumbnail,
		Markdown,
		Timestamp,
		Post,
		Button,
		Tag,
		MarkdownEditor,
	},
	setup() {
		const main = ref(null);
		const header = ref(null);
		const profile = ref(null);
		const cropper = ref(null);

		return {
			main,
			header,
			profile,
			cropper,
		};
	},
	data() {
		return {
			isIconLoading: true,
			errorMessage: null,
			errorDump: null,
			user: null,
			posts: null,
			isEditing: false,
			isUploadIcon: false,
			isUploadBanner: false,
			userTags: null,
			tabElement: null,
			tab: 'posts',
			following: false,
		};
	},
	created() {
		const tabs = new Set(['posts', 'tags', 'favs']);

		if (tabs.has(this.$route.query?.tab))
		{ this.tab = this.$route.query.tab; }

		khatch(`${usersHost}/v1/fetch_user/${this.handle}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.user = r;
						setTitle(this.user?.name ? `${this.user.name} (@${this.user.handle}) - kheina.com` : `@${this.user.handle} - kheina.com`);
						this.$router.replace(this.$route.fullPath.replace(this.handle, this.user.handle));
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

			this.fetchData();
	},
	mounted() {
		this.tabElement = document.querySelector(`button.${this.tab}`);
		this.tabElement.style.borderBottomWidth = '5px';
		this.tabElement.style.paddingBottom = '20px';
		if (this.$route.query?.edit)
		{ this.isEditing = true; }
	},
	computed: {
		isMobile,
		isSelf() {
			return this.$store.state.user && this.$store.state.user?.handle === this.user?.handle;
		},
	},
	methods: {
		selectTab(event) {
			this.tabElement.style.borderBottomWidth = '0';
			this.tabElement.style.paddingBottom = '25px';
			this.tab = event.target.className;
			event.target.style.borderBottomWidth = '5px';
			event.target.style.paddingBottom = '20px';
			this.tabElement = event.target;

			this.fetchData();
		},
		fetchData() {
			switch (this.tab) {
				case 'posts' :
					this.posts = null;

					khatch(`${postsHost}/v1/fetch_user_posts`, {
							method: 'POST',
							body: {
								handle: this.handle,
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
					break;

				case 'tags' :
					this.userTags = null;

					khatch(`${tagsHost}/v1/get_user_tags/${this.handle}`)
						.then(response => {
							response.json().then(r => {
								if (response.status < 300)
								{ this.userTags = r; }
								else if (response.status === 401)
								{ this.errorMessage = r.error; }
								else if (response.status === 404)
								{ this.userTags = []; }
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
					break;

				case 'favs' :
					// nothing, yet
					break;

				case 'uploads' :
					this.posts = null;

					khatch(`${postsHost}/v1/fetch_my_posts`, {
							method: 'POST',
							body: {
								sort: 'hot',
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
					break;
			}
		},
		toggleEdit() {
			this.isEditing = !this.isEditing;
		},
		toggleIconUpload() {
			this.isUploadIcon = true;
		},
		toggleBannerUpload() {
			this.isUploadBanner = true;
		},
		disableUploads() {
			this.isUploadBanner = this.isUploadIcon = false;
		},
		onImageCrop({ coordinates, canvas }) {
			console.log(coordinates, canvas);
		},
		showData() {
			console.log(this.$refs.cropper.getResult());
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 0 25px 25px;
	margin: 0 auto;
}

.user-name {
	white-space: nowrap;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}
.user-name h2 {
	margin: 0;
	display: flex;
	align-items: center;
	text-align: right;
	position: absolute;
	top: -1.3em;
}
.user-name h2 i {
	font-size: 1em;
	margin-left: 0.25em;
}

.user-field {
	display: flex;
	align-items: center;
}
.user-field span button {
	color: var(--textcolor);
}
.user-field span button:hover {
	color: var(--icolor);
}

.profile-image {
	border-radius: 5px;
	border: solid 3px var(--bordercolor);
	background: var(--bg2color);
	overflow: hidden;
}
.thumbnail {
	display: flex;
	position: relative;
}
.thumbnail, .thumbnail img, .thumbnail video {
	width: 12.5em;
	height: 12.5em;
}
.mobile .thumbnail, .mobile .thumbnail img, .mobile .thumbnail video {
	width: 8em;
	height: 8em;
}


.header {
	top: 0;
	height: 25vw;
	width: 100%;
	position: relative;
	background-size: cover;
	background-position: center;
}

.user {
	width: 70vw;
	margin: 0 auto -6em;
	top: calc(-6.25em - 3px);
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	padding: 0;
	z-index: 1;
	position: relative;
	pointer-events: none;
}
.user * {
	pointer-events: all;
}
.mobile .user {
	top: calc(-4em - 3px);
	margin-bottom: calc(-4em + 22px);
	width: auto;
}

.edit-profile-button {
	margin: 0 auto 25px;
}
.user-field i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
.results > :last-child {
	margin-bottom: 0;
}

ul, ol {
	list-style: none;
	margin: 0;
	padding: 0;
}

.profile-buttons {
	position: absolute;
	top: calc(6.25em + 3px);
	left: calc(12.5em + 6px);
	width: calc(100% - 12.5em - 6px);
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.mobile .profile-buttons {
	top: calc(4em + 3px);
	left: calc(8em + 6px);
	width: calc(100% - 8em - 6px);
}

.tabs {
	display: flex;
}
.tabs button {
	padding: 25px;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	border-bottom: solid 0 var(--icolor);
}
.tabs .separator {
	background: var(--bordercolor);
	width: 1px;
}

.uploads {
	display: flex;
	justify-content: center;
}
.uploads i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}

.user-info {
	width: 70vw;
	margin: 0 auto 25px;
	display: flex;
	justify-content: space-between;
	position: relative;
}
.mobile .user-info {
	width: auto;
}

ol.results li {
	margin: 0 0 25px;
}
ol.results > :last-child {
	margin-bottom: 0;
}

ul.tags li {
	display: block;
	margin: 0 0 25px;
}
ul.tags > :last-child {
	margin-bottom: 0;
}
/* ===== editing ===== */
.add-image-button {
	background: #0005;
	width: 100%;
	height: 100%;
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
}
.add-image-button i {
	font-size: 70px;
}
.image-uploader {
	background: #0008;
	width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
}
.description {
	margin-bottom: 25px;
}
</style>