import { defineStore } from 'pinia';
import { authCookie, deleteCookie, khatch, setCookie } from '@/utilities';
import { host, environment } from '@/config/constants';

export interface ToastOptions {
	title?: string,
	description?: string,
	dump?: any,
	color?: string,
	icon?: string,
	time?: number,
}

interface Toast {
	id: number,
	title?: string,
	description?: string,
	dump?: any,
	color: string,
	icon: string,
	close: { (): void; },
}

export enum Rating {
	general = "general",
	mature = "mature",
	explicit = "explicit",
}

interface Globals {
	init: boolean,
	auth: any | null,
	user: User | null,
	theme: string | null,
	accent: string | null,
	scroll: null,
	toasts: { [k: number]: Toast; },
	animations: boolean,
	transitions: boolean,
	tiles: boolean,
	rating: Rating,
	notifications: number,
	postCache: Post | null,
	config: any | null,
	cookies: boolean,
};

export const cookieFailedError = 'This setting will work until you close the tab. To persist between sessions, hit the "coolio" button on the cookies popup';


let toastCounter = 0;
export default defineStore("globals", {
	state: (): Globals => ({
		init: true,
		auth: null,
		user: null,
		theme: null,
		accent: null,
		scroll: null,
		toasts: {},
		animations: true,
		transitions: true,
		tiles: true,
		rating: "general" as Rating,
		notifications: 0,
		postCache: null,
		config: null,
		cookies: false,
	}),
	getters: {},
	actions: {
		createToast(options: ToastOptions): void {
			const id = toastCounter++;
			const timeout = setTimeout(() => delete this.toasts[id], (options?.time || 15) * 1000);
			const close = () => {
				delete this.toasts[id];
				clearTimeout(timeout);
			};
			const toast = {
				id,
				title: options?.title,
				description: options?.description,
				dump: options?.dump,
				color: options?.color || "textcolor",
				icon: options?.icon || "warning",
				close,
			};
			this.toasts[id] = toast;
			console.debug("[createToast]", id, toast);
		},
		userConfig(config: any) {
			this.config = {
				...config,
				blockingBehavior: config.blocking_behavior,
				wallpaper: config.wallpaper,
			};
			if (config.wallpaper) {
				khatch(`${host}/v1/post/${config.wallpaper}`, {
					errorMessage: 'Failed to Retrieve User Wallpaper!',
				}).then(r => r.json())
					.then((r: Post) => {
						if (!r.media) return;
						document.documentElement.style.backgroundImage = `url(${r.media.url})`;
						document.documentElement.style.backgroundAttachment = 'fixed';
						document.documentElement.style.backgroundPosition = 'top center';
						document.documentElement.style.backgroundRepeat = 'no-repeat';
						document.documentElement.style.backgroundSize = 'cover';
						document.body.style.backgroundImage = 'none';
					});
			}
			else {
				document.documentElement.style.backgroundImage = "";
				document.documentElement.style.backgroundAttachment = "";
				document.documentElement.style.backgroundPosition = "";
				document.documentElement.style.backgroundRepeat = "";
				document.documentElement.style.backgroundSize = "";
				document.body.style.backgroundImage = "";
			}
		},
		cookiesAllowed(cookies: boolean) {
			console.debug("cookies:", cookies);
			this.cookies = cookies;
			setCookie("cookies", "true", 31536000);
		},
		setTheme(theme: string) {
			setCookie("theme", theme);
			if (this.theme) {
				document.documentElement.classList.remove(this.theme);
			}
			document.documentElement.classList.add(theme);
			this.theme = theme;

			if (!this.cookies && !this.init) {
				this.createToast({
					title: "Could not set theme cookie",
					description: cookieFailedError,
				});
			}
		},
		setAccent(accent: string) {
			setCookie("accent", accent);
			if (this.accent) {
				document.documentElement.classList.remove(this.accent);
			}
			document.documentElement.classList.add(accent);
			this.accent = accent;

			if (!this.cookies && !this.init) {
				this.createToast({
					title: 'Could not set accent cookie',
					description: cookieFailedError,
				});
			}
		},
		maxRating(rating: Rating) {
			this.rating = rating;
			setCookie("max-rating", rating.toString(), 3155695200);

			if (!this.cookies && !this.init) {
				this.createToast({
					title: 'Could not set max rating cookie',
					description: cookieFailedError,
				});
			}
		},
		setAuth(auth: any) {
			if (auth && auth.token.length > 10) {
				if (!this.cookiesAllowed) {
					this.createToast({
						title: 'Could not complete login',
						description: 'Logins require the use of browser cookies. To login, hit the "coolio" button on the cookies popup',
					});
				}
				else {
					const maxage = Math.round(auth.expires - new Date().valueOf() / 1000);
					if (environment !== 'local') { // specifically open this cookie to subdomains so that cdn works
						document.cookie = `kh-auth=${auth.token}; max-age=${maxage}; samesite=lax; domain=.fuzz.ly; path=/; secure`;
					}
					else {
						setCookie('kh-auth', auth.token, maxage);
					}
					this.auth = authCookie();

					khatch(`${host}/v1/user/self`, {
						errorMessage: 'Error Occurred While Fetching Self',
						errorHandlers: {
							401: () => {
								// the auth token is no good, so unset it
								if (environment !== 'local') { // specifically open this cookie to subdomains so that cdn works
									document.cookie = `kh-auth=null; expires=${new Date(0)}; samesite=lax; domain=.fuzz.ly; path=/; secure`;
								}
								else {
									deleteCookie('kh-auth');
								}
							},
						},
					}).then(r => r.json()).then(r => {
						r.created = new Date(r.created);
						this.user = r;
					});

					khatch(`${host}/v1/config/user`, {
						errorMessage: 'Could Not Retrieve User Config!',
						errorHandlers: {
							// do nothing, we don't care
							401: () => { },
							404: () => { },
						},
					}).then(r => r.json()).then(r => this.userConfig);
				}
			}
			else {
				this.auth = this.user = null;
			}
		},
		animatedAccents(animatedAccents: boolean) {
			this.animations = animatedAccents;
			setCookie('animated-accents', animatedAccents);
			if (animatedAccents) {
				document.documentElement.classList.add('animated');
			}
			else {
				document.documentElement.classList.remove('animated');
			}

			if (!this.cookies && !this.init) {
				this.createToast({
					title: 'Could not set animated accents cookie',
					description: cookieFailedError,
				});
			}
		},
		cssTransitions(transitions: boolean) {
			this.transitions = transitions;
			setCookie('css-transitions', transitions, 3155695200);
			if (transitions) {
				document.documentElement.classList.add('transitions');
			}
			else {
				document.documentElement.classList.remove('transitions');
			}

			if (!this.cookies && !this.init) {
				this.createToast({
					title: 'Could not set css transitions cookie',
					description: cookieFailedError,
				});
			}
		},
		searchResultsTiles(tiles: boolean) {
			this.tiles = tiles;
			setCookie('search-results-tiles', tiles, 3155695200);
			if (tiles) {
				document.documentElement.classList.add('tiles');
			}
			else {
				document.documentElement.classList.remove('tiles');
			}

			if (!this.cookies && !this.init) {
				this.createToast({
					title: 'Could not set post tiles cookie',
					description: cookieFailedError,
				});
			}
		},
	},
});
