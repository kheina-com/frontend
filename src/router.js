import store from '@/global';
import { createWebHistory, createRouter } from 'vue-router';
import Post from './views/Post.vue';
import ImageSearch from './views/ImageSearch.vue';
import Search from './views/Search.vue';
import Login from './views/Login.vue';
import CreateAccount from './views/CreateAccount.vue';
import FinalizeAccount from './views/FinalizeAccount.vue';
import Upload from './views/Upload.vue';
import MarkdownGuide from './views/MarkdownGuide.vue';
import Report from './views/Report.vue';
import Account from './views/Account.vue';
import User from './views/User.vue';
import Tag from './views/Tag.vue';
import Tags from './views/Tags.vue';
import Users from './views/Users.vue';
import SearchHelp from './views/SearchHelp.vue';
import Timeline from './views/Timeline.vue';
import Privacy from './views/Privacy.vue';
import BugReport from './views/BugReport.vue';
import Notifications from './views/Notifications.vue';
import Version from './views/Version.vue';
import Content from './views/Content.vue';
import Terms from './views/Terms.vue';
import ModQueue from './views/ModQueue.vue';
import Moderate from './views/Moderate.vue';
import Admin from './views/Admin.vue';

import Test from './views/Test.vue';


/*
meta formatting:
meta: {
	title: string or function returning string,
	metaTags: {
		meta name: object containing meta key/value pairs or function returning meta key/value pairs,
		EX:
		description: {
			property: 'og:description',
			content: 'page description',
		},
	},
},
*/

// NOTE: root paths MUST start with '/', child paths CANNOT start with '/'
const routes = [
	{
		path: '/',
		name: 'home',
		component: Search,
	},
	{
		path: '/search',
		name: 'image-search',
		component: ImageSearch,
		meta: {
			title: "fuzz.ly - the world's largest furry image index",
			metaTags: {
				description: {
					property: 'og:description',
					content: "Search the world's largest furry image database and find the artist behind your favorite artwork.",
				},
			},
		},
	},
	{
		path: '/timeline',
		name: 'timeline',
		component: Timeline,
		meta: {
			title: 'Timeline | fuzz.ly',
			metaTags: {
				description: {
					property: 'og:description',
					content: 'See the latest posts from everyone you\'re following | fuzz.ly',
				},
			},
		},
	},
	{
		path: '/account',
		name: 'account',
		component: Account,
		meta: {
			title: 'Manage your fuzz.ly account',
		},
	},
	{
		path: '/account/login',
		name: 'login',
		component: Login,
		meta: {
			title: 'Sign in to fuzz.ly',
		},
	},
	{
		path: '/account/create',
		name: 'create',
		component: CreateAccount,
		meta: {
			title: 'Create an account on fuzz.ly',
		},
	},
	{
		path: '/account/finalize',
		name: 'finalize',
		component: FinalizeAccount,
		meta: {
			title: 'Finish creating your fuzz.ly account',
		},
	},
	{
		path: '/notifications',
		name: 'notifications',
		component: Notifications,
		meta: {
			title: 'Notifications | fuzz.ly',
		},
	},
	{
		path: '/p/:postId',
		name: 'post',
		props: true,
		component: Post,
		meta: {
			title: 'Loading...',
		},
	},
	{
		path: '/q/:query',
		name: 'search',
		props: true,
		component: Search,
		meta: {
			title: (to) => `Search results for ${to.params.query} | fuzz.ly`,
			metaTags: {
				description: (to) => {
					return {
						property: 'og:description',
						content: `Search results for ${to.params.query} | fuzz.ly`,
					};
				},
			},
		},
	},
	{
		path: '/t/:tag',
		name: 'tag',
		props: true,
		component: Tag,
		meta: {
			title: (to) => `${to.params.tag}, tag | fuzz.ly`,
			metaTags: {
				description: (to) => {
					return {
						property: 'og:description',
						content: `Search results for ${to.params.tag}`,
					};
				},
			},
		},
	},
	{
		path: '/tags',
		name: 'tags',
		component: Tags,
		meta: {
			title: 'Tags | fuzz.ly',
		},
	},
	{
		path: '/create',
		name: 'upload',
		component: Upload,
		meta: {
			title: 'Create new post | fuzz.ly',
		},
	},
	{
		path: '/md',
		name: 'markdown',
		component: MarkdownGuide,
		meta: {
			title: 'Markdown Guide | fuzz.ly',
		},
	},
	{
		path: '/search-help',
		name: 'search-help',
		component: SearchHelp,
		meta: {
			title: 'Search Help | fuzz.ly',
		},
	},
	{
		path: '/report',
		name: 'report',
		component: Report,
		meta: {
			title: 'Report Content | fuzz.ly',
		},
	},
	{
		path: '/users',
		name: 'users',
		component: Users,
		meta: {
			title: 'All Users | fuzz.ly',
		},
	},
	{
		path: '/privacy',
		name: 'privacy',
		component: Privacy,
		meta: {
			title: 'Privacy Policy | fuzz.ly',
		},
	},
	{
		path: '/content',
		name: 'content',
		component: Content,
		meta: {
			title: 'Content Policy | fuzz.ly',
		},
	},
	{
		path: '/terms',
		name: 'terms',
		component: Terms,
		meta: {
			title: 'Terms of Service | fuzz.ly',
		},
	},
	{
		path: '/bug',
		name: 'bug',
		props: true,
		component: BugReport,
		meta: {
			title: 'Report a Bug | fuzz.ly',
		},
	},
	{
		path: '/mod',
		name: 'mod',
		props: true,
		component: Moderate,
		meta: {
			title: 'Moderate Content | fuzz.ly',
		},
	},
	{
		path: '/mod/queue',
		name: 'modqueue',
		component: ModQueue,
		meta: {
			title: 'Moderation Queue | fuzz.ly',
		},
	},
	{
		path: '/admin',
		name: 'admin',
		component: Admin,
		meta: {
			title: 'Admin Shit | fuzz.ly',
		},
	},
	{
		path: '/version',
		name: 'version',
		component: Version,
		meta: {
			title: 'Version Info | fuzz.ly',
		},
	},
	{
		path: '/test',
		name: 'test',
		component: Test,
	},
	{
		path: '/:handle',
		name: 'user',
		props: true,
		component: User,
		meta: {
			applyOffset: false,
			title: (to, from) => to.path !== from.path ? `Retrieving user @${to.params.handle}...` : null,
		},
	},
];

export default createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition)
		{
			// we set a timeout here so the scroll takes effect after vue renders the page
			setTimeout(() => window.scrollTo(0, savedPosition.top), 0);
			return;
		}
		return { top: 0 };
	},
});
