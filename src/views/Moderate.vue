<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main v-if='$store.state.auth?.isMod'>
		<Post :postId='post?.post_id' :nested='true' v-bind='post' hideButtons labels v-if='post'/>
		<Title v-else>Moderate Content</Title>
		<div class='container'>
			<span>Select an action to perform below</span>
		</div>
		<div class='action-select'>
			<RadioButtons
				name='action-type'
				v-model:value='action'
				:data="[
					{ content: 'Force Update', value: 'force-update' },
					{ content: 'Remove Post', value: 'remove-post' },
					{ content: 'Account Ban', value: 'ban' },
					{ content: 'IP Ban', value: 'ip-ban' },
				]"
			/>
		</div>
		<div class='action-description'>
			<p v-if='action === "ban"'>Locks the user's account, preventing them from posting again. Prevents other users from viewing their account or its contents.</p>
			<p v-else-if='action === "ip-ban"'>Locks the user's current IP address and the IP address they initially logged in from. Prevents anyone from that IP from creating a new account or logging in.</p>
			<p v-else-if='action === "remove-post"'>Prevents the post from being modified or viewed by non-mods and non-admins. The user can still view the post.</p>
			<p v-else-if='action === "force-update"'>Locks the post from being viewed by non-mods and non-admins until the user updates a specific field.</p>
		</div>
		<div class='container force-update' v-if='action === "force-update"'>
			<span>Field and change that must be applied to the post before it is unlocked</span>
			<div v-for='i in fieldUpdates.length' class='field-updates'>
				<select name='post-field' v-model='fieldUpdates[i-1].field' @change='setFields' placeholder='field' class='interactable'>
					<option value='rating'>Rating</option>
					<option value='title'>Title</option>
					<option value='description'>Description</option>
					<option value='privacy'>Privacy</option>
					<option value='tags'>Tags</option>
				</select>
				<input name='post-field-value' v-model='fieldUpdates[i-1].value' @change='setFields' placeholder='value to add' autocomplete='off' class='interactable'>
				<button class='interactable' @click='fieldUpdates.splice(i-1, 1); setFields()'><i class='material-icons-outline'>delete</i>Remove</button>
			</div>
			<div class='buttons'>
				<button class='interactable' @click='fieldUpdates.push({ }); setFields()'><i class='material-icons'>add</i>Add Field</button>
			</div>
		</div>
		<div class='container'>
			<span>Data included from the report</span>
			<pre>{{JSON.stringify(data, null, 4)}}</pre>
		</div>
		<div class='container'>
			<span>Message that will be sent to the user regarding the above action</span>
			<textarea class='interactable text' v-model='data.message'></textarea>
			<div class='buttons'>
				<button class='interactable' @click='takeAction'>Submit »</button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
	<main v-else>
		<Title>Moderate Content</Title>
		<div class='container'>
			<div class='not-mod'>
				<i class='material-icons'>remove_moderator</i> You cannot access this page without being a moderator
			</div>
		</div>
		<ThemeMenu/>
	</main>

</template>

<script>
import { createToast, khatch } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import Post from '@/components/Post.vue';
import DropDown from '@/components/DropDown.vue';


export default {
	name: 'Moderate',
	components: {
		ThemeMenu,
		Title,
		RadioButtons,
		Post,
		DropDown,
	},
	data() {
		return {
			data: this.$route.query,
			action: null,
			post: null,
			fieldUpdates: [{ }],
		};
	},
	created() {
		if (this.$route.query?.post)
		{
			this.post = this.$route.query?.post;
			khatch(
				`${host}/v1/posts/${this.post}`,
				{ handleError: true },
			).then(response => {
				response.json().then(r => {
					r.favorites = 0;
					r.reposts = 0;
					this.post = r;
				});
			});
		}
	},
	methods: {
		takeAction() {
			createToast({
				title: "This feature doesn't exist yet, sorry!",
				description: "yes, I know this is a very important feature. it's currently being worked on",
			});
		},
		setFields(value) {
			if (this.action === 'force-update') {
				this.data.field_updates = { };
				this.fieldUpdates.forEach(entry => this.data.field_updates[entry.field] = entry.value);
			}
			else {
				delete this.data.field_updates;
			}
		},
	},
	watch: {
		action(value) {
			this.data.action = value;
			if (value === 'force-update') {
				this.data.field_updates = { };
				this.fieldUpdates.forEach(entry => this.data.field_updates[entry.field] = entry.value);
			}
			else {
				delete this.data.field_updates;
			}
		},
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}

input {
	display: block;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	background: var(--bg2color);
	color: var(--textcolor);
	font-size: 1em;
	width: 100%;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
input:hover {
	color: var(--interact);
}
input:active, input:focus {
	color: var(--textcolor);
}

.not-mod {
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	margin: auto;
}

.not-mod i {
	margin-right: 0.25em;
}

.container, .action-description {
	width: 60vw;
	min-width: 600px;
}
.mobile .container, .mobile .action-description {
	width: 100%;
}
.container {
	margin: var(--margin) auto 0;
}
.action-description {
	text-align: center;
	margin: 0.5em auto var(--margin);
}

textarea {
	width: 100%;
	resize: vertical;
	height: 10em;
}

span {
	position: relative;
	left: var(--margin);
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
	margin-bottom: 0.5em;
}

.radio-buttons {
	justify-content: center;
}

span {
	padding-bottom: 0.1em;
}

.buttons {
	margin-top: var(--margin);
	text-align: right;
}

.field-updates {
	display: flex;
	margin-bottom: 1em;
}
.force-update .buttons {
	margin-top: 0;
}
input {
	margin: 0 var(--margin);
	width: 100%;
}

button {
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
}
button i {
	margin-right: 0.25em;
}


@media only screen and (max-width: 1200px) {
	.container, .action-description {
		width: auto;
	}
}
</style>
