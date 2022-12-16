<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Post :postId='post?.post_id' :nested='true' v-bind='post' labels v-if='post'/>
		<Title v-else>Moderate Content</Title>
		<div class='container'>
			<span>Select an action to perform below</span>
		</div>
		<div class='action-select'>
			<RadioButtons
				name='action-type'
				v-model:value='action'
				:data="[
					{ content: 'Account Ban', value: 'ban' },
					{ content: 'IP Ban', value: 'ip-ban' },
					{ content: 'Remove Post', value: 'remove-post' },
				]"
			/>
		</div>
		<div class='action-description'>
			<p v-if='action === "ban"'>Locks the user's account, preventing them from posting again. Prevents other users from viewing their account or its contents.</p>
			<p v-else-if='action === "ip-ban"'>Locks the user's current IP address and the IP address they initially logged in from. Prevents anyone from that IP from creating a new account or logging in.</p>
			<p v-else-if='action === "remove-post"'>Prevents the post from being modified or viewed by non-mods and non-admins. The user can still view the post.</p>
		</div>
		<div class='container'>
			<span>Data included from the report</span>
			<pre>{{JSON.stringify(data, null, 4)}}</pre>
		</div>
		<div class='container'>
			<span>Message that will be sent to the user regarding the above action</span>
			<textarea class='interactable text' v-model='message'></textarea>
			<div class='buttons'>
				<button class='interactable' @click='takeAction'>Submit »</button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import { createToast, khatch } from '@/utilities';
import { postsHost } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import Post from '@/components/Post.vue';


export default {
	name: 'Moderate',
	components: {
		ThemeMenu,
		Title,
		RadioButtons,
		Post,
	},
	data() {
		return {
			data: this.$route.query,
			action: null,
			post: null,
			message: null,
		};
	},
	created() {
		if (this.$route.query?.post)
		{
			this.post = this.$route.query?.post;
			khatch(
				`${postsHost}/v1/post/${this.post}`,
				{ handleError: true },
			).then(response => {
				response.json().then(r => {
					r.favorites = 0;
					r.reposts = 0;
					this.post = r;
				});
			})
			.catch(() => { });
		}
	},
	methods: {
		takeAction() {
			createToast({
				title: "This feature doesn't exist yet, sorry!",
				description: "yes, I know this is a very important feature. it's currently being worked on",
				dump: Object.assign(this.data, {
					action: this.action,
					message: this.message,
				}),
			});
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
.container, .action-description {
	width: 50vw;
	min-width: 600px;
	margin: 25px auto 0;
}
.mobile .container, .mobile .action-description {
	width: 100%;
}
.action-description {
	text-align: center;
	margin-bottom: 25px;
}

textarea {
	width: 100%;
	resize: vertical;
	height: 10em;
}

span {
	position: relative;
	left: 25px;
}

pre {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
	margin: 0 auto;
}
pre code {
	padding: 0;
}

.action-select {
	margin-bottom: 25px;
}

.radio-buttons {
	justify-content: center;
}

span {
	padding-bottom: 0.1em;
}

.buttons {
	margin-top: 25px;
	text-align: right;
}
</style>
