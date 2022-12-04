import { createStore } from 'vuex';
import { khatch, setCookie } from '@/utilities';
import { usersHost } from '@/config/constants';


let toastCounter = 0;


export default createStore({
	state: {
		auth: null,
		user: null,
		theme: null,
		scroll: null,
		toasts: {},
		animatedAccents: null,
		error: null,
		maxRating: 'general',
		notifications: 0,
	},
	mutations: {
		maxRating(state, rating) {
			state.maxRating = rating;
		},
		setAuth(state, auth) {
			state.auth = auth;
			if (auth)
			{
				khatch(
					`${usersHost}/v1/fetch_self`,
					{ errorMessage: 'An Error Occurred While Fetching Self' }
				).then(response => {
					response.json().then(r => {
						r.created = new Date(r.created);
						state.user = r;
					});
				})
				.catch(() => { });
			}
			else 
			{ state.user = null; }
		},
		setUser(state, user) {
			state.user = user;
		},
		animatedAccents(state, animatedAccents) {
			state.animatedAccents = animatedAccents;
			if (animatedAccents)
			{ document.documentElement.classList.add('animated'); }
			else
			{ document.documentElement.classList.remove('animated'); }
		},
		cssTransitions(state, cssTransitions) {
			state.cssTransitions = cssTransitions;
			setCookie('css-transitions', cssTransitions, 3155695200);
			if (cssTransitions)
			{ document.documentElement.classList.add('transitions'); }
			else
			{ document.documentElement.classList.remove('transitions'); }
		},
		searchResultsTiles(state, tiles) {
			state.searchResultsTiles = tiles;
			setCookie('search-results-tiles', tiles, 3155695200);
			if (tiles)
			{ document.documentElement.classList.add('tiles'); }
			else
			{ document.documentElement.classList.remove('tiles'); }
		},
		error(state, message=null, dump=null) {
			if (message)
			{ state.error = { message, dump }; }
			else if (state.error !== null)
			{ state.error = null; }
		},
		createToast(state, options) {
			const id = toastCounter++;
			state.toasts[id] = {
				id,
				title: options?.title,
				description: options?.description,
				dump: options?.dump,
				color: options?.color || 'textcolor',
				icon: options?.icon || 'warning',
			};
			setTimeout(() => delete state.toasts[id], (options?.time || 30) * 1000);
		},
	},
});
