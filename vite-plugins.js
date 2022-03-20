export default null;

export const minifyHtml = () => {
	return {
		name: 'html-transform',
		transformIndexHtml(html) {
			return html.replace(
				/[\t\r\n]/g, ''
			).replace(
				/<[^<>]+?'[^<>]+?'[^<>]*?>/g,
				match => match.replace(/([\w_-]+=)'(.+?)'/g, `$1"$2"`)
			);
		}
	};
}
