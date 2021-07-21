import { createStore } from 'vuex';
import { khatch } from '@/utilities';
import { usersHost } from '@/config/constants';


let toastCounter = 0;


export default createStore({
	state: {
		auth: null,
		user: null,
		theme: null,
		contentOffset: null,
		scroll: null,
		toasts: {},
	},
	mutations: {
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
		createToast(state, options) {
			const id = toastCounter++;
			state.toasts[id] = {
				id,
				title: options?.title,
				description: options?.description,
				dump: options?.dump,
				icon: options?.icon || 'warning',
			};
			setTimeout(() => delete state.toasts[id], (options?.time || 30) * 1000);
		},
	},
});
