<template>
	<main id='feature' v-if='isMobile'>
		<p class='title'>click the <i class='material-icons'>visibility</i> to edit!</p>
		<MarkdownEditor class='mobile-guide' height='60vh' resize='vertical' initRendered :value='content'/>
		<ThemeMenu/>
	</main>
	<main id='feature' v-else>
		<div class='guide'>
			<MarkdownEditor v-model:value='content' :hideGuide='true' :hidePreview='true' style='grid-area: editor' resize='vertical'/>
			<Markdown :content='content'/>
		</div>
		<ThemeMenu/>
	</main>
</template>
		
<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { iconShortcode, isMobile } from '@/config/constants';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import image from '$/default-icon.png?url';

const route = useRoute();

onMounted(() => {
	if (route.query?.text) content.value = route.query.text.toString();
	if (route.hash) setTimeout(() => document.getElementById(route?.hash?.substring(1))?.scrollIntoView(), 0);
});

const mdGuide = `# Markdown Guide
There are many fantastic guides available for markdown! fuzz.ly recommends [markdownguide.org](https://www.markdownguide.org/basic-syntax/) for learning the ins and outs of markdown. Soon, markdown will become as familiar to you as writing your own name!
In addition to all the base markdown features, fuzz.ly has many [extra features](#additional-features) to make linking to other parts of the website faster and easier.

If you want to deep dive into fuzz.ly's implementation of markdown, you can see github's full spec for [github flavored markdown](https://github.github.com/gfm/).
However, this does not include the [additional features](#additional-features) below.


## Header Examples
\`\`\`
# header
\`\`\`
# header

\`\`\`
## header2
\`\`\`
## header2

\`\`\`
### header3
\`\`\`
### header3

\`\`\`
#### header4
\`\`\`
#### header4

\`\`\`
##### header5
\`\`\`
##### header5

\`\`\`
###### header6
\`\`\`
###### header6


## Text Examples
|       Markdown       |      Rendered      |
|:--------------------:|:------------------:|
|      \`**bold**\`      |      **bold**      |
|      \`__bold__\`      |      __bold__      |
|      \`*italics*\`     |      *italics*     |
|      \`_italics_\`     |      _italics_     |
|   \`~strikethrough~\`  |   ~strikethrough~  |
|  \`**_bold+italic_**\` |  **_bold+italic_** |
|  \`**~bold+strike~**\` |  **~bold+strike~** |
|  \`*~italic+strike~*\` |  *~italic+strike~* |
| \`*~__everything__~*\` | *~__everything__~* |


## Link Examples
|          Markdown           |         Rendered          |
|:---------------------------:|:-------------------------:|
|    \`https://example.com\`    |    https://example.com    |
| \`[a link](https://fuzz.ly)\` | [a link](https://fuzz.ly) |
|   \`![an image](${image})\`   |   ![an image](${image})   |


## Code Examples
\`\`\`
\`inline code\`
\`\`\`
\`inline code\`

-----
\`\`\`\`
\`\`\`
a codeblock
\`\`\`
\`\`\`\`
\`\`\`
a codeblock
\`\`\`


## Blockquote Example
\`\`\`
> blockquote
\`\`\`
> blockquote


## Table Example
\`\`\`
|      header 1      |      header 2       |      header 3      |
|-------------------:|:-------------------:|:-------------------|
| right-aligned text | center-aligned text | left-aligned text  |
|    a second row    |                     | with an empty cell |
|spacing is |also ignored in| table syntax |
initial and trailing | pipes (\`|\`) can be omitted, | if you so choose
\`\`\`
|      header 1      |      header 2       |      header 3      |
|-------------------:|:-------------------:|:-------------------|
| right-aligned text | center-aligned text | left-aligned text  |
|    a second row    |                     | with an empty cell |
|spacing is |also ignored in| table syntax |
initial and trailing | pipes (\`\\|\`) can be omitted, | if you so choose


# Additional Features
These are features unique to fuzz.ly's implementation of markdown.

## User Linking
to link to a user, you can simply precede the user's handle with an \`@\` character: @kheina
this is pretty common on other websites, however fuzz.ly also supports linking to external websites with this syntax.
for example, twitter can be linked to like so: t@Twitter. there are many websites with similar syntax. the complete list is below.

|    Example    |     Rendered      |       Website       |        Formatted        |
|:-------------:|:-----------------:|:-------------------:|:-----------------------:|
|   \`@kheina\`   |      @kheina      |       fuzz.ly       | https://fuzz.ly/kheina
|  \`[@]kheina\`  |     [@]kheina     |       fuzz.ly       | https://fuzz.ly/kheina
| \`${iconShortcode}@kheina\` |    ${iconShortcode}@kheina    |       fuzz.ly       | https://fuzz.ly/kheina
| \`t@username\`  |    t@username     |     twitter.com     | https://twitter.com/username
| \`f@username\`  |    f@username     |     facebook.com    | https://facebook.com/username
| \`ig@username\` | ig@theounderstars |    instagram.com    | https://www.instagram.com/username
| \`yt@channel\`  |    yt@channel     |     youtube.com     | https://youtube.com/c/channel
| \`tt@username\` |    tt@username    |      tiktok.com     | https://www.tiktok.com/@username
| \`tg@username\` |    tg@username    |     telegram.org    | https://t.me/username
| \`fa@username\` |    fa@username    |   furaffinity.net   | https://furaffinity.net/user/username
| \`u@username\`  |    u@username     |      reddit.com     | https://reddit.com/u/username
| \`tw@username\` |    tw@username    |      twitch.tv      | https://twitch.tv/username
| \`p@username\`  |    p@username     |     patreon.com     | https://patreon.com/username
| \`pi@username\` |    pi@username    |      picarto.tv     | https://picarto.tv/username
| \`kf@username\` |    kf@username    |      ko-fi.com      | https://ko-fi.com/username
| \`gr@username\` |    gr@username    |     gumroad.com     | https://gumroad.com/username
| \`st@username\` |    st@username    | subscribestar.adult | https://subscribestar.adult/username
| \`rf@username\` |    rf@username    |    refsheet.net     | https://ref.st/username
| \`pp@username\` |    pp@username    |      paypal.me      | https://www.paypal.me/username
| \`fn@username\` |    fn@username    |  furrynetwork.com   | https://www.furrynetwork.com/username
| \`w@username\`  |    w@username     |     weasyl.com      | https://www.weasyl.com/~username
| \`b@username\`  |    b@username     |      boosty.to      | https://boosty.to/username
| \`th@username\` |    th@username    |      toyhou.se      | https://toyhou.se/username
| \`cm@username\` |    cm@username    |     commiss.io      | https://commiss.io/username
| \`tm@username\` |    tm@username    |     tumblr.com      | https://www.tumblr.com/username

## Color
you can also change the color of text to your liking by putting \`%\` on either side of your text, with a color

\`\`\`
%blue this is set to blue via a theme-friendly code %
%0077bb this is set to blue via a static hex-coded color %
\`\`\`

%blue this is set to blue via a theme-friendly code %
%0077bb this is set to blue via a static hex-coded color %

## Post Embedding
posts (along with a rich preview) can be linked to by preceding the post id (the random characters in the url) with a \`^\` character
\`\`\`
^nNSsjrxI
\`\`\`
^nNSsjrxI

## Emojis
emojis can be accessed by surrounding the emoji's code with \`:\` characters
\`\`\`
inline emoji: :heart:
\`\`\`
inline emoji: :heart:

### Gigamoji
leaving an emoji by itself on a line turns it into a gigamoji
\`\`\`
:heart:
\`\`\`
:heart:

## Text Alignment
Text can be aligned by adding \`<\`, \`>\` characters onto either end of your text

\`\`\`
> centered text <
> right-aligned text >
< left-aligned text <
\`\`\`
> centered text <
> right-aligned text >
< left-aligned text <`;
const content: Ref<string> = ref(mdGuide);

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