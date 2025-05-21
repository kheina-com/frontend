import type { RouteLocationNormalizedGeneric, RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import { createApp } from 'vue';
import Router from '@/router';
import App from '@/App.vue';
import { isMobile, routerMetaTag } from '@/config/constants';
import { getCookie, setMeta } from '@/utilities';
import { loadLangFile, vTranslate } from '@/localization';
import { createPinia } from 'pinia';
import store from '@/globals';
import { GetConfigs, Cookies, Theme, Accent, AnimatedAccents, CssTransitions, Tiles, MaxRating } from '@/config/store';

loadLangFile(getCookie("locale", Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase()));

Router.afterEach((to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedLoadedGeneric) => {
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
				content: "width=device-width, initial-scale=0.5, maximum-scale=0.5",
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

const app = createApp(
	App
).use(
	Router
).use(
	createPinia()
).directive(
	"translate",
	vTranslate,
);

(async () => {
	// presetup - configs need to be loaded BEFORE app is mounted so things don't "snap" in
	const globals = store();
	const configs = await GetConfigs({
		[Cookies]: false,
		[Theme]: "kheina",
		[Accent]: "none",
		[AnimatedAccents]: true,
		[CssTransitions]: true,
		[Tiles]: !isMobile,
		[MaxRating]: "general",
	});
	globals.cookiesAllowed(configs[Cookies]);
	globals.setTheme(configs[Theme]);
	globals.setAccent(configs[Accent]);
	globals.animatedAccents(configs[AnimatedAccents]);
	globals.cssTransitions(configs[CssTransitions]);
	globals.searchResultsTiles(configs[Tiles]);
	globals.maxRating(configs[MaxRating]);
})().then(() =>
	app.mount("body")
);
