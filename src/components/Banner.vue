<template>
	<div class='banner'>
		<div class='nav-backdrop'></div>
		<div ref='menuButton' class='menu-button'>
			<button @click='toggleMenu' class='icon' :title='`${menuOpen ? "Close" : "Open"} menu`'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
			</button>
			<router-link to='/notifications' class='icon notifications' title='Notifications' v-if='isLoggedIn && !isMobile'>
				<i class='material-icons-round'>notifications</i>
				<div class='counter' v-show='true'>
					<span>1</span>
				</div>
			</router-link>
		</div>
		<div class='nav' :style='`background: ${navBgColor}`'>
			<form class='search-bar' v-on:submit.prevent='noop'>
				<input ref='search' name='search' :value='searchValue' placeholder='Search' class='interactable text'>
				<div class='cover'></div>
				<button @click='runSearchQuery'><i class='material-icons-round'>search</i></button>
				<i class='material-icons-round' style='position: absolute; right: -1.8em; top: 0; margin: 0.39em' title='Search help'>help_outline</i>
			</form>
			<div class='profile' v-if='isLoggedIn'>
				<i class='kheina-icons icon' title='You are an admin' v-if='isAdmin'>sword</i>
				<i class='material-icons icon' title='You are a moderator' v-else-if='isMod'>verified_user</i>
				<i class='material-icons icon' title='You are verified!' v-else-if='isVerified'>verified</i>
				<Loading :isLoading='isIconLoading' class='profile-image'>
					<router-link :to='`/${$store.state.user?.handle}`'>
						<Thumbnail :post='userIcon' v-model:isLoading='isIconLoading' :size='200'/>
					</router-link>
				</Loading>
			</div>
			<div class='profile' v-else>
				<router-link :to='`/account/login?path=${$route.fullPath}`' class='interactable login'>Login</router-link>
			</div>
		</div>
		<Button class='interactable edit-message-button' @click='toggleEditMessage' title='Edit banner message' v-if='isAdmin'><i class='material-icons-round'>{{editMessage ? 'edit_off' : 'edit'}}</i></Button>
		<div v-if='editMessage' class='markdown edit-message'>
			<textarea ref='messageField' class='interactable text' v-model='message'></textarea>
			<div style='display: flex'>
				<Button @click='updateMessage'>update</button>
				<Button @click='removeMessage' red>remove</button>
			</div>
		</div>
		<Markdown :content='message' v-else-if='message'/>
		<div class='menu' ref='menu'>
			<router-link to='/create' :class='(isLoggedIn ? ["create"] : ["create", "logged-out"]).join(" ")' title='Create new post'>
				<div class='icon'>
					<i class='material-icons'>upload</i>
				</div>
				<p>
					Upload
				</p>
			</router-link>
			<ol class='inner'>
				<li v-if='environment == "local"'>
					<a :href='`https://dev.kheina.com${$route.fullPath}`'><i class='material-icons-round'>open_in_new</i>Dev</a>
				</li>
				<li>
					<router-link to='/'><i class='material-icons-round'>home</i>Home</router-link>
				</li>
				<li v-if='isLoggedIn'>
					<router-link to='/notifications'>
						<div class='notifications'>
							<i class='material-icons-round'>notifications</i>
							<div class='counter' v-show='true'>
								<span>1</span>
							</div>
						</div>
						Notifications
					</router-link>
				</li>
				<li v-if='isMod'>
					<router-link to='/mod'>
						<i class='material-icons'>shield</i>Moderate
					</router-link>
				</li>
				<li v-if='isAdmin'>
					<ol>
						<li>
							<button><i class='material-icons'>add_moderator</i>Add Mod</button>
						</li>
						<li>
							<button><i class='material-icons'>remove_moderator</i>Remove Mod</button>
						</li>
						<li>
							<router-link to='/users'><i class='material-icons-round'>people</i>All Users</router-link>
						</li>
					</ol>
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
					<router-link :to='`/${$store.state.user?.handle}`'><i class='material-icons-round'>alternate_email</i>Profile</router-link>
				</li>
				<li v-if='isLoggedIn'>
					<ol>
						<li>
							<router-link :to='`/${$store.state.user?.handle}?edit=1`'><i class='material-icons-round'>manage_accounts</i>Edit</router-link>
						</li>
					</ol>
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
					<router-link :to='`/account/login?path=${$route.fullPath}`'><i class='material-icons-round'>login</i>Login</router-link>
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
				<ThemeSelector class='theme-menu'/>
			</ol>
		</div>
		<div class='screen-cover' ref='screenCover' @click='toggleMenu'></div>
	</div>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, deleteCookie, khatch } from '@/utilities';
import { configHost, environment } from '@/config/constants.js';
import Loading from '@/components/Loading.vue';
import Markdown from '@/components/Markdown.vue';
import Button from '@/components/Button.vue';
import Thumbnail from '@/components/Thumbnail.vue';
import ThemeSelector from '@/components/ThemeSelector.vue';


export default {
	name: 'Banner',
	components: {
		Markdown,
		Loading,
		Button,
		Thumbnail,
		ThemeSelector,
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
		const screenCover = ref(null);
		return {
			search,
			menu,
			messageField,
			menuButton,
			screenCover,
		};
	},
	data() {
		return {
			message: null,
			editMessage: false,
			menuOpen: false,
			isMessageLoading: true,
			isIconLoading: true,
			environment,
		};
	},
	mounted() {
		khatch(`${configHost}/v1/banner`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.message = r.banner; }
					else
					{ console.error(error); }
					this.isMessageLoading = false;
					setTimeout(this.onResize, 0);
				});
			})
			.catch(error => {
				console.error(error);
			});
	},
	computed: {
		isVerified() {
			return false;
		},
		isMod() {
			return Boolean(this.$store.state.auth?.scope?.includes('mod'));
		},
		isAdmin() {
			return Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
		isLoggedIn() {
			return Boolean(this.$store.state.auth);
		},
		searchValue() {
			if (this.$route.path.match(/^\/[st]\//))
			{ return decodeURIComponent(this.$route.path.substring(3)); }
			else if (this.$refs.search)
			{ return this.$refs.search.value; }
			else
			{ return ''; }
		},
		showUploadButton() {
			return this.$route.path !== '/create';
		},
		userIcon() {
			return this.$store.state.user?.icon;
		},
		navBgColor() {
			let bg1color = this.$store.state.theme.bg1color.trim();
			if (bg1color.length === 4)
			{
				return '#'
					+ bg1color.substr(1, 1)
					+ bg1color.substr(1, 1)
					+ bg1color.substr(2, 1)
					+ bg1color.substr(2, 1)
					+ bg1color.substr(3, 1)
					+ bg1color.substr(3, 1)
					+ Math.round(0.95 * 256).toString(16);
			}
			if (bg1color.length === 7)
			{ return bg1color + Math.round(0.95 * 256).toString(16); }
			return bg1color;
		},
	},
	methods: {
		getMediaThumbnailUrl,
		runSearchQuery() {
			const query = this.$refs.search.value;
			this.$router.push(query ? (query.includes(' ') ? '/q/' : '/t/') + encodeURIComponent(this.$refs.search.value) : '/');
		},
		signOut() {
			deleteCookie('kh-auth');
			this.$store.commit('setAuth', null);
		},
		toggleMenu() {
			this.menuOpen = !this.menuOpen;
			if (this.menuOpen)
			{ document.body.classList.add('menu-open'); }
			else
			{ document.body.classList.remove('menu-open'); }
		},
		toggleEditMessage() {
			this.editMessage = !this.editMessage;
			setTimeout(this.onResize, 0);
		},
		updateMessage() {
			this.isMessageLoading = true;
			khatch(`${configHost}/v1/update_config`, {
					method: 'POST',
					body: {
						config: 'banner',
						value: this.message,
					},
				})
				.then(response => {
					if (response.status < 300)
					{ this.isMessageLoading = this.editMessage = false; }
					else
					{ console.error(response); }
				})
				.catch(error => {
					console.error(error);
				});
			setTimeout(this.onResize, 0);
		},
		removeMessage() {
			this.message = null;
			this.updateMessage();
		},
	},
}
</script>

<style scoped>
.menu {
	font-size: 1em;
	position: fixed;
	width: 20vw;
	min-width: 18em;
	background: var(--bg2color);
	border-right: 1px solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	height: 100%;
	top: 0;
	left: -25vw;
	left: calc(min(-20vw, -18em) - 3px);
	z-index: 1;
}

html.mobile .menu {
	width: 75vw;
	left: -75vw;
	left: calc(-75vw - 3px);
}
html.mobile .menu-open .menu, .menu-open .menu {
	left: 0;
}

.screen-cover {
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	position: fixed;
	height: 100vh;
	width: 100vw;
	top: 0;
	left: 0;
	background: #0000;
	pointer-events: none;
}

.menu-open .screen-cover {
	background: var(--screen-cover);
	pointer-events: all;
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
	padding-top: 2.5rem;
	position: relative;
	z-index: 100;
}
.nav {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 2.5rem;
	top: 0;
	position: fixed;
	width: 100%;
}
.nav-backdrop {
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	height: 2.5rem;
	top: 0;
	position: fixed;
	width: 100%;
	z-index: -3;
}
.menu-button {
	left: 0;
	top: 0;
	position: fixed;
	z-index: 103;
}
.menu-open .menu-button {
	position: fixed;
}

.menu-button i, .create i {
	font-size: 1.5em;
}
.markdown {
	padding: 20px 0 25px;
	position: relative;
	z-index: -2;
	background: var(--bg1color);
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
	margin: 0.25rem;
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
	min-width: 400px;
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

.mobile .search-bar {
	font-size: 1.5em;
}

.search-bar .cover {
	position: absolute;
	background: linear-gradient(to right, #0000 0, var(--bg2color) 50%);
	padding-left: 1.5em;
	height: 1em;
	right: 0.5em;
	top: 0.5em;
}
ol {
	list-style: none;
	margin: 0;
	padding: 0;
	height: 80%;
	height: calc(100% - 3.5rem);
}
ol li {
	margin: 0 0 0.5em;
}
ol li, li a, li button, .create {
	display: flex;
	align-items: center;
}
li ol {
	margin: 0 0 0 25px;
}
ol i, .menu i {
	display: inline-block;
	margin: 0 0.25em 0 0;
}
ol > :last-child {
	margin-bottom: 0;
}
.create {
	position: absolute;
    margin: 0 0 0 7.5rem;
	padding: 0;
    height: 2.5rem;
	z-index: 10;
	left: 0;
	top: 0;
}
.create.logged-out {
	margin-left: 5rem;
}
.menu-open .create {
	padding-right: 1em;
}
.create .icon {
	position: fixed;
	left: 5rem;
}
.create.logged-out .icon {
	left: 2.5rem;
}
.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2.5rem;
	height: 2.5rem;
}
.menu-button .notifications {
	position: fixed;
	left: 2.5rem;
	top: 0;
}
.notifications {
	display: flex;
	position: relative;
}
.notifications .counter {
	position: absolute;
	top: 0;
	right: -1.8em;
	width: 5em;
	pointer-events: none;
}
.menu .notifications .counter {
	top: -0.5em;
	right: -1.2em;
}
.notifications .counter span {
	font-size: 0.5em;
	background: var(--red);
	padding: 0.25em 0.5em;
	border-radius: 1em;
	color: var(--textcolor);
}
.create p {
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	position: relative;
	right: 25vw;
	right: calc(max(20vw, 18em) + 3px);
	margin-left: -0.25em;
}
.create i {
	margin: 0;
}
html.mobile .menu-open .create p, .menu-open .create p {
	right: 0;
}

.edit-message-button {
	position: absolute;
	right: 25px;
	margin-top: 0.5em;
	padding: 0.25em;
	z-index: -1;
}
.edit-message-button i {
	margin: 0;
}
.edit-message {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.edit-message button {
	margin: 0 12.5px
}
.theme-menu {
	margin-top: 25px;
}

/* MOBILE */
.mobile .menu ol {
	font-size: 2rem;
}
.mobile .menu .inner {
	margin-top: 4rem;
}
.mobile .banner {
	padding-top: 4rem;
}
.mobile .nav {
	height: 4rem;
}
.mobile .nav-backdrop {
	height: 4rem;
}

.mobile .profile-image {
	width: 3.5rem;
	height: 3.5rem;
	margin: 0.25rem;
}
.mobile .profile-image *  {
	display: block;
	width: 3.5rem;
	height: 3.5rem;
}

.mobile .create .icon {
	left: 4rem;
}

.mobile ol {
	height: calc(100% - 7rem);
}
.mobile .create {
    margin-left: 8rem;
    height: 4rem;
	font-size: 2rem;
}
.mobile .icon {
	width: 4rem;
	height: 4rem;
	font-size: 1.8rem;
}
.mobile .menu-button .notifications {
	left: 4rem;
}
</style>
