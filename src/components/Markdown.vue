<template>
	<div class='markdown' v-html='marked(content)'>
	</div>
</template>

<script>
import marked from 'marked';

marked.setOptions({
	renderer: new marked.Renderer(),
	highlight: function(code, language) {
		const hljs = require('highlight.js');
		const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
		return hljs.highlight(validLanguage, code).value;
	},
	pedantic: false,
	gfm: true,
	breaks: true,
	sanitize: false, // deprecated, do not use here
	smartLists: true,
	smartypants: false,
	xhtml: false
});

export default {
	name: 'Markdown',
	props: {
		content: String,
	},
	methods: {
		marked,
	},
	mounted() {
		console.log(this.content);
		console.log(marked(this.content));
	}
}
</script>

<style scoped>
</style>
