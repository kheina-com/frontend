<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			things you will eventually be able to do here:
			<ul style='display: inline-block; margin-bottom: 0'>
				<li>
					change the query used to retrieve posts on your profile page
					<br>
					(defaults to pulling all posts containing one of your owned tags)
				</li>
				<li>
					change your handle to something else (or just change the capitalization)
				</li>
				<li>
					transfer ownership of tags to other users (may require permission or something, not sure yet)
				</li>
				<li>
					change what tags (or users) you have blocked
				</li>
				<li>
					change blocking behavior (omit entirely or just hide image/desc)
				</li>
				<li>
					delete your account
				</li>
				<li>
					change local performance settings (load thumbnails vs fullsize)
				</li>
			</ul>
			<br>
			things you can already do here:
			<ul style='display: inline-block; margin-bottom: 0'>
				<li>
					<span>maximum rating for autoloading thumbnails in search results</span>
					<br>
					<RadioButtons
						name='rating'
						v-model:value='maxRating'
						:data="[
							{ content: 'general' },
							{ content: 'mature' },
							{ content: 'explicit' },
						]"
					/>
				</li>
			</ul>

		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import { getCookie, setCookie } from '@/utilities';
import { ratingMap } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import RadioButtons from '@/components/RadioButtons.vue';

export default {
	name: 'Account',
	components: {
		ThemeMenu,
		RadioButtons,
	},
	data() {
		return {
			maxRating: getCookie('max-rating', 'general'),
		};
	},
	computed: {
	},
	methods: {
	},
	watch: {
		maxRating(value) {
			setCookie('max-rating', value, 3155695200);
			this.$store.commit('maxRating', ratingMap[value]);
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
</style>