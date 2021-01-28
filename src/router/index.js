import { createWebHistory, createRouter } from 'vue-router';
import Home from '../views/Home.vue';
import Post from '../views/Post.vue';
import ImageSearch from '../views/ImageSearch.vue'
import Search from '../views/Search.vue'


// NOTE: root paths MUST start with '/', child paths CANNOT start with '/'
const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			title: 'kheina.com - the world\'s largest furry image index',
			metaTags: [
				{
					name: 'description',
					content: 'Search the world\'s largest furry image database and find the artist behind your favorite artwork.',
				},
				{
					property: 'og:description',
					content: 'Search the world\'s largest furry image database and find the artist behind your favorite artwork.',
				},
				{
					property: 'og:title',
					content: 'kheina.com - the world\'s largest furry image index',
				},
				{
					property: 'og:image',
					content: '/static/icon.png',
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
		name: 'Search',
		component: ImageSearch,
		meta: {
			title: 'kheina.com - the world\'s largest furry image index',
			metaTags: [
				{
					name: 'description',
					content: 'Search the world\'s largest furry image database and find the artist behind your favorite artwork.',
				},
				{
					property: 'og:description',
					content: 'Search the world\'s largest furry image database and find the artist behind your favorite artwork.',
				},
				{
					property: 'og:title',
					content: 'kheina.com - the world\'s largest furry image index',
				},
				{
					property: 'og:image',
					content: '/static/icon.png',
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
		name: 'Account',
		component: ImageSearch,
		meta: {
			title: 'Manage your account',
			metaTags: [
				{
					property: 'og:title',
					content: 'Manage your kheina.com account.',
				},
				{
					property: 'og:image',
					content: '/static/icon.png',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
		children: [
			{
				path: 'login',
				name: 'Login',
				component: ImageSearch,
				meta: {
					title: 'Sign in to kheina.com',
				},
			},
		],
	},
	{
		path: '/p/:postId',
		props: true,
		component: Post,
		meta: {
			metaTags: [
				{
					property: 'og:image',
					content: '/static/icon.png',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	{
		path: '/s/:query',
		props: true,
		component: Search,
		meta: {
			metaTags: [
				{
					property: 'og:image',
					content: '/static/icon.png',
				},
				{
					name: 'theme-color',
					content: '#1E1F25',
				},
			],
		},
	},
	// {
	// 	path: '/:handle',
	// 	props: true,
	// 	component: User,
	// 	meta: {
	// 		metaTags: [
	// 			{
	// 				property: 'og:image',
	// 				content: '/static/icon.png',
	// 			},
	// 			{
	// 				name: 'theme-color',
	// 				content: '#1E1F25',
	// 			},
	// 		]
	// 	},
	// },
];

const Router = createRouter({
	history: createWebHistory(),
	routes,
});

export default Router;
