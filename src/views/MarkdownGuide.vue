<template>
	<main id='feature'>
		<Markdown :content='content' />
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorMessage, mdGuide } from '@/config/constants';
import Markdown from '@/components/Markdown.vue';

export default {
	name: 'MarkdownGuide',
	props: {
	},
	data() {
		return {
			content: mdGuide,
		};
	},
	components: {
		Markdown,
	},
	computed: {
	},
	methods: {
	},
}
</script>

<style scoped>

</style>