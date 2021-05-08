<template>
	<!-- eslint-disable vue/valid-v-for -->
	<Error :dump='errorDump' :message='errorMessage'>
		<div ref='header' class='header' :style='`background-image: url("https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png")`'>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
		</div>
		<div ref='profile' class='user' v-if='!isMobile'>
			<a class='thumbnail' v-if='isEditing' @click='toggleIconUpload'>
				<div class='add-image-button'>
					<i class='material-icons-round'>add_a_photo</i>
				</div>
				<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading'/>
			</a>
			<Loading :isLoading='isIconLoading' class='profile-image' v-else>
				<router-link :to='`/p/${user?.icon}`' class='thumbnail'>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading'/>
				</router-link>
			</Loading>
			<div class='user-field' v-if='isEditing'>
				<i class='material-icons'>public</i>
				<input v-model='user.website' class='interactable text'>
			</div>
			<p v-else-if='user?.website' class='user-field'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
			<p class='user-field' v-if='!isEditing'><i class='material-icons'>schedule</i><span>Joined <Timestamp :datetime='user?.created'/></span></p>
			<div class='user-name'>
				<input v-model='user.name' class='interactable text' v-if='isEditing'>
				<h2 v-else>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p>@{{user?.handle}}</p>
			</div>
		</div>
		<div ref='profile' class='user mobile' v-else>
			<a class='thumbnail' v-if='isEditing' @click='toggleIconUpload'>
				<div class='add-image-button'>
					<i class='material-icons-round'>add_a_photo</i>
				</div>
				<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading'/>
			</a>
			<Loading :isLoading='isIconLoading' class='profile-image' v-else>
				<router-link :to='`/p/${user?.icon}`' class='thumbnail'>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading'/>
				</router-link>
			</Loading>
			<div class='user-field' v-if='isEditing'>
				<i class='material-icons'>public</i>
				<input v-model='user.website' class='interactable text'>
			</div>
			<div v-else>
				<p v-if='user?.website' class='user-field'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
				<p class='user-field'><i class='material-icons'>schedule</i><span>Joined <Timestamp :datetime='user?.created'/></span></p>
			</div>
			<div class='user-name'>
				<input v-model='user.name' class='interactable text' v-if='isEditing'>
				<h2 v-else>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p>@{{user?.handle}}</p>
			</div>
		</div>
		<main ref='main'>
			<Button class='interactable edit-profile-button' title='Edit profile' @click='toggleEdit' v-if='isSelf'>
				<i class='material-icons'>edit</i>
				Edit Profile
			</Button>
			<Button class='interactable edit-profile-button' title='switch between tags and posts' @click='tab = tab === "posts" ? "tags" : "posts"'>
				<i class='material-icons'>{{tab === "posts" ? "cached" : "sync"}}</i>
				{{tab === "posts" ? "Show tags" : "Show posts"}}
			</Button>
			<div v-show='tab === "posts"'>
				<Markdown :content='user?.description' :class='isMobile ? "mobile" : ""'/>
				<div class='results'>
					<p v-if='posts?.length === 0' style='text-align: center'>{{user?.name || user?.handle}} hasn't made any posts yet.</p>
					<Post v-for='post in posts || 3' :postId='post?.post_id' :nested='true' v-bind='post' v-else/>
				</div>
			</div>
			<div v-show='tab === "tags"'>
				<Markdown :content='user?.description' :class='isMobile ? "mobile" : ""'/>
				<div class='results'>
					<p v-if='!userTags' style='text-align: center'>loating tags...</p>
					<p v-else-if='userTags?.length === 0' style='text-align: center'>{{user?.name || user?.handle}} has no tags.</p>
					<ul v-else>
						<li v-for='tag in userTags'>
							tag: {{tag.tag}}
							class: {{tag.class}}
						</li>
					</ul>
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
						aspectRatio: 1,
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
			tab: 'posts',
		};
	},
	created() {
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
	},
	mounted() {
		this.onResize();
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
		onResize() {
			this.$refs.header.style.height = `${this.$refs.main.getBoundingClientRect().top + window.scrollY - this.$store.bannerHeight}px`;
			this.$refs.header.style.top = `-${this.$store.contentOffset - this.$store.bannerHeight}px`;
			this.$refs.profile.style.marginTop = `${(window.innerHeight / 2) - this.$store.contentOffset}px`;
		},
		toggleEdit() {
			this.isEditing = !this.isEditing;
		},
		toggleIconUpload() {
			this.isUploadIcon = !this.isUploadIcon;
		},
		toggleBannerUpload() {
			this.isUploadBanner = !this.isUploadBanner;
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
	watch: {
		resizeTrigger() {
			this.onResize();
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 125px 25px 25px;
	margin: 25px auto 0;
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

.thumbnail {
	border-radius: 5px;
	border: solid 3px var(--bordercolor);
	background: var(--bordercolor);
	display: flex;
	overflow: hidden;
	position: relative;
}
.thumbnail, .thumbnail img, .thumbnail video {
	width: 200px;
	height: 200px;
}

.header {
	top: -25px;
	height: 0;
	width: 100vw;
	position: absolute;
	background-size: cover;
	background-position: center;
}

.user {
	width: 70vw;
	margin: 0 auto -128px;
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
.user.mobile {
	margin: 0 25px -128px;
	width: auto;
}


.edit-profile-button {
	margin: 0 auto 25px;
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
.results > :last-child {
	margin-bottom: 0;
}

ul {
	list-style: none;
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
</style>