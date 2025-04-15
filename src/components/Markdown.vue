<template>
	<span ref='markdown' class='markdown inline' v-html='rendered' v-if='inline'></span>
	<div ref='markdown' class='markdown block' v-html='rendered' v-else></div>
</template>
<script setup lang='ts'> 
import { onMounted, ref, watch, type Ref } from 'vue';
import { lazyConfig } from '@/utilities';
import { mdEscape, mdExtensions, mdRenderer, mdTokenizer } from '@/utilities/markdown';
import { marked, type RendererObject, type TokenizerObject } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
	// highlight: function(code, lang) {
	// 	return prism.languages.hasOwnProperty(lang) ? prism.highlight(code, prism.languages[lang], lang) : code;
	// },
	pedantic: false,
	gfm: true,
	breaks: true,
	// smartLists: true,
	// xhtml: false,
	// sanitizer: DOMPurify.sanitize,
});

marked.use({
	extensions: mdExtensions,
	renderer: mdRenderer as unknown as RendererObject,
	tokenizer: mdTokenizer as unknown as TokenizerObject,
});
//// for debugging
// marked.Lexer.lex = function (src, options) {
// 	const lexer = new marked.Lexer(options);

// 	const a = lexer.lex(src)
// 	// if (src.includes('strawberry'))
// 	{ console.log(a); }

// 	return a;
// };

const props = withDefaults(defineProps<{
	content?: string | null,
	concise?: boolean,
	superconcise?: boolean,
	inline?:  boolean,
	lazy?:    boolean,
}>(), {
	concise:      false,
	superconcise: false,
	inline:       false,
	lazy:         false,
});

const markdown = ref<HTMLDivElement | HTMLSpanElement | null>(null) as Ref<HTMLDivElement | HTMLSpanElement>;
const rendered: Ref<string | null> = ref(null);
let cut: boolean = false;

onMounted(() => {
	if (props.lazy) {
		const observer = new IntersectionObserver(
			e => {
				// console.log(e);
				e.forEach(entry => {
					if (entry.isIntersecting) {
						observer.unobserve(entry.target);
						render();
					}
				});
			},
			lazyConfig,
		);
		observer.observe(markdown.value);
	}
	else {
		render();
	}
});

function mdString(): string {
	if (!props.content) return "";

	if (props.superconcise) {
		const match = props.content.match(/((?:[^\n\r]*[\n\r]?){0,1})([\s\S]+)?/);

		if (!match) return props.content.substring(0, 100);

		let end = '';
		if (match[1].length > 100) {
			end = '...';
			cut = true;
		}
		else if (match[2]) {
			cut = true;
		}

		return match[1].substring(0, 100) + end;
	}

	if (props.concise) {
		const match = props.content.match(/((?:[^\n\r]*[\n\r]?){0,5})([\s\S]+)?/);

		if (!match) return props.content.substring(0, 500);

		let end = '';
		if (match[1].length > 500) {
			end = '...';
			cut = true;
		}
		else if (match[2]) {
			cut = true;
		}

		return match[1].substring(0, 500) + end;
	}

	if (props.inline) return mdEscape(props.content);
	return props.content;
}

function render() {
	rendered.value = props.content ? (
		DOMPurify.sanitize(
			props.inline ? (
				marked.parse(mdString()) as string
			) : (
				marked.parse(mdString()) + (cut ? "	<i class='material-icons-round' title='This text has been cut short'>more_horiz</i>" : '')
			)
		)
	) : null;
}

watch(() => props.content, render);
</script>
<style>
.markdown .profile-user-icon {
	width: 3em;
	height: 3em;
	border-radius: var(--border-radius);
	display: inline-block;
}
a.external-link::after {
	font-family: 'Material Icons Round' !important;
	content: "open_in_new";
	position: relative;
	font-size: 0.8em;
	bottom: -0.2em;
	margin-top: -0.31em;
	text-decoration: none;
	display: inline-block;
	margin-left: 0.2em;
	color: var(--subtle);
}
.markdown.block {
	width: 100%;
}
.markdown * {
	vertical-align: top;
}
.post .markdown a {
	position: relative;
}
.markdown a:link, .markdown a:visited {
	text-decoration: underline;
	text-decoration-style: dotted;
	color: inherit;
}
.markdown h1, .markdown h2 {
	border-bottom: var(--border-size) solid var(--blockquote);
	padding: 0 5px 4px;
	margin: var(--margin) -5px 20px;
	width: 100%;
}
.markdown h3, .markdown h4, .markdown h5, .markdown h6 {
	margin: var(--margin) 0 15px;
}
.markdown p, .markdown ul, .markdown ol, .markdown blockquote, .markdown .alignment {
	margin: 15px 0;
}
.markdown li, .markdown li ul, .markdown li ol {
	margin: 0;
}
.markdown img {
	max-width: 100%;
	max-height: 100%;
}
.markdown img.emoji, .markdown.inline .gigamoji img {
	max-width: 1.2em;
	max-height: 1.2em;
	position: relative;
	margin-top: -0.2em;
	vertical-align: middle;
	/* transform: translateY(calc(50% - 0.6em)) */
}
.markdown .handle {
	white-space: nowrap;
}
.markdown .handle img.emoji {
	position: relative;
	margin-right: 0.2em;
}
.markdown .gigamoji {
	margin: 0;
	display: flex;
	align-items: center;
}
.markdown .gigamoji img {
	max-width: 5em;
	max-height: 5em;
}
.markdown hr {
	height: 0;
	color: #0000;
	border: none;
	border-bottom: var(--border-size) solid var(--blockquote);
	margin: 12px -5px;
}

.markdown > :first-child, .markdown .alignment > :first-child {
	margin-top: 0;
}
.markdown > :last-child, .markdown .alignment > :last-child {
	margin-bottom: 0;
}
.markdown .alignment.center, .markdown .alignment.center * {
	text-align: center;
	justify-content: center;
}
.markdown .alignment.left, .markdown .alignment.left * {
	text-align: left;
	justify-content: flex-start;
}
.markdown .alignment.right, .markdown .alignment.right * {
	text-align: right;
	justify-content: flex-end;
}
.markdown pre, .markdown code {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.1em 0.25em;
}
.markdown pre code {
	padding: 0;
}

.markdown pre {
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
}
.markdown p {
	white-space: pre-wrap;
	word-wrap: break-word;
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
	background: var(--bg1color);
}
.markdown blockquote::before {
	background-color: var(--blockquote);
	width: 0.25em;
	border-radius: 0.125em;
	content: 'quote';
	display: block;
	margin-left: -0.75em;
	height: 100%;
	color: var(--blockquote);
	overflow: hidden;
	position: absolute;
}
.markdown blockquote {
	position: relative;
	margin-left: var(--margin);
}
.markdown blockquote blockquote {
	margin-left: 17.5px;
}
.markdown i.material-icons-round {
	margin-top: -0.2em;
	margin-left: -0.15em;
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
	white-space: initial;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.markdown .post:hover {
	border-color: var(--borderhover);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
.markdown .post p {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	margin: 0.25em;
}
.markdown .post img {
	display: block;
	margin: 0 auto;
	max-width: 20em;
	max-height: 10em;
}
.markdown a.post:link, .markdown a.post:visited {
	text-decoration: none;
}

.markdown.inline p {
	display: inline;
}

/* THEME OVERRIDES */
html.solarized-dark .markdown .gigamoji img,
html.solarized-dark .markdown img.emoji {
	filter: saturate(0.625);
}

html.solarized-light .markdown .gigamoji img,
html.solarized-light .markdown img.emoji {
	filter: sepia(0.375);
}
</style>
