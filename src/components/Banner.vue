<template>
	<div class='banner'>
		<div class='nav'>
			<div class='menu-button'>
				<button @click='openMenu'>
					<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
				</button>
			</div>
			<form class='search-bar' v-on:submit.prevent='noop'>
				<input ref='search' name='search' :value='searchValue' placeholder='Search' class='interactable text'>
				<div class='cover'></div>
				<button @click='runSearchQuery'><i class='material-icons-round'>search</i></button>
			</form>
			<div class='profile' v-if='isLoggedIn'>
				<i class='kheina-icons icon-sword' v-if='isAdmin'>sword</i>
				<Loading :isLoading='false' class='profile-image'>
					<router-link :to='`/${handle}`' v-if='true'>
						<img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'>
					</router-link>
				</Loading>
			</div>
			<div class='profile' v-else>
				<router-link to='/account/login' class='interactable'>Login</router-link>
			</div>
		</div>
		<Markdown :content='message' v-if='message'/>
	</div>
	<div class='menu' ref='menu'>
		<ul class='inner'>
			<li>
				<router-link to='/account'>Account</router-link>
			</li>
			<li>
				<button @click='signOut'>Sign Out</button>
			</li>
		</ul>
	</div>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, authCookie, deleteCookie } from '../utilities';
import Loading from '../components/Loading.vue';
import Markdown from '../components/Markdown.vue';
import { useRoute } from 'vue-router';

export default {
	name: 'Banner',
	setup() {
		const search = ref(null);
		const menu = ref(null);
		return {
			search,
			menu,
		};
	},
	data() {
		return {
			message: 'Black Lives Matter. [blacklivesmatters.carrd.co](https://blacklivesmatters.carrd.co/)',
			menuOpen: false,
			route: useRoute(),
		};
	},
	computed: {
		isAdmin() {
			return Boolean(authCookie()?.scope?.includes('admin'));
		},
		isLoggedIn() {
			return authCookie() !== null;
		},
		searchValue() {
			if (this.route.path.startsWith('/s/'))
			{ return decodeURIComponent(this.route.path.substring(3)); }
			else if (this.$refs.search)
			{ return this.$refs.search.value; }
			else
			{ return ''; }
		},
	},
	components: {
		Markdown,
		Loading,
	},
	methods: {
		getMediaThumbnailUrl,
		runSearchQuery() {
			this.$router.push('/s/' + encodeURIComponent(this.$refs.search.value));
		},
		signOut() {
			deleteCookie('kh-auth');
			location.reload(); 
		},
		openMenu() {
			this.menuOpen = !this.menuOpen;
			if (this.menuOpen)
			{ this.$refs.menu.style.left = 0; }
			else
			{ this.$refs.menu.style.left = null; }
		},
	},
}
</script>

<style scoped>
.menu {
	font-size: 1em;
	position: fixed;
	width: max(20vw, 200px);
	background: var(--bg2color);
	border-right: 1px solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	height: 100vh;
	top: 0;
	left: -100%;
	z-index: 9;
}
.menu .inner {
	padding: 40px 25px 25px;
}
.menu button {
	font-size: 1em;
}
.banner {
	position: relative;
	width: 100%;
	background: var(--bg1color);
	top: 0;
	text-align: center;
}
.nav {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0.25em;
}
.menu-button {
	left: 0.75em;
	position: absolute;
	display: flex;
	align-items: center;
	z-index: 10;
}
.menu-button i {
	font-size: 1.5em;
}
.markdown {
	/* border-top: 1px solid var(--bordercolor); */
	padding: 20px 0 25px;
}
.profile {
	display: inline-block;
	margin-right: auto;
	font-size: 0.9em;
}
.profile .inner {
	display: flex;
	align-items: center;
}
.profile-image, .profile-image img {
	width: 2em;
	height: 2em;
}
.profile-image img {
	border-radius: 3px;
}
.icon-sword {
	margin-right: 0.5em;
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
.profile {
	display: flex;
	align-items: center;
	position: absolute;
	right: 0.25em;
}
ul {
	list-style: none;
	margin: 0;
	padding: 0;
}
ul li {
	margin: 0 0 0.5em;
}

</style>
