<template>
	<!-- eslint-disable vue/valid-v-for -->
	<Error :dump='errorDump' :message='errorMessage'>
		<div style='width: 60vw; margin: 0 auto; display: flex; justify-content: space-between; align-items: end; margin-bottom: -128px; padding: 25px 0; z-index: 1; position: relative'>
			<Loading :isLoading='isIconLoading' class='profile-image'>
				<router-link :to='`/p/${user?.icon}`'>
					<Thumbnail :size='400' :post='user?.icon' v-model:isLoading='isIconLoading' style='width: 200px; height: 200px; border-radius: 5px; border: solid 3px var(--bordercolor)'/>
				</router-link>
			</Loading>
			<p v-if='user?.website' style='display: flex; align-items: center'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
			<p style='display: flex; align-items: center'><i class='material-icons'>schedule</i><span>joined <Timestamp :datetime='user?.created' style='color: var(--textcolor)'/></span></p>
			<div style='text-align: right'>
				<h2 style='margin: 0; display: flex; align-items: center'>{{user?.name}}<i class='material-icons' v-if='user?.privacy === "private"'>lock</i></h2>
				<p style='margin: 0'>@{{user?.handle}}</p>
			</div>
		</div>
		<main>
			<Markdown :content='user?.description' style='margin-top: 25px; width: 60vw; margin: 25px auto 0'/>
			<div style='margin-top: 25px'>
				<p v-if='posts?.length === 0' style='text-align: center'>{{user?.name || user?.handle}} hasn't made any posts yet.</p>
				<Post v-for='post in posts || 3' :postId='post?.post_id' :nested='true' v-bind='post' v-else/>
			</div>
			<ThemeMenu />
		</main>
	</Error>
</template>

<script>
import { khatch, setTitle } from '@/utilities';
import { apiErrorMessage, postsHost, usersHost } from '@/config/constants';
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
	},
	created() {
		khatch(`${usersHost}/v1/fetch_user/${this.handle}`)
			.then(response => {
				response.json().then(r => {
					console.log(r);
					if (response.status < 300)
					{
						this.user = r;
						setTitle(this.user?.name || this.user?.handle);
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
	},
	methods: {
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 100px 25px 25px;
}
form div {
	width: 100%;
}
form .text
{
	width: 100%;
	color: var(--textcolor);
	padding: 0.5em;
}
form .text:hover
{ color: var(--icolor); }
form .text:active, form .text:focus
{ color: var(--textcolor); }
input
{
	display: inline-block;
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	background: var(--bg2color);
	color: var(--textcolor);
	font-size: 1em;
	padding: 1px 3px;
}
form
{
	width: 50em;
	max-width: calc(100% - 50px);
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	margin: 0 auto;
}
form span
{
	position: relative;
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}
form .maxrating, form .integratedsearch
{
	margin: -14px 0 9px;
	padding: 0.5em 0;
	display: inline-block;
	width: calc(100% - 80px);
	line-height: 3;
}
form .maxrating input, form .integratedsearch input, form .submit input
{
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
form input
{ margin: 0 0 25px; }
form p
{ margin-left: 25px; }

form
{ max-width: 22em; }
form input.submit
{ float: right; }
form input#passwordRepeat
{
	width: 225px;
	width: calc(100% - 125px);
}
form input.valid:active, form input.valid:focus
{ border-color: var(--valid); }
form input.error:active, form input.error:focus
{ border-color: var(--error); }

label.hide-password
{
	position: absolute;
	right: 0;
	margin: 0.5em;
	height: 24px;
}
label.hide-password svg
{ height: 24px; }
div#password-pwned
{
	position: absolute;
	right: 10px;
	display: inline-block;
	/* pointer-events: none; */
	margin-top: 7px;
	height: 24px;
}
input#hide-password
{ display: none; }
div#password-pwned svg
{ height: 24px; }
.password {
	margin: 0 25px 0 0;
}
</style>