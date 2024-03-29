<template>
	<main id='feature' v-if='isMobile'>
		<p class='title'>click the <i class='material-icons'>visibility</i> to edit!</p>
		<MarkdownEditor class='mobile-guide' height='60vh' resize='vertical' initRendered :value='content'/>
	</main>
	<main id='feature' v-else>
		<div class='guide'>
			<MarkdownEditor v-model:value='content' :hideGuide='true' :hidePreview='true' style='grid-area: editor' resize='vertical'/>
			<Markdown :content='content'/>
		</div>
	</main>
</template>

<script>
import { isMobile, mdGuide } from '@/config/constants';
import { tab } from '@/utilities';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';

export default {
	name: 'MarkdownGuide',
	data() {
		return {
			isMobile,
			content: mdGuide,
		};
	},
	components: {
		MarkdownEditor,
		Markdown,
	},
	mounted() {
		if (this.$route.query?.text)
		{ this.content = this.$route.query.text; }

		if (this.$route.hash)
		{ setTimeout(() => document.getElementById(this.$route.hash.substring(1)).scrollIntoView(), 0); }
	},
	methods: {
		tab,
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
.guide {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] var(--margin) [preview-start] 1fr [preview-end];
}
.guide {
	margin: 0 auto;
	/* min-width: 1000px; */
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

.guide textarea {
	grid-area: editor;
	resize: vertical;
	line-height: 1.5;
}
.markdown {
	grid-area: preview;
}
</style>