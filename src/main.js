import { createApp } from 'vue';
import Router from '@/router';
import App from '@/App.vue';
import { routerMetaTag } from '@/config/constants';
import { setMeta } from '@/utilities';
import Vuex from 'vuex';
import store from './global';
import vClickOutside from 'click-outside-vue3';


Router.afterEach((to, from) => {
	store.commit('error');

	// This goes through the matched routes from last to first, combining routes metadata.
	// eg. if we have /some/nested/route, route's metadata will be prioritized, with nested, some, and / being used for fallback

	let meta = {
		// these are global defaults, routes will overwrite these with their own, if they exist
		title: 'A new home for all things fluff, scaled, and feathered! | fuzz.ly',
		metaTags: {
			['theme-color']: {
				content: '#1E1F25',
			},
		},
	};
	to.matched.slice().forEach(route => {
		if (route.meta)
		{
			if (route.meta.metaTags)
			{ meta.metaTags = Object.assign(meta.metaTags, route.meta.metaTags); }
			meta.title = route.meta.title || meta.title;
		}
	});

	// If a route with a title was found, set the document (page) title to that value.
	meta.title = (typeof meta.title === 'function' ? meta.title(to, from) : meta.title);

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll(`meta[${routerMetaTag}]`)).forEach(e => e.parentNode.removeChild(e));

	if (meta.title)
	{
		document.title = meta.title;
		setMeta({
			property: 'og:title',
			content: meta.title,
		});
	}
	// Turn the meta tag definitions into actual elements in the head.
	for (const [name, tag] of Object.entries(meta.metaTags))
	{ setMeta(Object.assign({ name, }, typeof tag === 'function' ? tag(to, from) : tag)); }
});


createApp(App)
	.use(Router)
	.use(Vuex)
	.use(store)
	.use(vClickOutside)
	.mount('body');
