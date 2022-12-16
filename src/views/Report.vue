<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Report Content</Title>
		<div class='container'>
			<span>Select a report type below or enter your own</span>
		</div>
		<div class='type-select'>
			<RadioButtons
				name='report-type'
				v-model:value='reportType'
				:data="[
					{ content: 'DMCA / Copyright', value: 'copyright' },
					{ content: 'Improper Rating', value: 'rating' },
					{ content: 'Misinformation', value: 'misinformation' },
					{ content: 'Impersonation', value: 'impersonation' },
					{ content: 'Harassment / Intimidation', value: 'intimidation' },
					{ content: 'Call to Violence', value: 'violence' },

					// please always put other last
					{ content: 'Other', value: 'other' },
				]"
			/>
		</div>
		<div class='container'>
			<span>Data included in this report</span>
			<pre>{{JSON.stringify($route.query, null, 4)}}</pre>
			<span>Please describe the reason for your report below, please add all relevant details</span>
			<textarea class='interactable text'></textarea>
			<div class='buttons'>
				<Button>Submit</Button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import Button from '@/components/Button.vue';
import RadioButtons from '@/components/RadioButtons.vue';

export default {
	name: 'Report',
	components: {
		ThemeMenu,
		Title,
		Button,
		RadioButtons,
	},
	data() {
		return {
			reportType: null,
		};
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
.mobile .container {
	width: 100%;
}
textarea {
	width: 100%;
	resize: vertical;
	height: 10em;
}
span {
	position: relative;
	left: 25px;
}
pre {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
	margin: 0 auto 25px;
}
pre code {
	padding: 0;
}
.type-select {
	margin-bottom: 25px;
}
.radio-buttons {
	justify-content: center;
}
.buttons {
	text-align: right;
}
</style>
