<template>
	<main id='feature'>
		<MarkdownEditor class='guide' height='60vh' resize='vertical' initRendered :value='content' />
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorMessage, mdGuide } from '@/config/constants';
import MarkdownEditor from '@/components/MarkdownEditor.vue';

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
		MarkdownEditor,
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
.guide {
	margin: 0 auto;
	min-width: 800px;
	width: 40vw;
	position: relative;
}
</style>