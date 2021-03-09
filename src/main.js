import { createApp } from 'vue';
import App from '@/App.vue';
import Router from '@/router'
import { routerMetaTag } from '@/config/constants';
import { setMeta } from '@/utilities/index.js';

Router.beforeEach((to, from, next) => {
	// This goes through the matched routes from last to first, combining routes metadata.
	// eg. if we have /some/deep/nested/route, /route's metadata will be prioritized, with nested, deep, some, being used for fallback

	console.log(to);

	let meta = { };
	to.matched.slice().forEach(route => {
		if (route.meta)
		{ meta = Object.assign(meta, route.meta) }
	});

	// Skip rendering meta tags if there are none.
	if (!Object.keys(meta).length)
	{ return next(); }

	// If a route with a title was found, set the document (page) title to that value.
	if (meta.title)
	{
		if (typeof meta.title === 'function')
		{ document.title = meta.title(to, from); }
		else
		{ document.title = meta.title; }
	}

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll('[' + routerMetaTag + ']')).map(e => e.parentNode.removeChild(e));

	console.log(meta);

	// Turn the meta tag definitions into actual elements in the head.
	meta.metaTags
		.map(tag => typeof tag === 'function' ? tag(to, from) : tag)
		.forEach(tag => setMeta(tag));

	next();
});

createApp(App)
	.use(Router)
	.mount('#app');
