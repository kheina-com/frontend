<template>
	<div class='markdown' v-html='marked(content)'>
	</div>
</template>

<script>
import marked from 'marked';
import { markdownTokenizer, edit } from '../utilities';
// import { highlight, getLanguage } from 'highlight.js';

const inlineText = edit(/^([`~]+|[^`~])(?:(?= *\n)|[\s\S]*?(?:(?=[\\<!\[`*~]|\b_| *\n|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= *\n)|[^charset](?=[charset]*end)|(?=end\S))|(?=[charset]*end))/i, 'i')
	.replace(/end/g, '[@#%^&]')
	.replace(/charset/g, "a-zA-Z0-9.!#$%^&'*+\\/=?_`{\\|}~-")
	.getRegex();

const inlineUrl = edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^[A-Za-z0-9._+-]*(end)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])*(?![-_])/i, 'i')
	.replace(/end/g, '[@#%^&]')
	// .replace(/charset/g, "a-zA-Z0-9.!#$%^&'*+\\/=?_`{\\|}~-")
	.getRegex();


marked.Lexer.lex = function (src, options) {
	const lexer = new marked.Lexer(options);

	// custom rules
	// text determines where any given rule can start
	lexer.tokenizer.rules.inline.text = inlineText;
	lexer.tokenizer.rules.inline.url = inlineUrl;

	let a = lexer.lex(src);
	// console.log(JSON.parse(JSON.stringify(a)));
	return a;
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
	smartypants: false,
	xhtml: false,
});

marked.use({ tokenizer: markdownTokenizer });


export default {
	name: 'Markdown',
	props: {
		content: String,
	},
	methods: {
		marked,
	},
}
</script>

<style>
.markdown {
	width: 100%;
}
.markdown a:link, .markdown a:visited {
	/* color: var(--icolor); */
	text-decoration: underline;
	text-decoration-style: dotted;
}
.markdown a:hover {
	/* color: var(--textcolor) !important; */
}
.markdown h1, .markdown h2 {
	border-bottom: solid 1px var(--bordercolor);
	padding: 0 5px 4px;
	margin: 25px -5px 20px;
	width: 100%;
}
.markdown h3, .markdown h4, .markdown h5, .markdown h6 {
	margin: 25px 0;
}
.markdown p, .markdown ul, .markdown ol {
	margin: 15px 0;
}
.markdown li, .markdown li ul, .markdown li ol {
	margin: 0;
}
.markdown img {
	max-width: 10em;
	max-height: 10em;
}
.markdown img.emoji {
	max-width: 2em;
	max-height: 2em;
}
.markdown hr {
	height: 0;
	color: #0000;
	border: none;
	border-bottom: solid 1px var(--bordercolor);
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
}

.markdown table {
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	border-spacing: 0;
	background: var(--bg2color);
}
.markdown table th, .markdown table td {
	border-right: 1px solid var(--bordercolor);
	border-spacing: 0px;
	border-bottom: 1px solid var(--bordercolor);
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
</style>