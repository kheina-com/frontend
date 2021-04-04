import { createStore } from 'vuex';
import { khatch } from '@/utilities';
import { usersHost } from '@/config/constants';


export default createStore({
	state: {
		auth: null,
		user: null,
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
	},
});