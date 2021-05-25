<template>
	<main v-if='!isError'>
		<ol class='results'>
			<p v-if='tags?.length === 0' style='text-align: center'>No tags found!</p>
			<li v-for='tag in tags' v-else>
				<Tag :inheritedTags='tag.inherited_tags' v-bind='tag'/>
			</li>
		</ol>
		<ThemeMenu />
	</main>
	<main v-else>
		<Error v-model:dump='errorDump' v-model:message='errorMessage' />
		<ThemeMenu />
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorMessage, tagsHost } from '@/config/constants';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Tag from '@/components/Tag.vue';


export default {
	name: 'Tags',
	components: {
		ThemeMenu,
		Error,
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
		khatch(`${tagsHost}/v1/lookup_tags`, {
				method: 'POST',
				body: { },
			})
			.then(response => {
				response.json().then(r => {
					console.log(r);
					console.log(Object.values(r));
					if (response.status < 300)
					{
						this.tags = [];
						for (const [tagClass, tags] of Object.entries(r))
						{
							for (const [tag, tagData] of Object.entries(tags))
							{
								this.tags.push(Object.assign(tagData, {
									class: tagClass,
									tag,
								}));
							}
						}
					}
					else if (response.status === 401)
					{ this.errorMessage = r.error; }
					else if (response.status === 404)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
					console.log(this.tags);
				});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});
	},
	computed: {
		isError()
		{ return this.errorMessage !== null; },
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
	display: block;
}
.results {
	display: flex;
	flex-direction: column;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 25px;
}
ol > :last-child {
	margin-bottom: 0;
}
</style>