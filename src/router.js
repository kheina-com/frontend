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

import Test from './views/Test.vue';


// NOTE: root paths MUST start with '/', child paths CANNOT start with '/'
const routes = [
	{
		path: '/',
		name: 'home',
		component: Search,
		meta: {
			title: 'Building a new home for all things fluff, scaled, and feathered! | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Building a new home for all things fluff, scaled, and feathered! | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/search',
		name: 'image-search',
		component: ImageSearch,
		meta: {
			title: 'fuzz.ly - the world\'s largest furry image index',
			metaTags: [
				{
					name: 'description',
					property: 'og:description',
					content: 'Search the world\'s largest furry image database and find the artist behind your favorite artwork.',
				},
				{
					property: 'og:title',
					content: 'fuzz.ly - the world\'s largest furry image index',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/timeline',
		name: 'timeline',
		component: Timeline,
		meta: {
			title: 'Timeline | fuzz.ly',
			metaTags: [
				{
					name: 'description',
					property: 'og:description',
					content: 'See the latest posts from everyone you\'re following | fuzz.ly',
				},
				{
					property: 'og:title',
					content: 'Timeline | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/account',
		name: 'account',
		component: Account,
		meta: {
			title: 'Manage your fuzz.ly account',
			metaTags: [
				{
					property: 'og:title',
					content: 'Manage your fuzz.ly account',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/account/login',
		name: 'login',
		component: Login,
		meta: {
			title: 'Sign in to fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Sign in to fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/account/create',
		name: 'create',
		component: CreateAccount,
		meta: {
			title: 'Create an account on fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Create an account on fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/account/finalize',
		name: 'finalize',
		component: FinalizeAccount,
		meta: {
			title: 'Finish creating your fuzz.ly account',
			metaTags: [
				{
					property: 'og:title',
					content: 'Finish creating your fuzz.ly account',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/notifications',
		name: 'notifications',
		component: Notifications,
		meta: {
			title: 'Notifications | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Notifications | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/p/:postId',
		name: 'post',
		props: true,
		component: Post,
		meta: {
			title: 'Loading...',
			metaTags: [
				(to) => {
					return {
						property: 'og:title',
						content: to.params.postId,
					};
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/q/:query',
		name: 'search',
		props: true,
		component: Search,
		meta: {
			title: (to) => `Search results for ${to.params.query} | fuzz.ly`,
			metaTags: [
				(to) => {
					return {
						name: 'description',
						property: 'og:description',
						content: `Search results for ${to.params.query} | fuzz.ly`,
					};
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/t/:tag',
		name: 'tag',
		props: true,
		component: Tag,
		meta: {
			title: (to) => `${to.params.tag}, tag | fuzz.ly`,
			metaTags: [
				(to) => {
					return {
						name: 'description',
						property: 'og:description',
						content: `Search results for ${to.params.tag}`,
					};
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/tags',
		name: 'tags',
		component: Tags,
		meta: {
			title: 'Tags | fuzz.ly',
			metaTags: [
				{
					name: 'description',
					property: 'og:description',
					content: 'Tags | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/create',
		name: 'upload',
		component: Upload,
		meta: {
			title: 'Create new post | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Create new post | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/md',
		name: 'markdown',
		component: MarkdownGuide,
		meta: {
			title: 'Markdown Guide | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Markdown Guide | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/search-help',
		name: 'search-help',
		component: SearchHelp,
		meta: {
			title: 'Search Help | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Search Help | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/report',
		name: 'report',
		component: Report,
		meta: {
			title: 'Report Content | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Report Content | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/users',
		name: 'users',
		component: Users,
		meta: {
			title: 'all users | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'all users | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/test',
		name: 'test',
		component: Test,
	},
	{
		path: '/version',
		name: 'version',
		component: Version,
	},
	{
		path: '/privacy',
		name: 'privacy',
		props: true,
		component: Privacy,
		meta: {
			title: 'Privacy Policy | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Privacy Policy | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/content',
		name: 'content',
		props: true,
		component: Content,
		meta: {
			title: 'Content Policy | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Content Policy | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/bug',
		name: 'bug',
		props: true,
		component: BugReport,
		meta: {
			title: 'Report a Bug | fuzz.ly',
			metaTags: [
				{
					property: 'og:title',
					content: 'Report a Bug | fuzz.ly',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/:handle',
		name: 'user',
		props: true,
		component: User,
		meta: {
			applyOffset: false,
			title: (to, from) => to.path !== from.path ? `Retrieving user @${to.params.handle}...` : null,
			metaTags: [
				(to, from) => {
					return to.path !== from.path ? {
						property: 'og:title',
						content: `Retrieving user @${to.params.handle}...`,
					} : null;
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			]
		},
	},
];

export default createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition)
		{
			setTimeout(() => window.scrollTo(0, savedPosition.top), 0);
			return;
		}
		return { top: 0 };
	},
});
