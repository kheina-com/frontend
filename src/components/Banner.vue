<template>
	<div ref='banner' class='banner' id='banner'>
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
		<Button class='interactable edit-message-button' @click='toggleEditMessage' title='Edit banner message' v-if='globals.auth?.isAdmin'>
			<i class='material-icons-round'>{{editMessage ? 'edit_off' : 'edit'}}</i>
		</Button>
		<div class='nav'>
			<div class='bg'/>
			<div class='profile' v-if='globals.auth'>
				<div class='icon' id='user-verification'></div>
				<Loading :isLoading='isIconLoading' class='profile-image'>
					<router-link :to='`/${globals.user?.handle}`'>
						<UserIcon :handle='globals.user?.handle' :post='globals.user?.icon' v-model:isLoading='isIconLoading' v-if='globals.user'/>
					</router-link>
				</Loading>
			</div>
			<div class='profile' v-else>
				<router-link :to='`/a/login?path=${routePath}`' class='interactable login'>Login</router-link>
			</div>
			<SearchBar v-model:value='searchValue' :func='runSearchQuery'/>
		</div>
		<div class='screen-cover' @click='closeMenu'/>
		<div class='menu'>
			<a href='/create' @click.stop.prevent='navCreate' :class='globals.auth ? "create" : "create logged-out"' title='Create new post'>
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
					<li v-show='globals.auth'>
						<span @click='closeMenu'>
							<router-link to='/n'>
								<div class='notifications'>
									<i class='material-icons-round'>notifications</i>
									<div class='counter' v-show='globals.notifications'>
										<span>{{globals.notifications}}</span>
									</div>
								</div>
								Notifications
							</router-link>
						</span>
					</li>
					<li v-show='globals.auth'>
						<span @click='closeMenu'>
							<router-link to='/tl'>
								<i class='material-icons'>timeline</i>
								Timeline
							</router-link>
						</span>
					</li>
					<li v-show='globals.auth?.isMod'>
						<span @click='closeMenu'>
							<router-link to='/mod/queue'><i class='material-icons'>security</i>Moderate</router-link>
						</span>
					</li>
					<li v-show='globals.auth?.isAdmin'>
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
									<router-link to='/usr'><i class='material-icons-round'>people</i>All Users</router-link>
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
					<li v-show='globals.auth'>
						<span @click='closeMenu'>
							<router-link :to='`/${globals.user?.handle}`'><i class='material-icons-round'>alternate_email</i>Profile</router-link>
						</span>
					</li>
					<li v-show='globals.auth'>
						<ol>
							<li>
								<span @click='closeMenu'>
									<router-link :to='`/${globals.user?.handle}?edit=1`'><i class='material-icons-round'>manage_accounts</i>Edit</router-link>
								</span>
							</li>
						</ol>
					</li>
					<li v-show='globals.auth'>
						<span @click='closeMenu'>
							<router-link to='/a'><i class='material-icons-round'>miscellaneous_services</i>Settings</router-link>
						</span>
					</li>
					<li v-show='globals.auth'>
						<button @click='signOut'><i class='material-icons-round'>logout</i>Sign Out</button>
					</li>
					<li v-show='!globals.auth'>
						<span @click='closeMenu'>
							<router-link to='/a/create'><i class='material-icons-round'>person_add</i>Create Account</router-link>
						</span>
					</li>
					<li v-show='!globals.auth'>
						<span @click='closeMenu'>
							<router-link :to='`/a/login?path=${routePath}`'><i class='material-icons-round'>login</i>Login</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/r'><i class='kheina-icons'>report_content</i>Report Content</router-link>
						</span>
					</li>
					<li v-show='globals.auth'>
						<ol>
							<li>
								<span @click='closeMenu'>
									<router-link to='/rs'><i class='material-icons-round'>receipt_long</i>Your Reports</router-link>
								</span>
							</li>
						</ol>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link :to='`/bug?url=${routePath}`'><i class='material-icons-round'>bug_report</i>Report a Bug</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/priv'><i class='material-icons'>policy</i>Privacy Policy</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/con'><i class='material-icons'>article</i>Content Policy</router-link>
						</span>
					</li>
					<li>
						<span @click='closeMenu'>
							<router-link to='/term'><i class='material-icons'>gavel</i>Terms of Service</router-link>
						</span>
					</li>
					<ThemeSelector class='theme-menu'/>
				</ol>
				<div class='menu-footer'>
					<!-- TODO: replace this with an svg once one gets made -->
					<img src='https://cdn.fuzz.ly/splash.png'>
					<p class='commit'>version: <code @click='closeMenu'><router-link to='/v'>{{commit}}</router-link></code></p>
				</div>
			</div>	
		</div>
		<div class='menu-button' v-if='isMobile'>
			<button @click='toggleMenu' class='icon' :title='`${menuOpen ? "Close" : "Open"} menu`'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
				<div class='counter' v-show='!menuOpen && globals.notifications'>
					<span>{{globals.notifications}}</span>
				</div>
			</button>
		</div>
		<div class='menu-button' v-else>
			<button @click='toggleMenu' class='icon' :title='`${menuOpen ? "Close" : "Open"} menu`'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
			</button>
			<router-link to='/n' class='icon notifications' title='Notifications' v-if='globals.auth'>
				<i class='material-icons-round'>notifications</i>
				<div class='counter' v-show='globals.notifications'>
					<span>{{globals.notifications}}</span>
				</div>
			</router-link>
			<router-link to='/tl' class='icon timeline' title='Timeline' v-if='globals.auth'>
				<i class='material-icons'>timeline</i>
			</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { deleteCookie, khatch } from '@/utilities';
import { host, environment, isMobile } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';
import Button from '@/components/Button.vue';
import UserIcon from '@/components/UserIcon.vue';
import ThemeSelector from '@/components/ThemeSelector.vue';
import SearchBar from '@/components/SearchBar.vue';
import store, { Rating } from '@/globals';


const banner  = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const globals = store();
const props   = defineProps({
	onResize: {
		type: Function,
		default() { },
	},
});
const route     = useRoute();
const router    = useRouter();
const routePath = computed(() => encodeURIComponent(route.fullPath));
const commit    = __SHORT_COMMIT_HASH__;

const message:        Ref<string | null> = ref(null);
const editMessage:    Ref<boolean>       = ref(false);
const menuOpen:       Ref<boolean>       = ref(false);
const isIconLoading:  Ref<boolean>       = ref(true);
const searchValue:    Ref<string | null> = ref(null);

onMounted(() => {
	updateLoop();
	watch(
		() => route.path,
		setQuery,
	);
	watch(
		() => globals.user,
		setUser,
	)
});


function navCreate() {
	router.push("/create");
	document.dispatchEvent(new CustomEvent("router-event"));
}

function updateLoop() {
	khatch(`${host}/v1/config/banner`, {
		errorMessage: 'Error Occurred While Fetching Banner',
		errorHandlers: {
			404: () => {
				banner.value.style.background = "none";
			},
		},
	}).then(response => {
		response.json().then(r => {
			if (!r.banner) {
				banner.value.style.background = "none";
			} else {
				banner.value.style.background = "";
			}
			message.value = r.banner;
			setTimeout(props.onResize, 0);
		});
	});
	setTimeout(updateLoop, 300e3);
}

function setQuery() {
	if (route.path.match(/^\/[qt]\//))
	{ searchValue.value = decodeURIComponent(route.path.substring(3)); }
	else if (route.path == '/')
	{ searchValue.value = null; }
}

function setUser(user: any) {
	// console.log("user:", user);
	switch (user?.verified) {
		case 'admin':
			return;
	}
	// <i class='kheina-icons' title='You are an admin' v-if='globals.auth?.isAdmin'>sword</i>
	// <i class='material-icons' title='You are a moderator' v-else-if='globals.auth?.isMod'>verified_user</i>
	// <i class='material-icons' :title='`You are a verified ${globals.user.verified}`' v-else-if='globals.user?.verified'>verified</i>
}

function runSearchQuery() {
	if (!searchValue) {
		router.push('/');
		return;
	}

	const query = searchValue.value?.trim();

	if (!query) {
		router.push('/');
		return;
	}

	if (query.match(/^set:[A-Za-z0-9_-]{7}$/)) {
		router.push('/s/' + query.substring(4));
		return;
	}

	let route = '/t/';
	if (query in Rating || query.startsWith('@') || query.startsWith('-') || query.startsWith('sort:') || query.includes(' ')) {
		route = '/q/';
	}

	router.push(route + encodeURIComponent(query));
}

function signOut() {
	khatch(host + '/v1/account/logout', {
		method: 'DELETE',
		errorMessage: 'Could not perform logout!',
		errorHandlers: {
			401: () => { },
		},
	}).then(() => {
		deleteCookie('kh-auth');
		document.cookie = `kh-auth=null; expires=${new Date(0)}; samesite=lax; domain=.fuzz.ly; path=/; secure`;
		globals.setAuth(null);
	});
}

function toggleMenu() {
	menuOpen.value = !menuOpen.value;
	if (menuOpen.value)
	{ document.body.classList.add('menu-open'); }
	else
	{ document.body.classList.remove('menu-open'); }
}

function closeMenu() {
	menuOpen.value = false;
	document.body.classList.remove('menu-open');
}

function toggleEditMessage() {
	editMessage.value = !editMessage.value;
	setTimeout(props.onResize, 0);
}

function updateMessage() {
	khatch(`${host}/v1/config`, {
		method: 'PATCH',
		handleError: true,
		body: {
			config: 'banner',
			value: {
				banner: message,
			},
		},
	})
	.then(response => {
		if (response.status < 300) {
			editMessage.value = false;
			setTimeout(props.onResize, 0);
		}
		else
		{ console.error(response); }
	});
}

function removeMessage() {
	message.value = null;
	updateMessage();
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
