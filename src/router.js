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

import Test from './views/Test.vue';


// NOTE: root paths MUST start with '/', child paths CANNOT start with '/'
const routes = [
	{
		path: '/',
		name: 'home',
		component: Search,
		meta: {
			title: 'kheina.com',
			metaTags: [
				{
					property: 'og:title',
					content: 'kheina.com',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'kheina.com - the world\'s largest furry image index',
			metaTags: [
				{
					name: 'description',
					property: 'og:description',
					content: 'Search the world\'s largest furry image database and find the artist behind your favorite artwork.',
				},
				{
					property: 'og:title',
					content: 'kheina.com - the world\'s largest furry image index',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Timeline | kheina.com',
			metaTags: [
				{
					name: 'description',
					property: 'og:description',
					content: 'See the latest posts from everyone you\'re following | kheina.com',
				},
				{
					property: 'og:title',
					content: 'Timeline | kheina.com',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Manage your account',
			metaTags: [
				{
					property: 'og:title',
					content: 'Manage your kheina.com account.',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Sign in to kheina.com',
			metaTags: [
				{
					property: 'og:title',
					content: 'Manage your kheina.com account.',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Create an account on kheina.com',
			metaTags: [
				{
					property: 'og:title',
					content: 'Create an account on kheina.com.',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Finish creating your account',
			metaTags: [
				{
					property: 'og:title',
					content: 'Finish creating your kheina.com account.',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: (to) => `Search results for ${to.params.query}`,
			metaTags: [
				(to) => {
					return {
						name: 'description',
						property: 'og:description',
						content: `Search results for ${to.params.query}`,
					};
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: (to) => `${to.params.tag}, tag | kheina.com`,
			metaTags: [
				(to) => {
					return {
						name: 'description',
						property: 'og:description',
						content: `Search results for ${to.params.tag}`,
					};
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: (to) => 'Tags',
			metaTags: [
				(to) => {
					return {
						name: 'description',
						property: 'og:description',
						content: `Search results for ${to.params.tag}`,
					};
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Create new post',
			metaTags: [
				{
					property: 'og:title',
					content: 'Create new post',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Markdown Guide',
			metaTags: [
				{
					property: 'og:title',
					content: 'Markdown Guide',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Search Help',
			metaTags: [
				{
					property: 'og:title',
					content: 'Search Help',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'Report Content',
			metaTags: [
				{
					property: 'og:title',
					content: 'Report Content',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
			title: 'all users',
			metaTags: [
				{
					property: 'og:title',
					content: 'all users',
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
	// {
	// 	path: '/s',
	// 	name: 'search',
	// 	props: true,
	// 	component: Search,
	// 	meta: {
	// 		metaTags: [
	// 			{
	// 				property: 'og:image',
	// 				content: '/assets/icon.png',
	// 			},
	// 			{
	// 				name: 'theme-color',
	// 				content: '#1E1F25',
	// 			},
	// 		],
	// 	},
	// },
	{
		path: '/:handle',
		name: 'user',
		props: true,
		component: User,
		meta: {
			applyOffset: false,
			title: (to, from) => to.path !== from.path ? `Retrieving user @${to.params.handle}...` : null,
			metaTags: [
				(to) => {
					return {
						property: 'og:title',
						content: `Retrieving user @${to.params.handle}...`,
					};
				},
				{
					property: 'og:image',
					content: '/assets/icon.png',
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
		{ store.state.scroll = savedPosition.top; }
		return { top: 0 };
	},
});
