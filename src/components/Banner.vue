<template>
	<div class='banner'>
		<div class='nav'>
			<div class='menu-button'>
				<i class='material-icons-round'>{{menuOpen ? 'close' : 'menu'}}</i>
			</div>
			<form class='search-bar' v-on:submit.prevent='noop'>
				<input ref='search' name='search' :value='searchValue' placeholder='Search' class='interactable text'>
				<div class='cover'></div>
				<button @click='runSearchQuery'><i class='material-icons-round'>search</i></button>
			</form>
			<div class='profile' v-if='isLoggedIn'>
				<i class='kheina-icons icon-sword' v-if='isAdmin'>sword</i>
				<Loading :isLoading='false' class='profile-image'>
					<router-link :to='`/${handle}`' class='profile' v-if='link && !isLoading'>
						<img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'>
					</router-link>
				</Loading>
			</div>
			<div class='profile' v-else>
				<input ref='butts' name='butts' value='' placeholder='log in' class='interactable text'>
			</div>
		</div>
		<Markdown :content='message' v-if='message'/>
	</div>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, authCookie } from '../utilities';
import Loading from '../components/Loading.vue';
import Markdown from '../components/Markdown.vue';
import { useRoute } from 'vue-router';

export default {
	name: 'Banner',
	setup() {
		const search = ref(null);
		return {
			search,
		};
	},
	props: {
		message: String,
	},
	data() {
		return {
			menuOpen: false,
			route: useRoute(),
		};
	},
	created() {
		const route = useRoute();
		if (route.path.startsWith('/s/'))
		{
			console.log(route.path.substring(3));
		}
	},
	computed: {
		isAdmin() {
			console.log(authCookie());
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
			this.$router.push('/s/' + this.$refs.search.value);
		},
	},
}
</script>

<style scoped>
.banner
{
	position: absolute;
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
	left: 0.5em;
	position: absolute;
	display: flex;
	align-items: center;
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

input {
	color: var(--textcolor);
}
input::placeholder {
	color: var(--subtlecolor);
}
input:hover::placeholder {
	color: var(--icolor);
}

.search-bar {
	position: relative;
}
.search-bar input {
	min-width: 300px;
	width: 30vw;
}
i
{ font-size: 1.2em; }
button
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
button:hover, button:active, button:focus
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
</style>
