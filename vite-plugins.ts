export default null;

export const minifyHtml = () => {
	return {
		name: "html-transform",
		transformIndexHtml(html: string) {
			return html.replace(
				// remove formatting/tabbing
				/[\t\r\n]/g, ""
			).replace(
				// replace single ticks within tags with proper double ticks
				/<[^<>]+?'[^<>]+?'[^<>]*?>/g,
				match => match.replace(/([\w_-]+=)'(.+?)'/g, `$1"$2"`)
			).replace(
				// remove trailing semicolons that are unnecessary
				/\;\}/g, "}"
			).replace(
				// replace unnecessary whitespace
				// gotta be real careful about this one, in case there are any commas in the text
				/\s*(\{|\}|,|:)\s*/g, "$1"
			).replace(
				// do one final pass for any misc whitespace between tags
				/>\s+</g, "><"
			);
		},
	};
};
