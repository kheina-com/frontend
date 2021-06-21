import { createStore } from 'vuex';
import { khatch } from '@/utilities';
import { usersHost } from '@/config/constants';


export default createStore({
	state: {
		auth: null,
		user: null,
		theme: null,
		contentOffset: null,
		toasts: {},
	},
	mutations: {
		setAuth(state, auth) {
			state.auth = auth;
			if (auth)
			{
				khatch(`${usersHost}/v1/fetch_self`)
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{
							r.created = new Date(r.created);
							state.user = r;
						}
					});
				})
				.catch(error => {
					console.error(error);
				});
			}
			else 
			{ state.user = null; }
		},
		setUser(state, user) {
			state.user = user;
		},
		createToast(state, options) {
			const id = Math.round(Math.random() * 1000000);
			state.toasts[id] = {
				id,
				title: options?.title || '',
				description: options?.description || '',
				dump: options?.dump,
				icon: options?.icon || 'warning',
			};
			setTimeout(() => delete state.toasts[id], (options?.time || 30) * 1000);
		},
	},
});