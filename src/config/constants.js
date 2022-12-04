import image from '$/favicon/dark/256.png?url';


export default 1576242000 * 1000;

let env = null;

switch (window.location.hostname.toLowerCase())
{
	case 'kheina.com' :
		env = 'prod';
		break;

	case 'dev.kheina.com' :
		env = 'dev';
		break;

	case 'localhost' :
		env = 'local';
		break;

	case '127.0.0.1' :
		env = 'local';
		break;
}

export const environment = env;


let pHost = null;
let tHost = null;
let aHost = null;
let uHost = null;
let cHost = null;
let usrHost = null;

switch (environment)
{
	case 'prod' :
		pHost = 'https://posts.kheina.com';
		tHost = 'https://tags.kheina.com';
		aHost = 'https://account.kheina.com';
		uHost = 'https://upload.kheina.com';
		cHost = 'https://config.kheina.com';
		usrHost = 'https://users.kheina.com';
		break;

	case 'dev' :
		pHost = 'https://dev.kheina.com/posts';
		tHost = 'https://dev.kheina.com/tags';
		aHost = 'https://dev.kheina.com/acct';
		uHost = 'https://dev.kheina.com/upload';
		cHost = 'https://dev.kheina.com/config';
		usrHost = 'https://dev.kheina.com/users';
		break;

	case 'local' :
		pHost = 'https://dev.kheina.com/posts';
		tHost = 'https://dev.kheina.com/tags';
		aHost = 'https://dev.kheina.com/acct';
		uHost = 'https://dev.kheina.com/upload';
		cHost = 'https://dev.kheina.com/config';
		usrHost = 'https://dev.kheina.com/users';
		break;
}

export const postsHost = pHost;
export const tagsHost = tHost;
export const accountHost = aHost;
export const uploadHost = uHost;
export const configHost = cHost;
export const usersHost = usrHost;

export const cdnHost = 'https://cdn.kheina.com/file/kheina-content'

export const apiErrorMessage = 'An error occurred in your browser during an API call.';

export const apiErrorMessageToast = 'An error occurred during an API call';

export const apiErrorDescriptionToast = 'If you submit a bug report, please include the data below.';

export const tagGroups = ['artist', 'subject', 'sponsor', 'species', 'gender', 'misc', 'rating'];

export const ratings = new Set(['general', 'mature', 'explicit']);

export const routerMetaTag = 'data-v-router';

export const tabs = new Set(['posts', 'sets', 'tags', 'favs', 'uploads']);

export const defaultUserIcon = '_V-EGBtH';
export const iconShortcode = 'icon';

export const ratingMap = {
	'general': 0,
	'mature': 1,
	'explicit': 2,
};

export const mdGuide = `
# Markdown Guide
There are many fantastic guides available for markdown! kheina.com recommends [markdownguide.org](https://www.markdownguide.org/basic-syntax/) for learning the ins and outs of markdown. Soon, markdown will become as familiar to you as writing your own name!
In addition to all the base markdown features, kheina.com has many [extra features](#additional-features) to make linking to other parts of the website faster and easier.

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
|            Markdown             |           Rendered            |
|:-------------------------------:|:-----------------------------:|
|      \`https://example.com\`      |      https://example.com      |
| \`[a link](https://kheina.com)\`  | [a link](https://kheina.com)  |
|     \`![an image](${image})\`     |     ![an image](${image})     |


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
These are features unique to kheina.com's implementation of markdown.

## User Linking
to link to a user, you can simply precede the user's handle with an \`@\` character: @dani
this is pretty common on other websites, however kheina.com also supports linking to external websites with this syntax.
for example, twitter can be linked to like so: t@Twitter. there are many websites with similar syntax. the complete list is below.

|       Example       |     Rendered      |       Website       |                Formatted                 |
|:-------------------:|:-----------------:|:-------------------:|:----------------------------------------:|
|   \`@kheina\`         |      @kheina      |      kheina.com     | https://kheina.com/kheina                |
|   \`${iconShortcode}@kheina\`     |    ${iconShortcode}@kheina    |      kheina.com     | https://kheina.com/kheina                |
| \`t@username\`        |    t@username     |     twitter.com     | https://twitter.com/username             |
| \`f@username\`        |    f@username     |     facebook.com    | https://facebook.com/username            |
| \`ig@theounderstars\` | ig@theounderstars |    instagram.com    | https://www.instagram.com/theounderstars |
| \`yt@channel\`        |    yt@channel     |     youtube.com     | https://youtube.com/c/channel            |
| \`tt@username\`       |    tt@username    |      tiktok.com     | https://www.tiktok.com/@username         |
| \`tg@username\`       |    tg@username    |     telegram.org    | https://t.me/username                    |
| \`fa@username\`       |    fa@username    |   furaffinity.net   | https://furaffinity.net/user/username    |
| \`u@username\`        |    u@username     |      reddit.com     | https://reddit.com/u/username            |
| \`tw@username\`       |    tw@username    |      twitch.tv      | https://twitch.tv/username               |
| \`p@username\`        |    p@username     |     patreon.com     | https://patreon.com/username             |
| \`pi@username\`       |    pi@username    |      picarto.tv     | https://picarto.tv/username              |
| \`kf@username\`       |    kf@username    |      ko-fi.com      | https://ko-fi.com/username               |
| \`gr@username\`       |    gr@username    |     gumroad.com     | https://gumroad.com/username             |
| \`st@username\`       |    st@username    | subscribestar.adult | https://subscribestar.adult/username     |
| \`rf@username\`       |    rf@username    |    refsheet.net     | https://ref.st/username                  |
| \`pp@username\`       |    pp@username    |      paypal.me      | https://www.paypal.me/username           |
| \`fn@username\`       |    fn@username    |  furrynetwork.com   | https://www.furrynetwork.com/username    |
| \`w@username\`        |    w@username     |     weasyl.com      | https://www.weasyl.com/~username         |
| \`b@username\`        |    b@username     |      boosty.to      | https://boosty.to/username               |
| \`th@username\`       |    th@username    |      toyhou.se      | https://toyhou.se/username               |

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
< left-aligned text <
`.trim();