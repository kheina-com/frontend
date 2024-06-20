import { createStore } from 'vuex';
import { authCookie, getMediaUrl, khatch, setCookie } from '@/utilities';
import { ratingMap, host, environment } from '@/config/constants';


let toastCounter = 0;
function createToast(state, options) {
	const id = toastCounter++;
	state.toasts[id] = {
		id,
		title: options?.title,
		description: options?.description,
		dump: options?.dump,
		color: options?.color || 'textcolor',
		icon: options?.icon || 'warning',
	};
	return setTimeout(() => delete state.toasts[id], (options?.time || 15) * 1000);
}
function userConfig(state, config) {
	state.userConfig = {
		...config,
		blockingBehavior: config.blocking_behavior,
		wallpaper: config.wallpaper,
	};
	if (config.wallpaper) {
		khatch(`${host}/v1/posts/${config.wallpaper}`, {
			errorMessage: 'Failed to Retrieve User Wallpaper!',
		}).then(r => r.json()).then(r => {
			document.documentElement.style.backgroundImage = `url(${getMediaUrl(r.post_id, r.filename)})`;
			document.documentElement.style.backgroundAttachment = 'fixed';
			document.documentElement.style.backgroundPosition = 'top center';
			document.documentElement.style.backgroundRepeat = 'no-repeat';
			document.documentElement.style.backgroundSize = 'cover';
			document.body.style.backgroundImage = 'none';
		});
	}
	else {
		document.documentElement.style.backgroundImage = null;
		document.documentElement.style.backgroundAttachment = null;
		document.documentElement.style.backgroundPosition = null;
		document.documentElement.style.backgroundRepeat =null;
		document.documentElement.style.backgroundSize = null;
		document.body.style.backgroundImage = null;
	}
}
export const cookieFailedError = 'This setting will work until you close the tab. To persist between sessions, hit the "coolio" button on the cookies popup';


export default createStore({
	state: {
		init: true,
		auth: null,
		user: null,
		theme: null,
		accent: null,
		scroll: null,
		toasts: {},
		animatedAccents: null,
		error: null,
		maxRating: 'general',
		notifications: 0,
		postCache: null,
		userConfig: null,
	},
	mutations: {
		createToast,
		userConfig,
		cookiesAllowed(state, cookies) {
			state.cookiesAllowed = cookies;
			setCookie('cookies', true, 31536000);
		},
		theme(state, theme) {
			setCookie('theme', theme);
			if (state.theme)
			{ document.documentElement.classList.remove(state.theme); }
			document.documentElement.classList.add(theme);
			state.theme = theme;

			if (!state.cookiesAllowed && !state.init) {
				createToast(state, {
					title: 'Could not set theme cookie',
					description: cookieFailedError,
				});
			}
		},
		accent(state, accent) {
			setCookie('accent', accent);
			if (state.accent)
			{ document.documentElement.classList.remove(state.accent); }
			document.documentElement.classList.add(accent);
			state.accent = accent;

			if (!state.cookiesAllowed && !state.init) {
				createToast(state, {
					title: 'Could not set accent cookie',
					description: cookieFailedError,
				});
			}
		},
		maxRating(state, rating) {
			state.maxRating = ratingMap[rating];
			setCookie('max-rating', rating, 3155695200);

			if (!state.cookiesAllowed && !state.init) {
				createToast(state, {
					title: 'Could not set max rating cookie',
					description: cookieFailedError,
				});
			}
		},
		setAuth(state, auth) {
			if (auth && auth.token.length > 10) {
				if (!state.cookiesAllowed) {
					createToast(state, {
						title: 'Could not complete login',
						description: 'Logins require the use of browser cookies. To login, hit the "coolio" button on the cookies popup',
					});
				}
				else {
					const maxage = Math.round(auth.expires - new Date().valueOf() / 1000);
					if (environment !== 'local') // specifically open this cookie to subdomains so that cdn works
					{ document.cookie = `kh-auth=${auth.token}; max-age=${maxage}; samesite=strict; domain=.fuzz.ly; path=/; secure`; }
					else
					{ setCookie('kh-auth', auth.token, maxage); }
					state.auth = authCookie();
					khatch(`${host}/v1/users/self`, {
						errorMessage: 'Error Occurred While Fetching Self'
					}).then(response => {
						response.json().then(r => {
							r.created = new Date(r.created);
							state.user = r;
						});
					})
					.catch(() => { });

					khatch(`${host}/v1/config/user`, {
						errorMessage: 'Could Not Retrieve User Config!',
						errorHandlers: {
							// do nothing, we don't care
							401: () => { },
							404: () => { },
						},
					}).then(response => response.json().then(r => {
						userConfig(state, r);
					}));
				}
			}
			else 
			{ state.auth = state.user = null; }
		},
		animatedAccents(state, animatedAccents) {
			state.animatedAccents = animatedAccents;
			setCookie('animated-accents', animatedAccents);
			if (animatedAccents)
			{ document.documentElement.classList.add('animated'); }
			else
			{ document.documentElement.classList.remove('animated'); }

			if (!state.cookiesAllowed && !state.init) {
				createToast(state, {
					title: 'Could not set animated accents cookie',
					description: cookieFailedError,
				});
			}
		},
		cssTransitions(state, cssTransitions) {
			state.cssTransitions = cssTransitions;
			setCookie('css-transitions', cssTransitions, 3155695200);
			if (cssTransitions)
			{ document.documentElement.classList.add('transitions'); }
			else
			{ document.documentElement.classList.remove('transitions'); }

			if (!state.cookiesAllowed && !state.init) {
				createToast(state, {
					title: 'Could not set css transitions cookie',
					description: cookieFailedError,
				});
			}
		},
		searchResultsTiles(state, tiles) {
			state.searchResultsTiles = tiles;
			setCookie('search-results-tiles', tiles, 3155695200);
			if (tiles)
			{ document.documentElement.classList.add('tiles'); }
			else
			{ document.documentElement.classList.remove('tiles'); }

			if (!state.cookiesAllowed && !state.init) {
				createToast(state, {
					title: 'Could not set post tiles cookie',
					description: cookieFailedError,
				});
			}
		},
		error(state, message=null, dump=null) {
			if (message)
			{ state.error = { message, dump }; }
			else if (state.error !== null)
			{ state.error = null; }
		},
	},
});
