<template>
	<!-- eslint-disable vue/valid-v-for -->
	<!-- eslint-disable vue/require-v-for-key -->
	<div>
		<Loading :isLoading='isBannerLoading' class='banner' v-if='user?.banner'>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
			<router-link :to='`/p/${user.banner}`' class='banner-link' v-else>
				<i class='material-icons-round' style='display: block'>open_in_new</i>
			</router-link>
			<img :src='banner' @load='isBannerLoading = false'>
		</Loading>
		<div class='banner-missing' v-else>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
		</div>
		<main ref='main'>
			<div class='header-bar'>
				<div class='inner'>
					<Loading :isLoading='isIconLoading' class='profile-image'>
						<button class='thumbnail' v-if='isEditing' @click='toggleIconUpload'>
							<div class='add-image-button'>
								<i class='material-icons-round'>add_a_photo</i>
							</div>
							<UserIcon :handle='user?.handle' :post='user?.icon' v-model:isLoading='isIconLoading'/>
						</button>
						<router-link :to='`/p/${user?.icon}`' class='thumbnail' v-else-if='user?.icon'>
							<UserIcon :handle='user?.handle' :post='user?.icon' v-model:isLoading='isIconLoading'/>
						</router-link>
						<div class='thumbnail' v-else>
							<UserIcon :handle='user?.handle' v-model:isLoading='isIconLoading'/>
						</div>
					</Loading>
					<div class='profile-buttons'>
						<div class='tabs' v-show='!isMobile'>
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
							<div class='separator' v-show='isSelf'/>
							<button @click='selectTab' class='uploads' title='this tab is only visible to you' v-show='isSelf'>
								<i class='material-icons'>lock</i>
								Uploads
								<div class='border'/>
							</button>
						</div>
						<Button @click='follow' :red='user?.following' v-show='!isSelf' class='follow-button' :nested='isMobile'>
							<i class='material-icons'>{{user?.following ? 'person_off' : 'person_add_alt'}}</i>
							{{user?.following ? 'Unfollow' : 'Follow'}}
						</Button>
						<div class='badges'>
							<p class='verified' v-if='user?.verified'>
								<i class='kheina-icons' v-if='user.verified === "admin"' :title='`@${user?.handle} is an admin`'>sword</i>
								<i class='material-icons' v-else-if='user.verified === "mod"' :title='`@${user?.handle} is a moderator`'>verified_user</i>
								<i class='material-icons-round' v-else-if='user.verified === "artist"' :title='`@${user?.handle} is a verified artist`'>verified</i>
								{{user.verified}}
							</p>
							<p v-for='badge in user?.badges'>
								<img class='emoji' :src='getEmojiUrl(badge.emoji)'>
								{{badge.label}}
								<button v-if='isEditing' @click='removeBadge(badge)'>
									<i class='material-icons'>close</i>
								</button>
							</p>
							<p v-if='isEditing'>
								<i class='material-icons'>add</i>
								Add Badge
							</p>
						</div>
					</div>
				</div>
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
					</h2>
					<p><Loading :isLoading='!user' span>@{{user?.handle || 'handle'}}</Loading></p>
				</div>
			</div>
			<MarkdownEditor v-model:value='update.description' class='description' v-if='isEditing'/>
			<Markdown :content='user?.description' class='description' v-else/>
			<div class='edit-profile-button' v-if='isSelf'>
				<div v-if='isEditing'>
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
				<div class='tabs' v-show='isSelf'>
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
					<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length >= count ? 10000 : 0' v-if='posts'/>
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
							<Post :postId='post?.post_id' :nested='!isMobile' v-bind='post' labels/>
						</li>
					</ol>
					<ResultsNavigation class='page-links' :navigate='setPage' :activePage='page' :totalPages='posts?.length >= count ? 10000 : 0' v-if='posts'/>
				</div>
			</div>
			<ThemeMenu/>
		</main>
	</div>
	<div class='image-uploader' v-if='isUploadBanner || isUploadIcon' @mousedown='disableUploads'>
		<div class='cropper' @mousedown.stop v-if='uploadPostId'>
			<div class='image-uploader' v-if='uploadLoading'>
				<Loading :lazy='false'/>
			</div>
			<Cropper
				ref='cropper'
				:src='cropperImage'
				:stencil-props='{
					aspectRatio: isUploadBanner ? 3 : 1,
				}'
			/>
			<div class='button-list'>
				<Button @click.prevent.stop='updateProfileImage'><i class='material-icons'>check</i>Set {{isUploadIcon ? 'Icon' : 'Banner'}}</Button>
				<Button @click.prevent.stop='disableUploads' red><i class='material-icons'>close</i>Cancel</Button>
				<Button @click.prevent.stop='showData'><i class='material-icons'>science</i>test</Button>
			</div>
		</div>
		<div class='upload-window' @mousedown.stop v-else>
			<div class='image-uploader' v-if='uploadLoading'>
				<Loading :lazy='false'/>
			</div>
			<div v-if='!uploadablePosts' style='margin-top: 25px; text-align: center'>
				Select an existing post to set as your {{isUploadIcon ? 'profile picture' : 'banner image'}}.
			</div>
			<ol class='results' v-else>
				<li v-for='post in uploadablePosts'>
					<PostTile :postId='post.post_id' :nested='!isMobile' v-bind='post' labels @click='uploadPostId = post.post_id'/>
				</li>
			</ol>
			<ResultsNavigation :navigate='runSearchQuery' :activePage='uploadablePage' :totalPages='uploadablePosts?.length >= 64 ? 10000 : 0' v-if='uploadablePosts'/>
			<SearchBar v-model:value='searchValue' :func='runSearchQuery'/>
			<a @click.prevent.stop='disableUploads' class='search-close'><i class='material-icons'>close</i></a>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { demarkdown, getBannerUrl, getEmojiUrl, getMediaUrl, isMobile, khatch, setTitle, tagSplit } from '@/utilities';
import { apiErrorDescriptionToast, apiErrorMessage, apiErrorMessageToast, postsHost, uploadHost, usersHost, tagsHost } from '@/config/constants';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Submit from '@/components/Submit.vue';
import UserIcon from '@/components/UserIcon.vue';
import Markdown from '@/components/Markdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Post from '@/components/Post.vue';
import PostTile from '@/components/PostTile.vue';
import Tag from '@/components/Tag.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import SearchBar from '@/components/SearchBar.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';


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
		Media,
		UserIcon,
		Markdown,
		Timestamp,
		Post,
		Button,
		Tag,
		MarkdownEditor,
		SearchBar,
		PostTile,
		ResultsNavigation,
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
			isMobile,
			isIconLoading: true,
			isBannerLoading: true,
			errorDump: null,
			user: null,
			posts: null,
			isEditing: false,
			isUploadIcon: false,
			isUploadBanner: false,
			uploadPostId: null,
			uploadablePosts: null,
			uploadablePage: null,
			searchValue: null,
			cropperImage: null,
			uploadLoading: null,
			userTags: null,
			tabElement: null,
			tab: 'posts',
			update: null,
			count: null,
			page: null,
			bannerWebpFailed: null,
		};
	},
	created() {
		const tabs = new Set(['posts', 'sets', 'tags', 'favs', 'uploads']);

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
					{ this.$store.commit('error', r.error); }
					else
					{ this.$store.commit('error', apiErrorMessage, r); }
				});
			})
			.catch(error => {
				this.$store.commit('error', apiErrorMessage, error);
				console.error(error);
			});

		this.fetchData();

		this.$watch(
			() => this.$route.query,
			this.fetchData,
		);
	},
	mounted() {
		this.tabElement = document.querySelector(`.${isMobile ? 'mobile-profile-buttons' : 'profile-buttons'} button.${this.tab}`);
		this.tabElement.lastChild.style.borderBottomWidth = '5px';
		if (this.$route.query?.edit)
		{ this.toggleEdit(true); }
	},
	computed: {
		isSelf() {
			return this.$store.state.user && this.$store.state.user?.handle === this.user?.handle;
		},
		banner() {
			if (!this.user?.banner)
			{ return null; }

			if (this.bannerWebpFailed)
			{ return getBannerUrl(this.user.banner, this.user.handle, 'jpg'); }
			return getBannerUrl(this.user.banner, this.user.handle);
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
		getEmojiUrl,
		removeBadge(badge) {
			khatch(`${usersHost}/v1/remove_badge`, {
				method: 'POST',
				errorMessage: 'Failed to remove badge.',
				body: badge,
			})
			.then(() => {
				const index = this.user.badges.indexOf(badge);
				this.user.badges.splice(index, 1);
			})
			.catch(() => { });
		},
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
						handleError: true,
							method: 'POST',
							body: {
								handle: this.handle,
								page: this.page,
								count: this.count,
							},
						})
						.then(response => {
							response.json().then(r => {
								// if (this.$store.state.scroll)
								// { setTimeout(() => { window.scrollTo(0, this.$store.state.scroll); this.$store.state.scroll = null; }, 0); }
								this.posts = r;
							});
						})
					.catch(() => { });
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
			this.runSearchQuery();
			document.body.style.overflow = 'hidden';
		},
		toggleBannerUpload() {
			this.isUploadBanner = true;
			this.runSearchQuery();
			document.body.style.overflow = 'hidden';
		},
		disableUploads() {
			this.isUploadBanner = this.isUploadIcon = false;
			document.body.style.overflow = this.uploadLoading = this.cropperImage = this.uploadablePosts = this.uploadPostId = null;
		},
		onImageCrop({ coordinates, canvas }) {
			console.log(coordinates, canvas);
		},
		showData() {
			const results = this.$refs.cropper.getResult();
			console.log({
				post_id: this.uploadPostId,
				coordinates: results.coordinates,
				transformation: results.imageTransforms,
			});
		},
		updateProfileImage() {
			this.uploadLoading = true;
			let endpoint = null;

			if (this.isUploadIcon)
			{ endpoint = 'set_icon'; }

			if (this.isUploadBanner)
			{ endpoint = 'set_banner'; }

			khatch(`${uploadHost}/v1/${endpoint}`, {
				errorMessage: 'Failed to update user image!',
				method: 'POST',
				body: {
					post_id: this.uploadPostId,
					coordinates: this.$refs.cropper.getResult().coordinates,
				},
			})
			.then(r => {
				if (this.isUploadIcon)
				{
					this.user.icon = this.uploadPostId;
					this.$store.state.user.icon = this.uploadPostId;
				}
				else if (this.isUploadBanner)
				{ this.user.banner = this.uploadPostId; }
				this.disableUploads();
			})
			.catch(this.disableUploads);
		},
		runSearchQuery(page=null) {
			this.uploadLoading = true;
			this.uploadablePage = page || 1;
			if (this.searchValue)
			{
				khatch(`${postsHost}/v1/fetch_posts`, {
					errorMessage: 'Failed to fetch posts for profile.',
					method: 'POST',
					body: {
						sort: 'new',
						tags: tagSplit(this.searchValue),
						page: this.uploadablePage,
						count: 64,
					},
				})
				.then(response => {
					response.json().then(r => {
						this.uploadablePosts = r;
						this.uploadLoading = null;
					});
				})
				.catch(this.disableUploads);
			}
			else
			{
				khatch(`${postsHost}/v1/fetch_user_posts`, {
					errorMessage: 'Failed to fetch posts for profile.',
					method: 'POST',
					body: {
						handle: this.handle,
						page: this.uploadablePage,
						count: 64,
					},
				})
				.then(response => {
					response.json().then(r => {
						this.uploadablePosts = r;
						this.uploadLoading = null;
					});
				})
				.catch(this.disableUploads);
			}
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
	watch: {
		uploadPostId(value) {
			if (!value)
			{ return; }

			khatch(`${postsHost}/v1/post/${value}`, {
				errorMessage: 'Failed to fetch post for profile.',
			})
			.then(response => {
				response.json().then(r => {
					this.cropperImage = getMediaUrl(r.post_id, r.filename);
				});
			})
			.catch(e => { });
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
	display: inline-block;
	position: absolute;
	border-radius: 5px;
	border: solid 3px var(--bordercolor);
	background: var(--bg2color);
	overflow: hidden;
	top: calc(-6.25em - 3px);
}
.mobile .profile-image {
	top: calc(-4em - 3px);
	/* margin-bottom: -3.875em;
	width: auto; */
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
	height: 33.33333vw;
	height: calc(100vw / 3);
	max-height: 75vh;
	width: 100%;
	background-size: cover;
	background-position: center;
}
.banner img {
	object-fit: cover;
	min-width: 100%;
	min-height: 100%;
	width: 100%;
}
.banner-link {
	position: absolute;
	right: 1em;
	bottom: 1em;
	border-radius: 50%;
	overflow: hidden;
	color: var(--notification-text);
}
.banner-link i {
	background: var(--screen-cover);
	padding: 0.5em;
}
.mobile .banner-link {
	right: 0;
	bottom: 0;
	padding: 1em;
	border-radius: initial;
}
.mobile .banner-link i {
	border-radius: 50%;
	font-size: 1.5em;
}

.banner-missing {
	height: calc(6.25em + 28px);
}
.mobile .banner-missing {
	height: calc(4em + 28px);
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
	margin-top: 25px;
}

.header-bar {
	position: relative;
	padding: 0 25px;
	width: 100%;
	background: var(--bg2color);
	border-bottom: var(--border-size) solid var(--bordercolor);
	left: -25px;
	right: -25px;
	margin-bottom: 3em;
}
.mobile .header-bar {
	background: none;
	border-bottom: none;
	margin-bottom: 4.25em;
}

.header-bar .inner {
	width: 70vw;
	margin: auto;
}
.mobile .header-bar .inner {
	width: auto;
}
.badges {
	position: absolute;
	top: 100%;
	display: flex;
}
.badges p {
	margin: 0.5em 0 0 0.5em;
	padding: 0.25em 0.5em;
	background: var(--bg2color);
	border-radius: var(--border-radius);
	display: flex;
	align-items: center;
}
.badges p i, .badges p img {
	margin-right: 0.35em;
}
.badges p img {
	max-height: 1em;
	border-radius: var(--border-radius);
	font-size: 1.1em;
}
.badges p i {
	font-size: 1.25em;
}
.badges button {
	margin: 0 0 0 0.35em;
}
.badges button i {
	margin: 0;
	display: block;
}
.badges button:hover {
	color: var(--error);
}
.profile-buttons {
	position: relative;
	display: flex;
	justify-content: space-between;
	width: calc(100% - 12.5em - 6px);
	align-items: center;
	left: calc(12.5em + 6px);
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
	border-bottom: var(--border-size) solid var(--bordercolor);
	width: 100%;
	justify-content: center;
}
.tabs button {
	padding: 20px 25px;
	position: relative;
	flex: 1;
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
	.user, .description, .user-info, .header-bar .inner {
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
	z-index: 1000;
	display: flex;
	justify-content: center;
	align-items: center;
}
.upload-window, .cropper {
	background: var(--bg1color);
	padding: 25px;
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
}
.image-uploader .button-list {
	margin-top: 0.5em;
	display: flex;
	justify-content: center;
}
.image-uploader .button-list button {
	margin-right: 25px;
}
.image-uploader .button-list > :last-child {
	margin-right: 0;
}
.vue-advanced-cropper {
	height: 80vmin;
	width: 80vmin;
	height: calc(80vmin - 1.7em);
}
.upload-window {
	height: 80vmin;
	width: 80vmin;
	height: calc(100vh - 102px);
	width: calc(100vw - 102px);
	overflow: auto;
	position: relative;
}
.upload-window .results {
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	padding-top: 2.5em;
}
.upload-window ol.results li {
	list-style: none;
	margin: 0 12.5px 25px;
}
.upload-window .page-links {
	margin-top: 0;
}
.search-close {
	position: fixed;
	top: 25px;
	right: 25px;
	margin: 25px;
}
.search-close:hover {
	color: var(--error) !important;
}
.mobile .search-close {
	margin: 0;
}
.mobile .search-close i {
	font-size: 1.5em;
	padding: 25px;
	background: var(--bg1color);
	border-radius: 50%;
}
.mobile .upload-window .results {
	padding-top: 4em;
}

.search-bar {
	position: fixed;
	width: calc(100% - 100px - var(--border-size) * 2);
	top: 50px;
	top: calc(40px + var(--border-size));
}

/* THEME OVERRIDES */
html.e621 .header-bar {
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
	margin-top: 0.82em;
}

html.wikipedia .badges p {
	border: solid 1px var(--bordercolor);
}

html.solarized-dark .badges img.emoji {
	filter: contrast(0.625);
}

html.solarized-light .badges img.emoji {
	filter: sepia(0.375);
}

/* ACCENT OVERRIDES */
html.desktop.aurora main, html.desktop.hex main, html.desktop.space main, html.desktop.stars main {
	background-position-y: calc(1em + 40px);
}

html.desktop.winter main {
	background-position-y: bottom, calc(1em + 40px);
}

html.desktop.spring main {
	background-position-y: bottom, bottom, calc(1em + 40px), calc(1em + 40px);
}

html.mobile.autumn .active-tab {
	background-image: url(/assets/themes/autumn.png);
	background-repeat: repeat-x;
	background-position: center bottom;
}

html.mobile.spring .active-tab {
	background-image: url(/assets/themes/spring/1.png), url(/assets/themes/spring/2.png);
	background-repeat: repeat-x, no-repeat, no-repeat, repeat-x;
	background-position: center bottom, right bottom;
}

html.mobile.winter .active-tab {
	background-image: url(/assets/themes/winter/1.png);
	background-repeat: repeat-x;
	background-position: center bottom;
}
</style>