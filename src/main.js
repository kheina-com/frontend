import { createApp } from 'vue';
import Router from '@/router';
import App from '@/App.vue';
import { routerMetaTag } from '@/config/constants';
import { setMeta } from '@/utilities';
import Vuex from 'vuex';
import global from './global';
import vClickOutside from 'click-outside-vue3';


Router.beforeEach((to, from, next) => {
	// This goes through the matched routes from last to first, combining routes metadata.
	// eg. if we have /some/nested/route, route's metadata will be prioritized, with nested, some, and / being used for fallback

	console.log(to, from, next)

	let meta = { };
	to.matched.slice().forEach(route => {
		if (route.meta)
		{ meta = Object.assign(meta, route.meta); }
	});

	// Skip rendering meta tags if there are none.
	if (!Object.keys(meta).length)
	{ return next(); }

	// If a route with a title was found, set the document (page) title to that value.
	if (meta.title)
	{ document.title = (typeof meta.title === 'function' ? meta.title(to, from) : meta.title) || document.title; }

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll(`meta[${routerMetaTag}]`)).forEach(e => e.parentNode.removeChild(e));

	// Turn the meta tag definitions into actual elements in the head.
	meta.metaTags
		.map(tag => typeof tag === 'function' ? tag(to, from) : tag)
		.forEach(tag => setMeta(tag));

	next();
});


createApp(App)
	.use(Router)
	.use(Vuex)
	.use(global)
	.use(vClickOutside)
	.mount('#app');
