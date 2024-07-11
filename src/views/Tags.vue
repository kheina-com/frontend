<template>
	<main>
		<ol class='results'>
			<p v-if='tags?.length === 0' style='text-align: center'>No tags found!</p>
			<li v-for='tag in tags' v-else>
				<Tag :inheritedTags='tag.inherited_tags' v-bind='tag'/>
			</li>
		</ol>
		<ThemeMenu/>
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Tag from '@/components/Tag.vue';


export default {
	name: 'Tags',
	components: {
		ThemeMenu,
		Tag,
	},
	data() {
		return {
			tags: null,
			errorDump: null,
			errorMessage: null,
		}
	},
	mounted() {
		khatch(`${host}/v1/tags/lookup`, {
				method: 'POST',
				body: { },
			})
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.tags = r; }
					else if (response.status === 400)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 401)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 404)
					{ this.$store.commit('error', r.error); }
					else
					{ this.$store.commit('error', apiErrorMessage, r); }
					console.log(this.tags);
				});
			})
				.catch(error => {
					this.$store.commit('error', apiErrorMessage, error);
					console.error(error);
				});
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}
</style>