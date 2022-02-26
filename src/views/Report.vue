<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Report Content</Title>
		<div class='container'>
			Select a report type below or enter your own
			<pre>
				dmca/copyright
				improper rating
				hate speech (better wording?) (abusive?)
				harmful content
				other
			</pre>
			<p style='margin-bottom: 25px; text-align: center; width: 100%'>{{JSON.stringify(payload)}}</p>
			Please describe the reason for your report below. The data above will also be included with your report, but please add all relevant details.
			<textarea class='interactable text'></textarea>
			<Button>Submit</Button>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import Button from '@/components/Button.vue';

export default {
	name: 'Report',
	components: {
		Error,
		ThemeMenu,
		Title,
		Button,
	},
	setup() {
		return {

		};
	},
	data() {
		return {
			payload: this.$route.query,
			errorDump: null,
			errorMessage: null,
		};
	},
	created() {

	},
	computed: {

	},
	methods: {
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
.container {
	width: 50vw;
	min-width: 600px;
	margin: 0 auto;
}
textarea {
	width: 100%;
	resize: vertical;
	height: 10em;
}
</style>
