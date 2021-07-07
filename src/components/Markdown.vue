<template>
	<span class='markdown inline' v-html='renderedMd' v-if='inline'></span>
	<div class='markdown' v-html='renderedMd' v-else></div>
</template>

<script> 
import marked from 'marked';
import DOMPurify from 'dompurify';
import { mdEscape, mdExtensions, mdTokenizer, mdRenderer } from '@/utilities/markdown';

marked.setOptions({
	// highlight: function(code, language) {
	// 	const hljs = require('highlight.js');
	// 	const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
	// 	return hljs.highlight(validLanguage, code).value;
	// },
	pedantic: false,
	gfm: true,
	breaks: true,
	sanitize: false, // deprecated, do not use here
	smartLists: true,
	xhtml: false,
});

marked.use({
	extensions: mdExtensions,
	tokenizer: mdTokenizer,
	renderer: mdRenderer,
});


export default {
	name: 'Markdown',
	props: {
		content: String,
		concise: {
			type: Boolean,
			default: false,
		},
		inline: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			cut: false,
		};
	},
	methods: {
		mdString() {
			if (this.content)
			{
				if (this.concise)
				{
					const match = this.content.match(/(.+(?:[\n\r]+.+){0,2})([\s\S]+)?/);

					let end = '';
					if (match[1].length > 500)
					{
						end = '...';
						this.cut = true;
					}
					else if (match[2])
					{ this.cut = true; }

					return match[1].substring(0, 500) + end;
				}
				if (this.inline)
				{ return mdEscape(this.content); }
				return this.content;
			}
		},
	},
	computed: {
		renderedMd() {
			return this.content ? DOMPurify.sanitize(marked(this.mdString())) + (this.cut ? `	<i class='material-icons-round' title='This text has been cut short'>more_horiz</i>` : '') : '';
		},
	},
}
</script>

<style>
.markdown {
	width: 100%;
}
.markdown a:link, .markdown a:visited {
	text-decoration: underline;
	text-decoration-style: dotted;
}
.markdown h1, .markdown h2 {
	border-bottom: var(--border-size) solid var(--blockquote);
	padding: 0 5px 4px;
	margin: 25px -5px 20px;
	width: 100%;
}
.markdown h3, .markdown h4, .markdown h5, .markdown h6 {
	margin: 25px 0 15px;
}
.markdown p, .markdown ul, .markdown ol, .markdown blockquote {
	margin: 15px 0;
}
.markdown li, .markdown li ul, .markdown li ol {
	margin: 0;
}
.markdown img {
	max-width: 100%;
	max-height: 10em;
}
.markdown img.emoji {
	max-width: 1.2em;
	max-height: 1.2em;
	position: relative;
	margin-top: -0.25em;
	vertical-align: bottom;
	transform: translateY(calc(50% - 0.6em))
}
.markdown hr {
	height: 0;
	color: #0000;
	border: none;
	border-bottom: var(--border-size) solid var(--blockquote);
	margin: 12px -5px;
}

.markdown > :first-child {
	margin-top: 0;
}
.markdown > :last-child {
	margin-bottom: 0;
}
.markdown pre, .markdown code {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.1em 0.25em;
}
.markdown pre {
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
}

.markdown table {
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	border-spacing: 0;
	background: var(--bg2color);
	word-break: break-word;
}
.markdown table th, .markdown table td {
	border-right: var(--border-size) solid var(--blockquote);
	border-spacing: 0px;
	border-bottom: var(--border-size) solid var(--blockquote);
}
.markdown table tbody > :last-child td {
	border-bottom: none;
}
.markdown table tr > :last-child, .markdown table tr > :last-child {
	border-right: none;
}
.markdown table td, .markdown table th {
	padding: 0.5em;
}
.markdown table code {
	background: var(--bg3color);
}
.markdown blockquote::before {
	background-color: var(--blockquote);
	width: 5px;
	border-radius: 2.5px;
	content: 'quote';
	display: block;
	margin-left: -15px;
	height: 100%;
	color: var(--blockquote);
	overflow: hidden;
	position: absolute;
}
.markdown blockquote {
	position: relative;
	margin-left: 25px;
}
.markdown blockquote blockquote {
	margin-left: 17.5px;
}
.markdown i.material-icons-round {
	margin-top: -15px;
}
.markdown > h1:last-child, .markdown > h2:last-child {
	border: none;
	padding: 0;
}

.markdown .post {
	display: inline-block;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	overflow: hidden;
	background: var(--bg2color);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.markdown .post:hover {
	border-color: var(--borderhover);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
.markdown .post p {
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	margin: 0.25em;
}
.markdown .post img {
	display: block;
}
.markdown a.post:link, .markdown a.post:visited {
	text-decoration: none;
}

.markdown.inline p {
	display: inline;
}
</style>
