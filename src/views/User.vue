<template>
	<!-- eslint-disable vue/valid-v-for -->
	<!-- eslint-disable vue/require-v-for-key -->
	<div>
		<div ref='banner' class='banner' v-if='user?.banner' :style='`background-image: url("https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png")`'>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
		</div>
		<div class='banner-missing' v-else>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
		</div>
		<Error :dump='errorDump' :message='errorMessage' v-if='errorMessage'/>
		<main ref='main' v-else>
			<div class='header-bar'>
				<div class='inner'>
					<div class='profile-buttons'>
						<div class='tabs' v-if='!isMobile'>
							<button @click='selectTab' class='posts'>
								Posts
								<div class='border'/>
							</button>
							<div class='separator'/>
							<button @click='selectTab' class='sets'>
								Sets
								<div class='border'/>
							</button>
							<div class='separator'/>
							<button @click='selectTab' class='tags'>
								Tags
								<div class='border'/>
							</button>
							<div class='separator'/>
							<button @click='selectTab' class='favs'>
								Favorites
								<div class='border'/>
							</button>
							<div class='separator' v-if='isSelf'/>
							<button @click='selectTab' class='uploads' title='this tab is only visible to you' v-if='isSelf'>
								<i class='material-icons'>lock</i>
								Uploads
								<div class='border'/>
							</button>
						</div>
						<Button @click='follow' :red='user?.following' v-show='!isSelf' class='follow-button' :unnested='!isMobile'>
							<i class='material-icons'>{{user?.following ? 'person_off' : 'person_add_alt'}}</i>
							{{user?.following ? 'Unfollow' : 'Follow'}}
						</Button>
					</div>
				</div>
			</div>
			<div ref='profile' class='user'>
				<Loading :isLoading='isIconLoading' class='profile-image'>
					<button class='thumbnail' v-if='isEditing' @click='toggleIconUpload'>
						<div class='add-image-button'>
							<i class='material-icons-round'>add_a_photo</i>
						</div>
						<Thumbnail :size='800' :post='user?.icon === null ? "_V-EGBtH" : user?.icon' v-model:isLoading='isIconLoading'/>
					</button>
					<router-link :to='`/p/${user?.icon}`' class='thumbnail' v-else>
						<Thumbnail :size='800' :post='user?.icon === null ? "_V-EGBtH" : user?.icon' v-model:isLoading='isIconLoading'/>
					</router-link>
				</Loading>
			</div>
			<div class='user-info'>
				<p class='user-field' v-if='!isEditing'>
					<i class='material-icons'>schedule</i>
					<Loading :isLoading='!user' span>{{isMobile ? '' : 'Joined '}}<Timestamp :datetime='user?.created'/></Loading>
				</p>
				<div class='user-field' v-if='isEditing'>
					<i class='material-icons'>public</i>
					<input v-model='update.website' class='interactable text'>
				</div>
				<p v-else-if='user?.website' class='user-field website'>
					<i class='material-icons'>public</i>
					<Markdown :content='user?.website' inline/>
				</p>
				<div class='user-name'>
					<input v-model='update.name' class='interactable text' v-if='isEditing'>
					<h2 v-else>
						<Markdown :content='user?.name' inline v-if='user'/>
						<Loading span v-else>username</Loading>
						<i class='material-icons' v-if='user?.privacy === "private"' :title="`@${user?.handle}'s account is private`">lock</i>
						<i class='kheina-icons' v-if='user?.verified === "admin"' :title="`@${user?.handle} is an admin`">sword</i>
						<i class='material-icons' v-else-if='user?.verified === "mod"' :title="`@${user?.handle} is a moderator`">verified_user</i>
						<i class='material-icons-round' v-else-if='user?.verified === "artist"' :title="`@${user?.handle} is a verified artist`">verified</i>
					</h2>
					<p><Loading :isLoading='!user' span>@{{user?.handle || 'handle'}}</Loading></p>
				</div>
			</div>
			<MarkdownEditor v-model:value='update.description' class='description' v-if='isEditing'/>
			<Markdown :content='user?.description' class='description' v-else/>
			<div class='edit-profile-button' v-if='isSelf'>
				<div v-if='isEditing'>
					<p>
						Note: icon and banner are not able to be updated at this time
					</p>
					<Button class='interactable' title='Edit profile' @click='updateProfile'>
						<i class='material-icons'>done</i>
						Update Profile
					</Button>
					<Button class='interactable' title='Edit profile' @click='toggleEdit(false)'>
						<i class='material-icons'>edit_off</i>
						Cancel
					</Button>
				</div>
				<Button class='interactable' title='Edit profile' @click='toggleEdit(true)' v-else>
					<i class='material-icons'>edit</i>
					Edit Profile
				</Button>
			</div>
			<div class='mobile-profile-buttons' v-show='isMobile'>
				<div class='tabs'>
					<button @click='selectTab' class='posts'>
						Posts
						<div class='border'/>
					</button>
					<div class='separator'/>
					<button @click='selectTab' class='sets'>
						Sets
						<div class='border'/>
					</button>
					<div class='separator'/>
					<button @click='selectTab' class='tags'>
						Tags
						<div class='border'/>
					</button>
					<div class='separator'/>
					<button @click='selectTab' class='favs'>
						Favs
						<div class='border'/>
					</button>
				</div>
				<div class='tabs' v-if='isSelf'>
					<button @click='selectTab' class='uploads' title='this tab is only visible to you'>
						<i class='material-icons'>lock</i>
						Uploads
						<div class='border'/>
					</button>
				</div>
			</div>
			<div class='active-tab'>
				<div v-show='tab === "posts"'>
					<ol class='results'>
						<p v-if='posts?.length === 0' style='text-align: center'>
							<Markdown :content='user?.name' inline v-if='user?.name'/>
							<span v-else>@{{handle}}</span>
							hasn't made any posts yet.
						</p>
						<li v-for='post in posts || 3' v-else>
							<Post :postId='post?.post_id' :nested='!isMobile' v-bind='post' labels/>
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
				</div>
				<div v-show='tab === "sets"'>
					<p style='text-align: center'>hey, this tab doesn't exist yet.</p>
				</div>
				<div v-show='tab === "tags"'>
					<div class='results'>
						<p v-if='!userTags' style='text-align: center'>loading tags...</p>
						<p v-else-if='userTags?.length === 0' style='text-align: center'>
							<Markdown :content='user?.name' inline v-if='user?.name'/>
							<span v-else>@{{handle}}</span>
							has no tags.
						</p>
						<ul class='tags' v-else>
							<li v-for='tag in userTags'>
								<Tag :inheritedTags='tag.inherited_tags' :nested='!isMobile' v-bind='tag'/>
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
				</div>
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
	</div>
</template>

<script>
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { demarkdown, khatch, setTitle, isMobile } from '@/utilities';
import { apiErrorDescriptionToast, apiErrorMessage, apiErrorMessageToast, postsHost, usersHost, tagsHost } from '@/config/constants';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Submit from '@/components/Submit.vue';
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
		const banner = ref(null);
		const profile = ref(null);
		const cropper = ref(null);

		return {
			main,
			banner,
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
			update: null,
			count: null,
			page: null,
		};
	},
	created() {
		const tabs = new Set(['posts', 'sets', 'tags', 'favs']);

		if (tabs.has(this.$route.query?.tab))
		{ this.tab = this.$route.query.tab; }

		if (this.tab !== 'posts')
		{ this.$store.state.scroll = null; }

		khatch(`${usersHost}/v1/fetch_user/${this.handle}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.user = r;
						setTitle(this.user?.name ? `${demarkdown(this.user?.name)} (@${this.user?.handle}) | kheina.com` : `@${this.user?.handle} | kheina.com`);
						this.$router.replace(this.$route.fullPath.replace(this.handle, this.user?.handle));
					}
					else if (response.status < 500)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
				});
			})
			.catch(error => {
				console.error(error);
				this.errorMessage = apiErrorMessage;
				this.error = error;
			});

		this.fetchData();

		this.$watch(
			() => this.$route.query,
			this.fetchData,
		);
	},
	mounted() {
		this.tabElement = document.querySelector(`button.${this.tab}`);
		this.tabElement.lastChild.style.borderBottomWidth = '5px';
		if (this.$route.query?.edit)
		{ this.toggleEdit(true); }
	},
	computed: {
		isMobile,
		isSelf() {
			return this.$store.state.user && this.$store.state.user?.handle === this.user?.handle;
		},
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
		selectTab(event) {
			this.tabElement.lastChild.style.borderBottomWidth = '0';
			this.tab = event.target.className;
			event.target.lastChild.style.borderBottomWidth = '5px';
			this.tabElement = event.target;
			this.$router.push(this.pageLink(1));
		},
		follow() {
			khatch(`${usersHost}/v1/${this.user?.following ? 'unfollow_user' : 'follow_user'}`, {
				method: 'POST',
				body: {
					handle: this.user?.handle,
				},
				errorMessage: `Failed to ${this.user?.following ? 'unfollow' : 'follow'} user`,
			})
			.then(() => {
				this.user.following = !this.user?.following;
			}).catch(() => { });
		},
		fetchData() {
			switch (this.tab) {
				case 'posts' :
					this.page = parseInt(this.$route.query?.page) || 1;
					this.count = parseInt(this.$route.query?.count) || 64;

					this.posts = null;

					khatch(`${postsHost}/v1/fetch_user_posts`, {
							method: 'POST',
							body: {
								handle: this.handle,
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
								else if (response.status < 500)
								{
									this.$store.commit('createToast', {
										title: apiErrorMessageToast,
										description: r.error,
									});
								}
								else
								{
									this.$store.commit('createToast', {
										title: apiErrorMessageToast,
										description: apiErrorDescriptionToast,
										dump: r,
									});
								}
							});
						})
					.catch(error => {
						console.error(error);
						this.$store.commit('createToast', {
							title: apiErrorMessageToast,
							description: error,
						});
					});
					break;

				case 'sets' :
					// nothing, yet
					break;

				case 'tags' :
					if (this.userTags === null)
					{
						khatch(
							`${tagsHost}/v1/get_user_tags/${this.handle}`,
							{
								errorMessage: 'Failed to Retrieve User tags!',
								errorHandlers: { 404: () => this.userTags = [] },
							},
						).then(response => {
							response.json().then(r => {
								this.userTags = r;
							});
						}).catch(() => { });
					}
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
								else if (response.status < 500)
								{
									this.$store.commit('createToast', {
										title: apiErrorMessageToast,
										description: r.error,
									});
								}
								else
								{
									this.$store.commit('createToast', {
										title: apiErrorMessageToast,
										description: apiErrorDescriptionToast,
										dump: r,
									});
								}
							});
						})
						.catch(error => {
							console.error(error);
							this.$store.commit('createToast', {
								title: apiErrorMessageToast,
								description: error,
							});
						});
					break;
			}
		},
		toggleEdit(editing) {
			this.isEditing = editing;
			if (editing)
			{
				this.update = {
					name: this.user?.name,
					website: this.user?.website,
					description: this.user?.description,
				};
			}
		},
		updateProfile() {
			// name: str = None
			// privacy: UserPrivacy = None
			// icon: str = None
			// website: str = None
			// description: str = None

			khatch(
				`${usersHost}/v1/update_self`,
				{
					method: 'POST',
					body: this.update,
				}
			).then(response => {
				if (response.status < 300)
				{
					this.user = Object.assign(this.user, this.update);
					this.isEditing = false;
					return;
				}
				response.json()
					.then(r => {
						if (response.status < 500)
						{
							this.$store.commit('createToast', {
								title: apiErrorMessageToast,
								description: r.error,
							});
						}
						else
						{
							this.$store.commit('createToast', {
								title: apiErrorMessageToast,
								description: apiErrorDescriptionToast,
								dump: r,
							});
						}
					});
			})
			.catch(error => {
				console.error(error);
				this.$store.commit('createToast', {
					title: apiErrorMessageToast,
					description: error,
				});
			});
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
		pageLink(page) {
			let query = [];

			if (this.tab)
			{ query.push(`tab=${this.tab}`); }

			if (page !== 1)
			{ query.push(`page=${page}`); }

			if (this.count !== 64)
			{ query.push(`count=${this.count}`); }

			return '/' + this.user.handle + '?' + query.join('&');
		},
		setPage(page) {
			this.page = page;
			this.$router.push(this.pageLink(page));
		},
	},
}
</script>

<style>
.user-name h2 .markdown.inline p {
	white-space: nowrap !important;
}
</style>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 0 25px 25px;
	margin: 0 auto;
}

.user-name {
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
.user-field.website {
	word-break: break-all;
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

.banner, .banner-missing {
	top: 0;
	position: relative;
}

.banner {
	height: 25vw;
	width: 100%;
	background-size: cover;
	background-position: center;
}

.banner-missing {
	height: calc(6.25em + 28px);
}
.mobile .banner-missing {
	height: calc(4em + 28px);
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
	margin-bottom: -3.875em;
	width: auto;
}

.edit-profile-button div {
	text-align: center;
}
.edit-profile-button button {
	margin: 0 auto 25px;
}
.edit-profile-button p {
	text-align: center;
}
.edit-profile-button div button {
	display: flex inline;
	margin: 25px 12.5px;
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

.header-bar {
	position: absolute;
	margin: 0 -25px;
	width: 100%;
	background: var(--bg2color);
	border-bottom: var(--border-size) solid var(--bordercolor);
}

.header-bar .inner {
	width: 70vw;
	margin: auto;
}
.mobile .header-bar {
	background: none;
	border-bottom: none;
}

.profile-buttons {
	position: relative;
	left: calc(12.5em + 6px);
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: calc(100% - 12.5em - 6px);
}
.mobile .profile-buttons {
	left: calc(8em + 6px);
}

.mobile .follow-button {
	left: 25px;
	top: 25px;
}

.mobile-profile-buttons {
	position: relative;
	margin: 0 -25px 25px;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: var(--bg2color);
}

.mobile .active-tab {
	background: var(--bg2color);
	margin: -25px;
	padding: 25px;
}


.tabs {
	display: flex;
}
.mobile .tabs {
	display: grid;
	grid-template-columns: 1fr var(--border-size) 1fr var(--border-size) 1fr var(--border-size) 1fr;
	grid-template-rows: auto;
}
.mobile .tabs {
	border-bottom: var(--border-size) solid var(--bordercolor);
	width: 100%;
	justify-content: center;
}
.tabs button {
	padding: 20px 25px;
	position: relative;
}
.mobile .tabs button {
	padding: 1em 0;
}
.tabs .separator {
	background: var(--bordercolor);
	width: var(--border-size);
}
.tabs .border {
	position: absolute;
	width: 100%;
	left: 0;
	bottom: 0;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	border-bottom: solid 0 var(--icolor);
}

.uploads {
	display: flex;
	justify-content: center;
}
.uploads i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
	pointer-events: none;
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

.description {
	margin: 0 auto 25px;
	width: 70vw;
}
.mobile .description {
	width: auto;
}

@media only screen and (max-width: 900px) {
	.user {
		width: auto;
	}
	.description {
		width: auto;
	}
	.user-info {
		width: auto;
	}
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
	background: var(--screen-cover);
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
	background: var(--screen-cover);
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

/* THEME OVERRIDES */
html.e621 .header-bar {
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
}
</style>