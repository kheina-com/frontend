<template>
	<main id='feature' v-if='isMobile'>
		<p class='title'>click the <i class='material-icons'>visibility</i> to edit!</p>
		<MarkdownEditor class='mobile-guide' height='60vh' resize='vertical' initRendered :value='content'/>
	</main>
	<main id='feature' v-else>
		<div class='guide'>
			<textarea class='interactable text' resize='vertical' v-model='content'/>
			<Markdown :content='content'/>
		</div>
	</main>
</template>

<script>
import { isMobile } from '@/utilities';
import { mdGuide } from '@/config/constants';
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
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
.guide {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] 25px [preview-start] 1fr [preview-end];
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