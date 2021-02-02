import { createWebHistory, createRouter } from 'vue-router';
import Home from '../views/Home.vue';
import Post from '../views/Post.vue';
import ImageSearch from '../views/ImageSearch.vue'
import Search from '../views/Search.vue'
import Login from '../views/Login.vue'
import CreateAccount from '../views/CreateAccount.vue'
import FinalizeAccount from '../views/FinalizeAccount.vue'


// NOTE: root paths MUST start with '/', child paths CANNOT start with '/'
const routes = [
	{
		path: '/',
		name: 'home',
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
		path: '/search',
		name: 'image-search',
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
		children: [
			{
				path: 'test',
				name: 'test',
				component: Login,
				meta: {
					title: 'Sign in to kheina.com',
					metaTags: [
						{
							property: 'og:title',
							content: 'Manage your kheina.com account.',
						},
					],
				},
			},
		],
	},
	{
		path: '/account',
		name: 'account',
		component: Login,
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
		path: '/p/:postId',
		name: 'post',
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
		name: 'search',
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
	// 	name: 'user',
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
