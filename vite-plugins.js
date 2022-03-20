export default null;

export const minifyHtml = () => {
	return {
		name: 'html-transform',
		transformIndexHtml(html) {
			return Array.from(
				html.replace(
					/[\t\r\n]/g, ''
				).matchAll(
					/<.+?'.+?'.*?>/g
				)
			).map(
				match => match[0].replace(/([\w_-]+=)'(.+?)'/g, `$1"$2"`)
			).join('');
		}
	};
}
