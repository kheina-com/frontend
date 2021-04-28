<template>
	<div class='markdown' v-html='renderMd(content)'>
	</div>
</template>

<script>
import marked from 'marked';
import DOMPurify from 'dompurify';
import { markdownTokenizer, edit } from '@/utilities';
// import { highlight, getLanguage } from 'highlight.js';

const inlineText = edit(/^([`~]+|[^`~])(?:(?= *\n)|[\s\S]*?(?:(?=[\\<!\[`*~]|\b_| *\n|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= *\n)|[^endcharset](?=[charset]*[end])|(?=[end]\S))|(?=[charset]*[end]))/, 'i')
	.replace(/end/g, '@#%:^')
	.replace(/charset/g, "a-zA-Z0-9.!#$%^&'*+\\/=?_`{\\|}~-")
	.getRegex();

const inlineUrl = edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^[A-Za-z0-9._+-]*(end)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])*(?![-_])/, 'i')
	.replace(/end/g, '@#%:^')
	.getRegex();


marked.Lexer.lex = function (src, options) {
	const lexer = new marked.Lexer(options);

	// text determines where any given rule can start
	lexer.tokenizer.rules.inline.text = inlineText;
	lexer.tokenizer.rules.inline.url = inlineUrl;

	return lexer.lex(src);
};

marked.setOptions({
	renderer: new marked.Renderer(),
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

marked.use({ tokenizer: markdownTokenizer });


export default {
	name: 'Markdown',
	props: {
		content: String,
		concise: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			DOMPurify,
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
				return this.content;
			}
		},
		renderMd() {
			return this.content ? DOMPurify.sanitize(marked(this.mdString())) + (this.cut ? `	<i class='material-icons-round' title='This text has been cut short'>more_horiz</i>` : '') : '';
		},
	},
}
</script>

<style>
.markdown {
	width: 100%;
	/* overflow: hidden;
	padding: 1em;
	margin: -1em; */
}
.markdown a:link, .markdown a:visited {
	text-decoration: underline;
	text-decoration-style: dotted;
}
.markdown h1, .markdown h2 {
	border-bottom: solid 1px var(--blockquote);
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
	max-width: 1.2em;
	max-height: 1.2em;
	width: 100%;
}
.markdown img.emoji {
	max-width: 2em;
	max-height: 2em;
}
.markdown hr {
	height: 0;
	color: #0000;
	border: none;
	border-bottom: solid 1px var(--blockquote);
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
	border-radius: 3px;
}
.markdown pre {
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
}

.markdown table {
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	border-spacing: 0;
	background: var(--bg2color);
	word-break: break-word;
}
.markdown table th, .markdown table td {
	border-right: 1px solid var(--blockquote);
	border-spacing: 0px;
	border-bottom: 1px solid var(--blockquote);
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
</style>
