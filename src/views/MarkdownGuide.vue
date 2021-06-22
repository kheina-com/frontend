<template>
	<main id='feature'>
		<p class='title'>click the <i class='material-icons'>visibility</i> to edit!</p>
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
	mounted() {
		if (this.$route.query?.text)
		{ this.content = this.$route.query.text; }
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
.guide, .title {
	margin: 0 auto;
	min-width: 800px;
	width: 40vw;
	position: relative;
}
.title {
	text-align: right;
}
.title i {
	position: relative;
	bottom: -0.2em;
	font-size: 1.2em;
}
</style>