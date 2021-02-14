<template>
	<div class='container' v-if='!isError && !isMobile'>
		<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>
		<div class='content'>
			<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
			<main v-resize='onResize'>
				<Subtitle static='right' class='privacy' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
				<div class='post-header'>
					<Score :score='post?.score' :postId='postId' />
					<div>
						<Title :isLoading='isLoading' size='2em' static='left'>{{post? post.title : 'this is an example title'}}</Title>
						<Profile :isLoading='isLoading' :username='post?.user.name' :handle='post?.user.handle' />
					</div>
				</div>
				<Loading :isLoading='isLoading' class='description' v-if='!post'><p>this is a very long example description</p></Loading>
				<Markdown v-else :content='post.description' style='margin: 0 0 25px' />
				<Loading :isLoading='isLoading'><Subtitle static='left'>posted <Timestamp :time='post?.created' />{{isUpdated ? ' (edited ' : ''}}<Timestamp :time='post?.updated' v-if='isUpdated' />{{isUpdated ? ')' : ''}}</Subtitle></Loading>
				<ThemeMenu />
			</main>
		</div>
	</div>
	<div class='content' v-else-if='!isError && isMobile'>
		<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
		<div class='container'>
			<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>
			<main v-resize='onResize'>
				<Subtitle static='right' class='privacy' v-if='true'>{{post?.privacy}}</Subtitle>
				<Title :isLoading='isLoading' size='2rem' static='left'>{{post? post.title : 'this is an example title'}}</Title>
				<Profile :isLoading='isLoading' :username='post?.user.name' :handle='post?.user.handle' />
				<Loading :isLoading='isLoading' class='description' v-if='!post'><p>this is a very long example description</p></Loading>
				<Markdown v-else :content='post.description' style='margin: 0 0 25px' />
				<Loading :isLoading='isLoading'><Subtitle static='left'>posted <Timestamp :time='post?.created' />{{isUpdated ? ' (edited ' : ''}}<Timestamp :time='post?.updated' v-if='isUpdated' />{{isUpdated ? ')' : ''}}</Subtitle></Loading>
				<ThemeMenu />
			</main>
		</div>
	</div>
	<Error :dump='errorDump' :message='errorMessage' v-else/>
</template>

<script>
import { khatch, getMediaUrl, isMobile } from '../utilities';
import { apiErrorMessage, postsHost } from '../config/constants';
import Loading from '../components/Loading.vue';
import Title from '../components/Title.vue';
import Subtitle from '../components/Subtitle.vue';
import Error from '../components/Error.vue';
import ThemeMenu from '../components/ThemeMenu.vue';
import Media from '../components/Media.vue';
import Sidebar from '../components/Sidebar.vue';
import Timestamp from '../components/Timestamp.vue';
import Markdown from '../components/Markdown.vue';
import Profile from '../components/Profile.vue';
import Score from '../components/Score.vue';

export default {
	name: 'Post',
	props: {
		postId: {
			type: String,
			default: null,
		},
	},
	components: {
		Timestamp,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Error,
		Media,
		Markdown,
		Profile,
		Score,
	},
	data() {
		return {
			post: null,
			errorDump: null,
			errorMessage: null,
			sidebarStyle: null,
		};
	},
	created() {
		khatch(`${postsHost}/v1/post/${this.postId}`)
			.then(response => {
				response.json()
					.then(r => {
						console.log(r);
						if (response.status < 300)
						{ this.post = r[this.postId]; }
						else if (response.status === 401)
						{ this.errorMessage = r.error; }
						else if (response.status === 404)
						{ this.errorMessage = r.error; }
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
						this.post.description = `
# this is an h1
## this is an h2
### this is an h3
#### this is an h4
##### this is an h5
###### this is an h6
####### this is an h7?
likewise with **bold** and _italics_
- some bullets
- after a paragraph
	* nested one?
1. a list??
	- some nested bullets
2. woah

a paragraph before a title
# hi

butts
=====
butts

some manual spacing between paragraphs
cont.

adfasdf @dani a username
twitter asdfasdfa t@darmiu a twitter handle
furaffinity sdafasdf fa@dariusmiu a fa page
this is not an@email, but this is a youtube account: yt@fairbairnfilms
@dani a username

dani@kheina.com
there is an autolink here https://kheina.com is a link, this likely isn't a link: kheina.com

a
b
c

---

### idk
---

this is a [manual link](https://www.google.com)
and here's an image: ![an image](https://cdn.kheina.com/file/kheina-content/nNSsjrxI/heck.png)

$ latex code $ a\`other code\`a
aa:an emoji:aa

\`\`\`python
this is a
⁃̗̀̂ codeblock ⁃̠́̂
\`\`\`
a b @c d ^ e f ^ g h $ i j $ k l &m n ^o p %q r #s t u

# Markdown Guide
There are many fantastic guides available for markdown! kheina.com recommends [markdownguide.org](https://www.markdownguide.org/basic-syntax/) for learning the ins and outs of markdown. Soon, markdown will become as familiar to you as writing your own name!
In addition to all the base markdown features, kheina.com has many extra features to make linking to other parts of the website faster and easier.

If you want to deep dive into kheina.com's implementation of markdown, you can see github's full spec for [github flavored markdown](https://github.github.com/gfm/).
However, this does not include the additional features below.


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
|       Markdown        |      Rendered       |
|:---------------------:|:-------------------:|
|       \`**bold**\`      |      **bold**       |
|       \`__bold__\`      |      __bold__       |
|      \`*italics*\`      |      *italics*      |
|      \`_italics_\`      |      _italics_      |
|  \`~~strikethrough~~\`  |  ~~strikethrough~~  |
|  \`**_bold+italic_**\`  |  **_bold+italic_**  |
| \`**~~bold+strike~~**\` | **~~bold+strike~~** |
| \`*~~italic+strike~~*\` | *~~italic+strike~~* |


## Link Examples
|             Markdown              |           Rendered            |
|:---------------------------------:|:-----------------------------:|
|      \`https://example.com\`      |      https://example.com      |
| \`[a link](https://kheina.com)\`  | [a link](https://kheina.com)  |
| \`![an image](/static/logo.png)\` | ![an image](/static/logo.png) |


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


## Additional Features
These are features unique to kheina.com's implementation of markdown.
### User Linking
to link to a user, you can simply precede the user's handle with an \`@\` character: @dani
this is pretty common on other websites, however kheina.com also supports linking to external websites with this syntax.
for example, twitter can be linked to like so: t@darmiu. there are many websites with similar syntax. the complete list is below.

|   Example   |   Website   |
|:-----------:|:-----------:|
|  @username  |  kheina.com |
| t@username  |   twitter   |
| f@username  |   facebook  |
| yt@channel  |   youtube   |
| fa@username | furaffinity |
| u@username  |    reddit   |
| tw@username |  twitch.tv  |

### Post Embedding
\`\`\`
posts (along with a rich preview) can be linked to by preceding the post id (the random characters in the url) with a \`^\` character: ^nNSsjrxI
\`\`\`
posts (along with a rich preview) can be linked to by preceding the post id (the random characters in the url) with a \`^\` character: ^nNSsjrxI

### Emojis
\`\`\`
emojis can be accessed by surrounding the emoji's code with \`:\` characters: :heck:
\`\`\`
emojis can be accessed by surrounding the emoji's code with \`:\` characters: :heck:

						`.trim();
					/**/
					});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});

		window.addEventListener('resize', this.onResize);
	},
	// mounted() {
	// 	this.onResize();
	// },
	destroyed() {
		window.removeEventListener('resize', this.onResize);
	},
	computed: {
		isMobile,
		isLoading()
		{ return this.post === null; },
		isError()
		{ return this.errorMessage !== null; },
		isUpdated()
		{ return this.post !== null ? Math.round(this.post.created) !== Math.round(this.post.updated) : false; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		mediaElement() {
			let media = document.getElementsByClassName('media');
			if (media.length > 0)
			{ return media[0]; }
			return null;
		},
		showPrivacy()
		{ return this.post?.privacy != 'public'; }
	},
	methods: {
		onResize()
		{
			if (!this.mediaElement)
			{ return; }

			if (this.isMobile)
			{
				this.mediaElement.style = 'margin: 0 auto 25px; max-width: 100%';
				return;
			}

			let rect = this.mediaElement.getBoundingClientRect();
			let right = window.innerWidth - rect.right;
			let margin = Math.max(window.innerWidth * 0.2, 200) - 0.1;

			if (rect.left < margin)
			{ this.mediaElement.style = 'margin: 0 auto 25px 0'; }
			else if (rect.left < right - 0.1)
			{ this.mediaElement.style = 'margin: 0 auto 25px; right: 10vw'; }
		},
	},
}
</script>

<style scoped>
.container {
	display: grid;
	grid-template-columns: [sidebar-start] max(20vw, 200px) [sidebar-end main-start] auto [main-end];
	grid-template-rows: [sidebar-start main-start] auto [sidebar-end main-end];
}
main {
	background: var(--bg1color);
	grid-area: main;
	border-radius: 3px 0 0 3px;
	display: flex;
	flex-direction: column;
	align-items: start;
	position: relative;
	padding: 25px;
	overflow: hidden;
}
.media {
	grid-area: media;
	margin: 0 auto 25px 0;
	position: relative;
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
	max-width: calc(100vw - max(20vw, 200px) - 25px);
}
.sidebar {
	grid-area: sidebar;
	position: relative;
	margin: 0;
}
.privacy {
	position: absolute;
	right: 25px;
}
.content {
	grid-area: main;
	display: flex;
	flex-direction: column;
}
.description {
	font-size: 1.3em;
	margin: 0 0 25px;
}
.profile {
	margin-top: 0.25em;
}
.post-header {
	display: flex;
	margin-bottom: 25px;
}
</style>