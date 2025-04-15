export interface EmojiLike {
	emoji: string,
	alt: string | null,
	owner: import("./user").User | null,
	post_id: string | null,
	filename: string,
	url: string,
	updated: string | Date,
}

export interface Emoji {
	emoji: string,
	alt: string | null,
	owner: import("./user").User | null,
	post_id: string | null,
	filename: string,
	url: string,
	updated: Date,
	_prepared: Fuzzysort.Prepared,
}
