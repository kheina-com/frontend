export default {
	/// the str for translation strings is below:
	/// translation_key: {
	/// 	str: string,
	/// 	arg: {
	/// 		key: "value",
	/// 	},
	/// }
	///
	/// args are not present for all translation strings, however, for those that are they are used like below:
	/// ex: "accept_mature": {
	/// 	str: "this post contains <b>{rating}</b> content, click here to show it anyway.",
	/// 	rating: {
	/// 		general:  "general",
	/// 		mature:   "mature",
	/// 		explicit: "explicit",
	/// 	},
	/// }
	///
	/// when an arg is used post-translation, it must still be represented using {format} syntax:
	/// ex: "post_will_live[location]": {
	/// 	str: "Your post will be live at {location}",
	/// }
	accept_mature: {
		str: "this post contains <b>{rating}</b> content, click here to show it anyway.",
	},
	accept_mature_short: {
		str: "this post is <b>{rating}</b>, click to show.",
	},
	post_is_live: {
		str: "Your post is live at",
	},
	post_will_live: {
		str: "Your post will be live at",
	},
	funding: {
		str: "funding",
	},
	support_project: {
		str: "support the project",
	},
	view_source: {
		str: "view source code",
	},
	found_bug: {
		str: "Found a bug?",
	},
	report_here: {
		str: "Report it here",
	},
	handle_is_admin: {
		str: "@{handle} is an admin",
	},
};
