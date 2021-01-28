import { createApp } from 'vue';
import App from './App.vue';
import Router from './router'
import VueResizeObserver from 'vue-resize-observer';

const routerMetaTag = 'data-vue-router-controlled';

Router.beforeEach((to, from, next) => {
	// This goes through the matched routes from last to first, combining routes metadata.
	// eg. if we have /some/deep/nested/route, /route's metadata will be prioritized, with nested, deep, some, being used for fallback

	let meta = { };
	to.matched.slice().reverse().forEach(route => {
		if (route.meta)
		{ meta = Object.assign(meta, route.meta) }
	});

	// Skip rendering meta tags if there are none.
	if (!Object.keys(meta).length)
	{ return next(); }

	// If a route with a title was found, set the document (page) title to that value.
	if (meta.title)
	{ document.title = meta.title; }

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll('[' + routerMetaTag + ']')).map(el => el.parentNode.removeChild(el));

	// Turn the meta tag definitions into actual elements in the head.
	meta.metaTags.map(tagDef => {
		const tag = document.createElement('meta');

		Object.keys(tagDef).forEach(key => {
			tag.setAttribute(key, tagDef[key]);
		});

		// We use this to track which meta tags we create, so we don't interfere with other ones.
		tag.setAttribute(routerMetaTag, '');

		return tag;
	})
	// Add the meta tags to the document head.
	.forEach(tag => document.head.appendChild(tag));

	next();
});

createApp(App)
	.use(Router)
	.use(VueResizeObserver)
	.mount('#app');
