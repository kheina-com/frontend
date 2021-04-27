<template>
	<!-- eslint-disable vue/valid-v-for -->
	<Error :dump='errorDump' :message='errorMessage'>
		<div ref='header' class='header' :style='`background-image: url("https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png")`'>
		</div>
		<div ref='profile' class='user' v-if='!isMobile'>
			<Loading :isLoading='isIconLoading' class='profile-image'>
				<router-link :to='`/p/${user?.icon}`'>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading' class='thumbnail'/>
				</router-link>
			</Loading>
			<p v-if='user?.website' class='user-field'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
			<p class='user-field'><i class='material-icons'>schedule</i><span>joined <Timestamp :datetime='user?.created'/></span></p>
			<div class='user-name'>
				<h2>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p>@{{user?.handle}}</p>
			</div>
		</div>
		<div ref='profile' class='user mobile' v-else>
			<Loading :isLoading='isIconLoading' class='profile-image'>
				<router-link :to='`/p/${user?.icon}`'>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading' class='thumbnail'/>
				</router-link>
			</Loading>
			<div>
				<p v-if='user?.website' class='user-field'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
				<p class='user-field'><i class='material-icons'>schedule</i><span>joined <Timestamp :datetime='user?.created'/></span></p>
			</div>
			<div class='user-name'>
				<h2>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p>@{{user?.handle}}</p>
			</div>
		</div>
		<main ref='main'>
			<Button class='interactable edit-profile-button' title='Edit profile' v-if='isSelf'>
				<i class='material-icons'>edit</i>
				Edit Profile
			</Button>
			<Markdown :content='user?.description' :class='isMobile ? "mobile" : ""'/>
			<div>
				<p v-if='posts?.length === 0' style='text-align: center'>{{user?.name || user?.handle}} hasn't made any posts yet.</p>
				<Post v-for='post in posts || 3' :postId='post?.post_id' :nested='true' v-bind='post' v-else/>
			</div>
			<ThemeMenu />
		</main>
	</Error>
</template>

<script>
import { ref } from 'vue';
import { khatch, setTitle, isMobile } from '@/utilities';
import { apiErrorMessage, postsHost, usersHost } from '@/config/constants';
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

		return {
			main,
			header,
			profile,
		};
	},
	data() {
		return {
			isIconLoading: true,
			errorMessage: null,
			errorDump: null,
			user: null,
			posts: null,
		};
	},
	created() {
		khatch(`${usersHost}/v1/fetch_user/${this.handle}`)
			.then(response => {
				response.json().then(r => {
					console.log(r);
					if (response.status < 300)
					{
						this.user = r;
						setTitle(this.user?.name || this.user.handle);
						this.$router.replace(this.user.handle);
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
					{
						this.posts = r.posts;
						this.onResize();
						// setTimeout
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
	mounted() {
		this.onResize();
	},
	computed: {
		isMobile,
		isSelf() {
			return this.$store.state.user && this.$store.state.user?.handle === this.user?.handle;
		},
	},
	methods: {
		onResize() {
			console.log('resized');
			let mainTop = this.$refs.main.getBoundingClientRect().top;
			this.$refs.header.style.height = `${mainTop - this.$store.bannerHeight}px`;
			this.$refs.header.style.top = `-${this.$store.contentOffset - this.$store.bannerHeight}px`;
			this.$refs.profile.style.paddingTop = `${(window.innerHeight / 2) - this.$store.contentOffset}px`;
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
main.mobile {
	width: 70vw;	
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
	width: 200px;
	height: 200px;
	border-radius: 5px;
	border: solid 3px var(--bordercolor);
	background: var(--bordercolor);
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
	padding: 300px 0 0;
	z-index: 1;
	position: relative;
}
.user.mobile {
	margin: 0 25px -128px;
}


.edit-profile-button {
	margin: 0 auto 25px;
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}

</style>