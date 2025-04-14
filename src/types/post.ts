export interface Score {
	up: number,
	down: number,
	total: number,
	vote: number | null,
	user_vote: number | null,
}

export interface MediaType {
	file_type: string,
	mime_type: string,
}

export interface Size {
	width: number,
	height: number,
}

export interface Thumbnail {
	bounds: number,
	size: Size,
	type: MediaType,
	filename: string,
	length: number,
	url: string,
}

export interface Media {
	updated: Date,
	crc: number | null,
	filename: string,
	type: MediaType,
	size: Size,
	thumbhash: string,
	length: number,
	thumbnails: Thumbnail[],
	flags: 'animated' | 'video' | 'audio'[],
	url: string,
}

export interface Post {
	post_id: string,
	title: string | null,
	description: string | null,
	user: import("./user").User,
	score: Score | null,
	rating: "general" | "mature" | "explicit",
	parent_id: string | null,
	parent: Post | null | undefined,
	privacy: "public" | "unlisted" | "private" | "unpublished" | "draft",
	created: Date,
	updated: Date,
	media: Media | null,
	blocked: boolean,
	locked?: boolean,
	favorites: number | null,
	reposts: number | null,
	tags: import("./tag").Tags | null,
	replies: Post[] | null,
}

export interface MediaLike {
	updated: string | Date,
	crc: number | null,
	filename: string,
	type: MediaType,
	size: Size,
	thumbhash: string,
	length: number,
	thumbnails: Thumbnail[],
	flags: 'animated' | 'video' | 'audio'[],
	url: string,
}

/**
 * PostLike is used as the interface for posts coming from the api. this is due to timestamps being sent as strings. use ToPost to convert
 */
export interface PostLike {
	post_id: string,
	title: string | null,
	description: string | null,
	user: import("./user").User,
	score: Score | null,
	rating: "general" | "mature" | "explicit",
	parent_id: string | null,
	parent: PostLike | null | undefined,
	privacy: "public" | "unlisted" | "private" | "unpublished" | "draft",
	created: string | Date,
	updated: string | Date,
	media: MediaLike | null,
	blocked: boolean,
	locked?: boolean,
	favorites: number | null,
	reposts: number | null,
	tags: import("./tag").Tags | null,
	replies: PostLike[] | null | undefined,
}

export interface PostSet {
	set_id: string,
	owner: import("./user").User,
	count: number,
	title: string | null,
	description: string | null,
	privacy: "public" | "private",
	created: string | Date,
	updated: string | Date,
	first: PostLike | null,
	last: PostLike | null,
	neighbors: {
		index: number,
		before: PostLike[],
		after: PostLike[],
	},
}

export function ToPost(p: PostLike): Post {
	p.created = new Date(p.created);
	p.updated = new Date(p.updated);
	if (p.media) p.media.updated = new Date(p.media.updated);
	if (p.parent) p.parent = ToPost(p.parent);
	if (p.replies && p.replies.length) p.replies = p.replies.map(ToPost);
	return p as Post;
}
