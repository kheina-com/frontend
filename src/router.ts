import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router';
import Post from './views/Post.vue';
import Search from './views/Search.vue';
import Login from './views/Login.vue';
import CreateAccount from './views/CreateAccount.vue';
import FinalizeAccount from './views/FinalizeAccount.vue';
import Upload from './views/Upload.vue';
import User from './views/User.vue';
import Tag from './views/Tag.vue';
import Set from './views/Set.vue';
import Tags from './views/Tags.vue';
import Timeline from './views/Timeline.vue';
import Notifications from './views/Notifications.vue';
import Version from './views/Version.vue';
// import ImageSearch from './views/ImageSearch.vue';

/*
meta formatting:
meta: {
	title: string or function returning string,
	metaTags: {
		meta name: object containing meta key/value pairs or function returning meta key/value pairs,
		EX:
		description: {
			property: "og:description",
			content: "page description",
		},
	},
},
*/

// NOTE: root paths MUST start with "/", child paths CANNOT start with "/"
const routes: RouteRecordRaw[] = [
	{
		path: "/",
		name: "home",
		component: Search,
	},
	// {
	// 	path: "/img",
	// 	name: "image-search",
	// 	component: ImageSearch,
	// 	meta: {
	// 		title: "fuzz.ly - the world"s largest furry image index",
	// 		metaTags: {
	// 			description: {
	// 				property: "og:description",
	// 				content: "Search the world"s largest furry image database and find the artist behind your favorite artwork.",
	// 			},
	// 		},
	// 	},
	// },
	{
		path: "/tl",
		name: "timeline",
		component: Timeline,
		meta: {
			title: "Timeline | fuzz.ly",
			metaTags: {
				description: {
					property: "og:description",
					content: "See the latest posts from everyone you're following | fuzz.ly",
				},
			},
		},
	},
	{
		path: "/a",
		name: "account",
		component: () => import("./views/Account.vue"),
		meta: {
			title: "Manage your account | fuzz.ly",
		},
	},
	{
		path: "/a/login",
		name: "login",
		component: Login,
		meta: {
			title: "Sign in | fuzz.ly",
		},
	},
	{
		path: "/a/create",
		name: "create",
		component: CreateAccount,
		meta: {
			title: "Create an account | fuzz.ly",
		},
	},
	{
		path: "/a/finalize",
		name: "finalize",
		component: FinalizeAccount,
		meta: {
			title: "Finish creating your account | fuzz.ly",
		},
	},
	{
		path: "/n",
		name: "notifications",
		component: Notifications,
		meta: {
			title: "Notifications | fuzz.ly",
		},
	},
	{
		path: "/p/:postId",
		name: "post",
		props: true,
		component: Post,
		meta: {
			title: "Loading...",
		},
	},
	{
		path: "/q/:query",
		name: "search",
		props: true,
		component: Search,
		meta: {
			title: "Search results | fuzz.ly",
			metaTags: {
				description: {
					property: "og:description",
					content: "Search results",
				},
			},
		},
	},
	{
		path: "/t/:tag",
		name: "tag",
		props: true,
		component: Tag,
		meta: {
			title: "tag | fuzz.ly",
			metaTags: {
				description: {
					property: "og:description",
					content: "Search results for tag",
				},
			},
		},
	},
	{
		path: "/s/:setId",
		name: "set",
		props: true,
		component: Set,
		meta: {
			title: "set | fuzz.ly",
			metaTags: {
				description: {
					property: "og:description",
					content: "Search results for set",
				},
			},
		},
	},
	{
		path: "/tags",
		name: "tags",
		component: Tags,
		meta: {
			title: "Tags | fuzz.ly",
		},
	},
	{
		path: "/create",
		name: "upload",
		component: Upload,
		meta: {
			title: "Create new post | fuzz.ly",
		},
	},
	{
		path: "/md",
		name: "markdown",
		component: () => import("./views/MarkdownGuide.vue"),
		meta: {
			title: "Markdown Guide | fuzz.ly",
		},
	},
	{
		path: "/sh",
		name: "search-help",
		component: () => import("./views/SearchHelp.vue"),
		meta: {
			title: "Search Help | fuzz.ly",
		},
	},
	{
		path: "/r/:id",
		alias: ["/r"],
		name: "report",
		props: true,
		component: () => import("./views/Report.vue"),
		meta: {
			title: "Report Content | fuzz.ly",
		},
	},
	{
		path: "/rs",
		name: "reports",
		component: () => import("./views/Reports.vue"),
		meta: {
			title: "User Reports | fuzz.ly",
		},
	},
	{
		path: "/usr",
		name: "users",
		component: () => import("./views/Users.vue"),
		meta: {
			title: "All Users | fuzz.ly",
		},
	},
	{
		path: "/priv",
		name: "privacy",
		component: () => import("./views/Privacy.vue"),
		meta: {
			title: "Privacy Policy | fuzz.ly",
		},
	},
	{
		path: "/con",
		name: "content",
		component: () => import("./views/Content.vue"),
		meta: {
			title: "Content Policy | fuzz.ly",
		},
	},
	{
		path: "/term",
		name: "terms",
		component: () => import("./views/Terms.vue"),
		meta: {
			title: "Terms of Service | fuzz.ly",
		},
	},
	{
		path: "/bug",
		name: "bug",
		component: () => import("./views/BugReport.vue"),
		meta: {
			title: "Report a Bug | fuzz.ly",
		},
	},
	{
		path: "/mod/:id",
		alias: ["/mod"],
		name: "mod",
		props: true,
		component: () => import("./views/Moderate.vue"),
		meta: {
			title: "Moderate Content | fuzz.ly",
		},
	},
	{
		path: "/mod/queue",
		name: "modqueue",
		component: () => import("./views/ModQueue.vue"),
		meta: {
			title: "Moderation Queue | fuzz.ly",
		},
	},
	{
		path: "/admin",
		name: "admin",
		component: () => import("./views/Admin.vue"),
		meta: {
			title: "Admin Shit | fuzz.ly",
		},
	},
	{
		path: "/v",
		name: "version",
		component: Version,
		meta: {
			title: "Version Info | fuzz.ly",
		},
	},
	{
		path: "/test",
		name: "test",
		component: () => import("./views/Test.vue"),
	},
	{
		path: "/:handle",
		name: "user",
		props: true,
		component: User,
		meta: {
			applyOffset: false,
			title: "Retrieving user...",
		},
	},
];

export default createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			// we set a timeout here so the scroll takes effect after vue renders the page
			setTimeout(() => window.scrollTo(0, savedPosition.top), 0);
			return;
		}
		return { top: 0 };
	},
});
