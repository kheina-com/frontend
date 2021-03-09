<template>
	<div>
		<input
			ref='tagSearch'
			placeholder='Type to search or create tag'
			class='interactable text'
			style='width: 100%'
			v-on:keyup='searchForTag'
			v-on:keydown.stop.enter='addTag'
		>
		<ul>
			<li>
				snow_leopard
			</li>
		</ul>
	</div>
</template>

<script>

export default {
	name: 'DropDown',
	setup() {
		const tagSearch = ref(null);
		return {
			tagSearch,
		};
	},
	data() {
		return {
			tagGroups,
			errorDump: null,
			errorMessage: null,
			serverTags: null,
			tags: [],
			recommendations: null,
		};
	},
	created() {
		khatch(`https://dev.kheina.com/tags/v1/lookup_tags`, {
			method: 'POST',
			body: {
				tag: '',
			},
		})
		.then(response => {
			response.json().then(r => {
				if (response.status < 300)
				{
					let serverTags = { };
					for (const [group, tags] of Object.entries(r)) {
						Object.keys(tags).forEach(k => {
							tags[k]['group'] = group;
						});
						serverTags = Object.assign(serverTags, tags);
					}
					this.serverTags = serverTags;
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
			});
		})
		.catch(error => {
			this.errorMessage = apiErrorMessage;
			this.error = error;
			console.error(error);
		});
	},
	methods: {
		searchForTag() {
			const searchValue = this.$refs.tagSearch.value.trim().toLowerCase();
			console.log(searchValue);
			const recommendations = [];
			for (const [tag, meta] of Object.entries(this.serverTags)) {
				if (tag.includes(searchValue) && !meta.deprecated)
				{ recommendations.push(tag); }
			}
			console.log(recommendations);
			this.recommendations = recommendations;
		},
		addTag() {
			const searchValue = this.$refs.tagSearch.value.trim().toLowerCase();
			this.tags.push(searchValue);
			console.log(this.tags);
			this.$refs.tagSearch.value = null;
		},
		filterTags(group) {
			return this.tags.map(tag => {
				if (this.serverTags.hasOwnProperty(tag))
				{
					if (this.serverTags[tag].group === group)
					{ return tag; }
				}
				else if (group === 'misc')
				{ return tag; }
			}).filter(x => x);
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
	overflow: hidden;
}
.form {
	margin: 0 auto;
	width: 50vw;
	min-width: 400px;
	position: relative;
}
.form .field {
	margin: 25px 0;
}
.form span {
	position: relative;
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}
.tags {
	display: flex;
	justify-content: center;
	align-items: flex-start;
}
textarea {
	width: 100%;
	height: 10em;
	margin: 0;
}
p {
	padding: 0 0 2px 30px;
	margin: 0 -5px;
	border-bottom: 1px solid var(--bordercolor);
}
h4 {
	margin: 0;
}
ul {
	padding: 0;
	margin: 0 12.5px;
}
</style>
