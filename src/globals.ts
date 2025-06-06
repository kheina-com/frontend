import type { UserAuth } from '@/types/auth';
import type { NotificationEvent } from '@/types/notifications';
import type { PostLike } from '@/types/post';
import type { FullUser, FullUserLike, User } from '@/types/user';
import { defineStore } from 'pinia';
import { authCookie, deleteCookie, khatch, setCookie } from '@/utilities';
import { AnimatedAccents, SetConfig } from '@/config/store';
import { ClearNotifications, PopulateNotificationsDb } from '@/utilities/notifications';
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
	auth: UserAuth | null,
	user: User | null,
	theme: string | null,
	accent: string | null,
	scroll: null,
	toasts: { [k: number]: Toast; },
	animations: boolean,
	transitions: boolean,
	tiles: boolean,
	rating: Rating,
	postCache: PostLike | null,
	config: any | null,
	cookies: boolean,
}

export interface AuthToken {
	version: string,
	algorithm: string,
	keyId: number,
	// issued: Date | string,
	expires: Date | string,
	token: string,
}

export const cookieFailedError = 'This setting will work until you close the tab. To persist between sessions, hit the "coolio" button on the cookies popup';


let toastCounter = 0;
export default defineStore("globals", {
	state: (): Globals => ({
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
		userConfig(config: any): void {
			this.config = {
				...config,
				blockingBehavior: config.blocking_behavior,
				wallpaper: config.wallpaper,
			};
			if (config.wallpaper) {
				khatch(`${host}/v1/post/${config.wallpaper}`, {
					errorMessage: "Failed to Retrieve User Wallpaper!",
				}).then(
					r => r.json()
				).then((r: PostLike) => {
					if (!r.media) return;
					document.documentElement.style.backgroundImage = `url(${r.media.url})`;
					document.documentElement.style.backgroundAttachment = "fixed";
					document.documentElement.style.backgroundPosition = "top center";
					document.documentElement.style.backgroundRepeat = "no-repeat";
					document.documentElement.style.backgroundSize = "cover";
					document.body.style.backgroundImage = "none";
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
		cookiesAllowed(cookies: boolean): void {
			console.debug("cookies:", cookies);
			this.cookies = cookies;
			SetConfig("cookies", cookies);
		},
		setTheme(theme: string): void {
			SetConfig("theme", theme);
			if (this.theme) {
				document.documentElement.classList.remove(this.theme);
			}
			document.documentElement.classList.add(theme);
			this.theme = theme;

			if (!this.cookies) {
				this.createToast({
					title: "Could not set theme cookie",
					description: cookieFailedError,
				});
			}
		},
		setAccent(accent: string): void {
			SetConfig("accent", accent);
			if (this.accent) {
				document.documentElement.classList.remove(this.accent);
			}
			document.documentElement.classList.add(accent);
			this.accent = accent;

			if (!this.cookies) {
				this.createToast({
					title: "Could not set accent cookie",
					description: cookieFailedError,
				});
			}
		},
		maxRating(rating: Rating): void {
			this.rating = rating;
			SetConfig("max-rating", rating.toString());
		},
		setAuth(auth: AuthToken | null): void {
			if (auth && auth.token.length > 10) {
				if (!this.cookiesAllowed) {
					ClearNotifications();
					this.createToast({
						title: "Could not complete login",
						description: 'Logins require the use of browser cookies. To login, hit the "coolio" button on the cookies popup',
					});
				}
				else {
					const maxage = Math.round((new Date(auth.expires).valueOf() - new Date().valueOf()) / 1000);
					if (environment !== "local") { // specifically open this cookie to subdomains so that cdn works
						document.cookie = `kh-auth=${auth.token}; max-age=${maxage}; samesite=lax; domain=.fuzz.ly; path=/; secure`;
					}
					else {
						setCookie("kh-auth", auth.token, maxage);
					}
					this.auth = authCookie();

					// this has to be after auth assignment
					PopulateNotificationsDb().then((unread: number) =>
						document.dispatchEvent(new CustomEvent<NotificationEvent>("notification", { detail: { unread } }))
					);

					khatch(`${host}/v1/user/self`, {
						errorMessage: "Error Occurred While Fetching Self",
						errorHandlers: {
							401: () => {
								// the auth token is no good, so unset it
								if (environment !== "local") { // specifically open this cookie to subdomains so that cdn works
									document.cookie = `kh-auth=null; expires=${new Date(0)}; samesite=lax; domain=.fuzz.ly; path=/; secure`;
								}
								else {
									deleteCookie("kh-auth");
								}
							},
						},
					}).then(
						r => r.json()
					).then((r: FullUserLike) => {
						r.created = new Date(r.created);
						this.user = r as FullUser;
					});

					khatch(`${host}/v1/config/user`, {
						errorMessage: "Could Not Retrieve User Config!",
						errorHandlers: {
							// do nothing, we don't care
							401: () => { },
							404: () => { },
						},
					}).then(r => r.json()).then(this.userConfig);
				}
			}
			else {
				ClearNotifications();
				this.auth = this.user = null;
			}
		},
		animatedAccents(animatedAccents: boolean): void {
			this.animations = animatedAccents;
			SetConfig(AnimatedAccents, animatedAccents);
			if (animatedAccents) {
				document.documentElement.classList.add("animated");
			}
			else {
				document.documentElement.classList.remove("animated");
			}
		},
		cssTransitions(transitions: boolean): void {
			this.transitions = transitions;
			SetConfig("css-transitions", transitions);
			if (transitions) {
				document.documentElement.classList.add("transitions");
			}
			else {
				document.documentElement.classList.remove("transitions");
			}
		},
		searchResultsTiles(tiles: boolean): void {
			this.tiles = tiles;
			SetConfig("search-results-tiles", tiles);
			if (tiles) {
				document.documentElement.classList.add("tiles");
			}
			else {
				document.documentElement.classList.remove("tiles");
			}
		},
	},
});
