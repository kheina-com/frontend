<template>
	<!-- eslint-disable vue/no-multiple-template-root -->
	<div class='banner'>
		<div class='nav'>
			<button ref='menuButton' @click='openMenu' class='menu-button icon' :title='`${menuOpen ? "Close" : "Open"} menu`'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
			</button>
			<form class='search-bar' v-on:submit.prevent='noop'>
				<input ref='search' name='search' :value='searchValue' placeholder='Search' class='interactable text'>
				<div class='cover'></div>
				<button @click='runSearchQuery'><i class='material-icons-round'>search</i></button>
			</form>
			<div class='profile' v-if='isLoggedIn'>
				<i class='material-icons icon' title='You are verified!' v-if='isVerified'>verified</i>
				<i class='kheina-icons icon' title='You are an admin' v-if='isAdmin'>sword</i>
				<i class='material-icons icon' title='You are a moderator' v-if='isMod'>verified_user</i>
				<Loading :isLoading='false' class='profile-image'>
					<router-link :to='`/${handle}`' v-if='true'>
						<img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'>
					</router-link>
				</Loading>
			</div>
			<div class='profile' v-else>
				<router-link to='/account/login' class='interactable login'>Login</router-link>
			</div>
		</div>
		<button class='interactable edit-message-button' @click='toggleEditMessage' title='Edit banner message' v-if='isAdmin'><i class='material-icons-round'>{{editMessage ? 'edit_off' : 'edit'}}</i></button>
		<div v-if='editMessage' class='markdown edit-message'>
			<textarea ref='messageField' class='interactable text' v-model='message'></textarea>
			<div style='display: flex; '>
				<Button @click='updateMessage'>update</button>
				<Button @click='removeMessage' red>remove</button>
			</div>
		</div>
		<Markdown :content='message' v-else-if='message'/>
	</div>
	<div class='menu' ref='menu'>
		<router-link to='/create' class='create' title='Create new post'>
			<div class='icon'>
				<i class='material-icons'>create</i>
			</div>
			<p>
				Create
			</p>
		</router-link>
		<ul class='inner'>
			<li v-if='isMod'>
				<router-link to='/mod'>
					<i class='material-icons'>shield</i>Moderate
				</router-link>
			</li>
			<li v-if='isAdmin'>
				<ul>
					<li >
						<button><i class='material-icons'>add_moderator</i>Add Mod</button>
					</li>
					<li >
						<button><i class='material-icons'>remove_moderator</i>Remove Mod</button>
					</li>
				</ul>
			</li>
			<li>
				<router-link to='/search'><i class='material-icons-round'>search</i>Image Search</router-link>
			</li>
			<li>
				<router-link to='/tags'><i class='material-icons-round'>tag</i>Tags</router-link>
			</li>
			<li>
				<router-link to='/emoji'><i class='material-icons-round'>dynamic_feed</i>Emoji</router-link>
			</li>
			<li v-if='isLoggedIn'>
				<router-link :to='`/${handle}`'><i class='material-icons-round'>alternate_email</i>Profile</router-link>
			</li>
			<li v-if='isLoggedIn'>
				<ul>
					<li >
						<router-link :to='`/${handle}?edit=1`'><i class='material-icons-round'>manage_accounts</i>Edit</router-link>
					</li>
				</ul>
			</li>
			<li v-if='isLoggedIn'>
				<router-link to='/account'><i class='material-icons-round'>miscellaneous_services</i>Account</router-link>
			</li>
			<li v-if='isLoggedIn'>
				<button @click='signOut'><i class='material-icons-round'>logout</i>Sign Out</button>
			</li>
			<li v-if='!isLoggedIn'>
				<router-link to='/account/create'><i class='material-icons-round'>person_add</i>Create Account</router-link>
			</li>
			<li v-if='!isLoggedIn'>
				<router-link to='/account/login'><i class='material-icons-round'>login</i>Login</router-link>
			</li>
			<li>
				<router-link to='/content'><i class='material-icons'>article</i>Content Policy</router-link>
			</li>
			<li>
				<router-link to='/report'><i class='kheina-icons'>report_content</i>Report Content</router-link>
			</li>
			<li>
				<router-link to='/bug'><i class='material-icons-round'>bug_report</i>Report a Bug</router-link>
			</li>
			<li>
				<router-link to='/privacy'><i class='material-icons'>policy</i>Privacy Policy</router-link>
			</li>
		</ul>
	</div>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, authCookie, deleteCookie } from '@/utilities';
import Loading from '@/components/Loading.vue';
import Markdown from '@/components/Markdown.vue';
import Button from '@/components/Button.vue';

export default {
	name: 'Banner',
	components: {
		Markdown,
		Loading,
		Button,
	},
	props: {
		onResize: {
			type: Function,
			default() { },
		},
	},
	setup() {
		const search = ref(null);
		const menu = ref(null);
		const messageField = ref(null);
		const menuButton = ref(null);
		return {
			search,
			menu,
			messageField,
			menuButton,
		};
	},
	data() {
		return {
			message: 'Black Lives Matter. [blacklivesmatters.carrd.co](https://blacklivesmatters.carrd.co/)',
			editMessage: false,
			menuOpen: false,
			handle: 'handle',
		};
	},
	computed: {
		isVerified() {
			return false;
		},
		isMod() {
			return Boolean(authCookie()?.scope?.includes('mod'));
		},
		isAdmin() {
			return Boolean(authCookie()?.scope?.includes('admin'));
		},
		isLoggedIn() {
			return authCookie() !== null;
		},
		searchValue() {
			if (this.$route.path.startsWith('/s/'))
			{ return decodeURIComponent(this.$route.path.substring(3)); }
			else if (this.$refs.search)
			{ return this.$refs.search.value; }
			else
			{ return ''; }
		},
		showUploadButton() {
			return this.$route.path !== '/create';
		},
	},
	methods: {
		getMediaThumbnailUrl,
		runSearchQuery() {
			const query = this.$refs.search.value;
			this.$router.push(query ? '/s/' + encodeURIComponent(this.$refs.search.value) : '/');
		},
		signOut() {
			deleteCookie('kh-auth');
			location.reload(); 
		},
		openMenu() {
			this.menuOpen = !this.menuOpen;
			if (this.menuOpen)
			{
				this.$refs.menu.classList.add('open');
				this.$refs.menuButton.classList.add('open');
			}
			else
			{
				this.$refs.menu.classList.remove('open');
				this.$refs.menuButton.classList.remove('open');
			}
		},
		toggleEditMessage() {
			this.editMessage = !this.editMessage;
			setTimeout(this.onResize, 0);
		},
		updateMessage() {
			this.editMessage = false;
			// send post to service that doesn't exist
			setTimeout(this.onResize, 0);
		},
		removeMessage() {
			this.editMessage = false;
			// send post to service that doesn't exist
			this.message = null;
			setTimeout(this.onResize, 0);
		},
	},
}
</script>

<style scoped>
.menu {
	font-size: 1em;
	position: absolute;
	width: 20vw;
	min-width: 200px;
	background: var(--bg2color);
	border-right: 1px solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	height: 100vh;
	top: 0;
	left: -25vw;
	left: calc(min(-20vw, -200px) - 3px);
	z-index: 9;
}
.menu.open {
	position: fixed;
	left: 0;
}

.menu .inner {
	padding: 0.5em 5px 0;
	margin: 2.5rem 20px 25px;
	border-top: 1px solid var(--bordercolor);
}
.menu button {
	font-size: 1em;
}
.banner {
	width: 100%;
	background: var(--bg1color);
	text-align: center;
}
.nav {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 2.5rem;
}
.menu-button {
	left: 0;
	position: absolute;
	z-index: 10;
}
.menu-button.open {
	position: fixed;
}

.menu-button i {
	font-size: 1.5em;
}
.markdown {
	padding: 20px 0 25px;
}
textarea {
	margin-bottom: 25px;
	min-width: 800px;
	width: 50vw;
	resize: none;
	height: 4em;
}
.profile {
	display: inline-block;
	margin-right: auto;
	display: flex;
	align-items: center;
	position: absolute;
	right: 0;
}
.profile i {
	cursor: default;
}
.profile .inner {
	display: flex;
	align-items: center;
}
.profile-image {
	width: 2rem;
	height: 2rem;
	padding: 0.25rem;
}
.profile-image *  {
	display: block;
	width: 2rem;
	height: 2rem;
}
.profile-image img {
	border-radius: 3px;
}
.login {
	font-size: 0.9em;
	margin-right: 0.25em;
}

.search-bar {
	position: relative;
}
.search-bar input {
	min-width: 300px;
	width: 30vw;
}
i {
	font-size: 1.2em;
	display: block;
}
.search-bar button
{
	font-size: 1.2em;
	position: absolute;
	right: 0;
	top: 0;
	padding: 0.25em;
	height: 100%;
	border: none;
	background: none;
	color: var(--textcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	cursor: pointer;
}
button:hover /*, button:active, button:focus */
{ color: var(--icolor); }

.search-bar .cover {
	position: absolute;
	background: linear-gradient(to right, #0000 0, var(--bg2color) 50%);
	padding-left: 1.5em;
	height: 1em;
	right: 0.5em;
	top: 0.5em;
}
ul {
	list-style: none;
	margin: 0;
	padding: 0;
}
ul li {
	margin: 0 0 0.5em;
}
ul li, li a, li button, .create {
	display: flex;
	align-items: center;
}
li ul {
	margin: 0 0 0 25px;
}
ul i, .menu i {
	display: inline-block;
	margin: 0 0.25em 0 0;
}
ul > :last-child {
	margin: 0;
}
.create {
	position: absolute;
    margin: 0 0 0 2.5rem;
	padding: 0 1em 0 0;
    height: 2.5rem;
}
.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2.5rem;
	height: 2.5rem;
}
.create .icon {
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	position: relative;
	left: 25vw;
	left: calc(max(20vw, 200px) + 3px);
}
.create i {
	margin: 0;
}
.create p {
	margin-left: -0.25em;
}
.menu.open .create .icon {
	left: 0;
}

.edit-message-button {
	position: absolute;
	right: 25px;
	margin-top: 0.5em;
	padding: 0.5em;
	z-index: 8;
}
.edit-message-button i {
	font-size: 1.5em;
}
.edit-message {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.edit-message button {
	margin: 0 12.5px
}
</style>
