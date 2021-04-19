<template>
	<!-- eslint-disable vue/valid-v-for -->
	<Error :dump='errorDump' :message='errorMessage'>
		<div style='width: 70vw; margin: 0 auto -128px; display: flex; justify-content: space-between; align-items: flex-end; padding: 25px 0; z-index: 1; position: relative' v-if='!isMobile'>
			<Loading :isLoading='isIconLoading' class='profile-image'>
				<router-link :to='`/p/${user?.icon}`'>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading' style='width: 200px; height: 200px; border-radius: 5px; border: solid 3px var(--bordercolor)'/>
				</router-link>
			</Loading>
			<p v-if='user?.website' style='display: flex; align-items: center'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
			<p style='display: flex; align-items: center'><i class='material-icons'>schedule</i><span>joined <Timestamp :datetime='user?.created' style='color: var(--textcolor)'/></span></p>
			<div style='display: flex; flex-direction: column; align-items: flex-end'>
				<h2 style='margin: 0; display: flex; align-items: center'>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p style='margin: 0'>@{{user?.handle}}</p>
			</div>
		</div>
		<div style='margin: 0 25px -128px; display: flex; justify-content: space-between; align-items: flex-end; padding: 25px 0; z-index: 1; position: relative' v-else>
			<Loading :isLoading='isIconLoading' class='profile-image'>
				<router-link :to='`/p/${user?.icon}`'>
					<Thumbnail :size='800' :post='user?.icon' v-model:isLoading='isIconLoading' style='width: 200px; height: 200px; border-radius: 5px; border: solid 3px var(--bordercolor)'/>
				</router-link>
			</Loading>
			<div>
				<p v-if='user?.website' style='display: flex; align-items: center'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
				<p style='display: flex; align-items: center'><i class='material-icons'>schedule</i><span>joined <Timestamp :datetime='user?.created' style='color: var(--textcolor)'/></span></p>
			</div>
			<div style='display: flex; flex-direction: column; align-items: flex-end'>
				<h2 style='margin: 0; display: flex; align-items: center'>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p style='margin: 0'>@{{user?.handle}}</p>
			</div>
		</div>
		<main>
			<Button class='interactable edit-profile-button' title='Edit profile' v-if='isSelf'>
				<i class='material-icons'>edit</i>
				Edit Profile
			</Button>
			<Markdown :content='user?.description' :style='`margin-top: 25px; ${isMobile ? "" : "width: 70vw;"} margin: 25px auto 0`'/>
			<div>
				<p v-if='posts?.length === 0' style='text-align: center'>{{user?.name || user?.handle}} hasn't made any posts yet.</p>
				<Post v-for='post in posts || 3' :postId='post?.post_id' :nested='true' v-bind='post' v-else/>
			</div>
			<ThemeMenu />
		</main>
	</Error>
</template>

<script>
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

		khatch(`${postsHost}/v1/fetch_posts`, {
				method: 'POST',
				body: {
					sort: 'hot', // change to latest when added
					tags: [this.handle],
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
	},
	computed: {
		isMobile,
		isSelf() {
			return this.$store.state.user && this.$store.state.user?.handle === this.user?.handle;
		},
	},
	methods: {
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 125px 25px 25px;
}
.edit-profile-button {
	position: absolute;
	right: 30vw;
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}

</style>