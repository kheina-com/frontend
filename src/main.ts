import { createApp } from 'vue';
import Router from '@/router';
import App from '@/App.vue';
import { routerMetaTag } from '@/config/constants';
import { setMeta } from '@/utilities';
// import vClickOutside from 'click-outside-vue3';
import { createPinia } from 'pinia';


Router.afterEach((to, from) => {
	// we let views handle self-updates
	if (from.name && from.path === to.path) return;

	// This goes through the matched routes from last to first, combining routes metadata.
	// eg. if we have /some/nested/route, route's metadata will be prioritized, with nested, some, and / being used for fallback

	const meta = {
		// these are global defaults, routes will overwrite these with their own, if they exist
		title: "A new home for all things fluff, scaled, and feathered! | fuzz.ly",
		metaTags: {
			["theme-color"]: {
				content: "#1E1F25",
			},
			viewport: {
				content: "width=device-width, initial-scale=0.5, maximum-scale=0.5, user-scalable=0",
			},
		},
	};

	to.matched.slice().forEach(route => {
		if (route.meta) {
			if (route.meta.metaTags) {
				meta.metaTags = Object.assign(meta.metaTags, route.meta.metaTags);
			}
			meta.title = (route.meta?.title || meta.title).toString();
		}
	});

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll(`meta[${routerMetaTag}]`))
	.forEach(e => (e.parentNode as HTMLElement).removeChild(e));

	document.title = meta.title;
	setMeta({
		property: "og:title",
		content: meta.title,
	});

	// Turn the meta tag definitions into actual elements in the head.
	Object.entries(meta.metaTags)
	.forEach(([name, tag]) => setMeta(Object.assign({ name }, tag)));
});


createApp(App)
.use(Router)
.use(createPinia())
// .use(vClickOutside)
.mount("body");
