<template>
	<div class='banner'>
		<div class='nav-backdrop'/>
		<div v-if='editMessage' class='markdown edit-message'>
			<MarkdownEditor resize='none' v-model:value='message' style='min-width: 70vw; display: inline-block'/>
			<p>note: banner is always centered</p>
			<div style='display: flex'>
				<Button @click='updateMessage'>update</button>
				<Button @click='removeMessage' red>remove</button>
			</div>
		</div>
		<Markdown :content='message' v-else-if='message'/>
		<Button class='interactable edit-message-button' @click='toggleEditMessage' title='Edit banner message' v-if='$store.state.auth?.isAdmin'>
			<i class='material-icons-round'>{{editMessage ? 'edit_off' : 'edit'}}</i>
		</Button>
		<div class='nav'>
			<div class='bg'/>
			<div class='profile' v-if='$store.state.auth'>
				<div class='icon' id='user-verification'></div>
				<Loading :isLoading='isIconLoading' class='profile-image'>
					<router-link :to='`/${$store.state.user?.handle}`'>
						<UserIcon :handle='$store.state.user?.handle' :post='$store.state.user?.icon' v-model:isLoading='isIconLoading' v-if='$store.state.user'/>
					</router-link>
				</Loading>
			</div>
			<div class='profile' v-else>
				<router-link :to='`/account/login?path=${route}`' class='interactable login'>Login</router-link>
			</div>
			<SearchBar v-model:value='searchValue' :func='runSearchQuery'/>
		</div>
		<div class='screen-cover' @click='closeMenu'/>
		<div class='menu'>
			<a href='/create' @click.stop.prevent='navCreate' :class='$store.state.auth ? "create" : "create logged-out"' title='Create new post'>
				<div class='icon'>
					<i class='material-icons'>upload</i>
				</div>
				<p>
					Upload
				</p>
			</a>
			<div class='menu-border'/>
			<div class='inner'>
				<ol>
					<li v-if='environment == "local"'>
						<a :href='`https://dev.fuzz.ly${$route.fullPath}`'><i class='material-icons-round'>open_in_new</i>Dev</a>
					</li>
					<li v-else-if='environment == "dev"'>
						<a :href='`http://localhost:3000${$route.fullPath}`'><i class='material-icons-round'>open_in_new</i>Localhost</a>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/?#'><i class='material-icons-round'>home</i>Home</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth'>
						<span @click='closeMenu'>
							<router-link to='/notifications'>
								<div class='notifications'>
									<i class='material-icons-round'>notifications</i>
									<div class='counter' v-show='$store.state.notifications'>
										<span>{{$store.state.notifications}}</span>
									</div>
								</div>
								Notifications
							</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth'>
						<span @click='closeMenu'>
							<router-link to='/timeline'>
								<i class='material-icons'>timeline</i>
								Timeline
							</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth?.isMod'>
						<span @click='closeMenu'>
							<router-link to='/mod/queue'><i class='material-icons'>security</i>Moderate</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth?.isAdmin'>
						<ol>
							<li>
								<span @click='closeMenu'>
									<router-link to='/admin'><i class='kheina-icons'>sword</i>Admin Shit</router-link>
								</span>
							</li>
							<li>
								<span @click='closeMenu'>
									<button><i class='material-icons'>add_moderator</i>Add Mod</button>
								</span>
							</li>
							<li>
								<span @click='closeMenu'>
									<button><i class='material-icons'>remove_moderator</i>Remove Mod</button>
								</span>
							</li>
							<li>
								<span @click='closeMenu'>
									<router-link to='/users'><i class='material-icons-round'>people</i>All Users</router-link>
								</span>
							</li>
						</ol>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/search'><i class='material-icons-round'>search</i>Image Search</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/tags'><i class='material-icons-round'>tag</i>Tags</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/emoji'><i class='material-icons-round'>dynamic_feed</i>Emoji</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth'>
						<span @click='closeMenu'>
							<router-link :to='`/${$store.state.user?.handle}`'><i class='material-icons-round'>alternate_email</i>Profile</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth'>
						<ol>
							<li>
								<span @click='closeMenu'>
									<router-link :to='`/${$store.state.user?.handle}?edit=1`'><i class='material-icons-round'>manage_accounts</i>Edit</router-link>
								</span>
							</li>
						</ol>
					</li>
					<li v-show='$store.state.auth'>
						<span @click='closeMenu'>
							<router-link to='/account'><i class='material-icons-round'>miscellaneous_services</i>Settings</router-link>
						</span>
					</li>
					<li v-show='$store.state.auth'>
						<button @click='signOut'><i class='material-icons-round'>logout</i>Sign Out</button>
					</li>
					<li v-show='!$store.state.auth'>
						<span @click='closeMenu'>
							<router-link to='/account/create'><i class='material-icons-round'>person_add</i>Create Account</router-link>
						</span>
					</li>
					<li v-show='!$store.state.auth'>
						<span @click='closeMenu'>
							<router-link :to='`/account/login?path=${route}`'><i class='material-icons-round'>login</i>Login</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/report'><i class='kheina-icons'>report_content</i>Report Content</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link :to='`/bug?url=${route}`'><i class='material-icons-round'>bug_report</i>Report a Bug</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/privacy'><i class='material-icons'>policy</i>Privacy Policy</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/content'><i class='material-icons'>article</i>Content Policy</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/terms'><i class='material-icons'>gavel</i>Terms of Service</router-link>
						</span>
					</li>
					<ThemeSelector class='theme-menu'/>
				</ol>
				<div class='menu-footer'>
					<!-- TODO: replace this with an svg once one gets made -->
					<img src='https://cdn.fuzz.ly/splash.png'>
					<p class='commit'>version: <code @click='closeMenu'><router-link to='/version'>{{commit}}</router-link></code></p>
				</div>
			</div>	
		</div>
		<div class='menu-button' v-if='isMobile'>
			<button @click='toggleMenu' class='icon' :title='`${menuOpen ? "Close" : "Open"} menu`'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
				<div class='counter' v-show='!menuOpen && $store.state.notifications'>
					<span>{{$store.state.notifications}}</span>
				</div>
			</button>
		</div>
		<div class='menu-button' v-else>
			<button @click='toggleMenu' class='icon' :title='`${menuOpen ? "Close" : "Open"} menu`'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
			</button>
			<router-link to='/notifications' class='icon notifications' title='Notifications' v-if='$store.state.auth'>
				<i class='material-icons-round'>notifications</i>
				<div class='counter' v-show='$store.state.notifications'>
					<span>{{$store.state.notifications}}</span>
				</div>
			</router-link>
			<router-link to='/timeline' class='icon timeline' title='Timeline' v-if='$store.state.auth'>
				<i class='material-icons'>timeline</i>
			</router-link>
		</div>
	</div>
</template>

<script>
import { deleteCookie, khatch } from '@/utilities';
import { host, environment, isMobile, ratings } from '@/config/constants.js';
import Loading from '@/components/Loading.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';
import Button from '@/components/Button.vue';
import UserIcon from '@/components/UserIcon.vue';
import ThemeSelector from '@/components/ThemeSelector.vue';
import SearchBar from '@/components/SearchBar.vue';


export default {
	name: 'Banner',
	components: {
		Markdown,
		MarkdownEditor,
		Loading,
		Button,
		UserIcon,
		ThemeSelector,
		SearchBar,
	},
	props: {
		onResize: {
			type: Function,
			default() { },
		},
	},
	data() {
		return {
			isMobile,
			commit: __SHORT_COMMIT_HASH__,
			message: null,
			editMessage: false,
			menuOpen: false,
			isMessageLoading: true,
			isIconLoading: true,
			searchValue: null,
			environment,
		};
	},
	mounted() {
		this.updateLoop();
		this.$watch(
			() => this.$route.path,
			this.setQuery,
		);
		this.$watch(
			() => this.$store.state.user,
			this.setUser,
		)
	},
	computed: {
		route() {
			return encodeURIComponent(this.$route.fullPath)
		},
	},
	methods: {
		navCreate() {
			this.$router.push("/create");
			document.dispatchEvent(new CustomEvent("router-event"));
		},
		updateLoop() {
			khatch(`${host}/v1/config/banner`, {
				errorMessage: 'Error Occurred While Fetching Banner',
			}).then(response => {
				response.json().then(r => {
					this.message = r.banner;
					this.isMessageLoading = false;
					setTimeout(this.onResize, 0);
				});
			});
			setTimeout(this.updateLoop, 300e3);
		},
		setQuery() {
			if (this.$route.path.match(/^\/[qt]\//))
			{ this.searchValue = decodeURIComponent(this.$route.path.substring(3)); }
			else if (this.$route.path == '/')
			{ this.searchValue = null; }
		},
		setUser(user) {
			// console.log("user:", user);
			switch (user?.verified) {
				case 'admin':
					return;
			}
			// <i class='kheina-icons' title='You are an admin' v-if='$store.state.auth?.isAdmin'>sword</i>
			// <i class='material-icons' title='You are a moderator' v-else-if='$store.state.auth?.isMod'>verified_user</i>
			// <i class='material-icons' :title='`You are a verified ${$store.state.user.verified}`' v-else-if='$store.state.user?.verified'>verified</i>
		},
		runSearchQuery() {
			if (!this.searchValue) {
				this.$router.push('/');
				return;
			}

			const query = this.searchValue.trim();

			if (!query) {
				this.$router.push('/');
				return;
			}

			if (query.match(/^set:[A-Za-z0-9_-]{7}$/)) {
				this.$router.push('/s/' + query.substring(4));
				return;
			}

			let route = '/t/';
			if (ratings.has(query) || query.startsWith('@') || query.startsWith('-') || query.startsWith('sort:') || query.includes(' ')) {
				route = '/q/';
			}

			this.$router.push(route + encodeURIComponent(query));
		},
		signOut() {
			khatch(host + '/v1/account/logout', {
				method: 'DELETE',
				errorMessage: 'Could not perform logout!',
			}).then(() => {
				deleteCookie('kh-auth');
				document.cookie = `kh-auth=null; expires=${new Date(0)}; samesite=lax; domain=.fuzz.ly; path=/; secure`;
				this.$store.commit('setAuth', null);
			});
		},
		toggleMenu() {
			this.menuOpen = !this.menuOpen;
			if (this.menuOpen)
			{ document.body.classList.add('menu-open'); }
			else
			{ document.body.classList.remove('menu-open'); }
		},
		closeMenu() {
			this.menuOpen = false;
			document.body.classList.remove('menu-open');
		},
		toggleEditMessage() {
			this.editMessage = !this.editMessage;
			setTimeout(this.onResize, 0);
		},
		updateMessage() {
			this.isMessageLoading = true;
			khatch(`${host}/v1/config/update_config`, {
					method: 'POST',
					body: {
						config: 'banner',
						value: {
							banner: this.message,
						},
					},
				})
				.then(response => {
					if (response.status < 300)
					{
						this.isMessageLoading = this.editMessage = false;
						setTimeout(this.onResize, 0);
					}
					else
					{ console.error(response); }
				})
				.catch(error => {
					console.error(error);
				});
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
	border-right: var(--border-size) solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	height: 100%;
	top: 0;
	left: -25vw;
	left: calc(min(-20vw, -18em) - 6px);
}

html.mobile .menu {
	width: 75vw;
	left: -75vw;
	left: calc(-75vw - 6px);
}
html.mobile .menu-open .menu, .menu-open .menu {
	left: 0;
}

.screen-cover {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
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
	padding: 0.5em var(--margin) 0;
	margin: 0;
	overflow: auto;
	height: 80%;
	height: calc(100% - 2.5rem);
	display: flex;
	flex-flow: column;
	justify-content: space-between;
}
.mobile .menu .inner {
	height: calc(100% - 4rem);
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
}
.nav .bg {
	position: absolute;
	background: var(--bg1color);
	opacity: 95%;
	width: 100%;
	height: 100%;
}
.menu-button {
	left: 0;
	top: 0;
	position: fixed;
}
.menu-open .menu-button {
	position: fixed;
}

.menu-button i, .create i {
	font-size: 1.5em;
}
.markdown {
	padding: 20px 0 var(--margin);
	position: relative;
	background: var(--bg1color);
}
textarea {
	margin-bottom: var(--margin);
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
.profile-image * {
	display: block;
	width: 2rem;
	height: 2rem;
}
.profile-image img {
	border-radius: var(--border-radius);
}
.login {
	font-size: 0.9em;
	margin-right: 0.25em;
}
i {
	font-size: 1.2em;
	display: block;
}
.menu-border {
	border-top: var(--border-size) solid var(--bordercolor);
	margin: 2.5rem 20px 0;
}

.mobile .menu-border {
	margin-top: 4em;
}

ol {
	list-style: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 0.5em;
}
ol li, li a, li button, .create {
	display: flex;
	align-items: center;
}
li ol {
	margin: 0 0 0 1em;
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
	margin: 0 0 0 10rem;
	padding: 0;
	height: 2.5rem;
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
	left: 7.5rem;
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
.counter {
	position: absolute;
	top: 0;
	right: -0.9em;
	width: 5em;
	pointer-events: none;
}
.menu-button .notifications .counter {
	right: -1.8em;
}
.menu .counter {
	top: -0.5em;
	right: -1.2em;
}
.counter span {
	font-size: 0.5em;
	background: var(--notification-bg);
	padding: 0.25em 0.5em;
	border-radius: 1em;
	color: var(--notification-text);
}
.timeline {
	position: absolute;
	top: 0;
	left: 5rem;
}
.create p {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
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
	right: var(--margin);
	padding: 0.25em;
	top: calc(2.5rem + 20px);
}
.mobile .edit-message-button {
	top: calc(4rem + 20px);
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
	margin: 0 var(--half-margin)
}
.theme-menu {
	margin-top: var(--margin);
}

/* MOBILE */
.mobile .menu ol {
	font-size: 2rem;
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
.mobile .profile-image * {
	display: block;
	width: 3.5rem;
	height: 3.5rem;
}

.mobile .create .icon {
	left: 4rem;
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

.menu-footer {
	margin-top: var(--margin);
}
.menu-footer img {
	opacity: 33.333%;
	width: 100%;
}
.menu-footer p {
	margin: 0;
	font-size: 0.75rem;
	color: var(--subtle);
	position: relative;
	bottom: 1.25em;
}
.menu-footer a {
	color: var(--subtle);
}
</style>
