/// <reference types="vite/client"/>
// import 'pinia';
declare module 'click-outside-vue3';

interface ResizeDetails {
	offset: number,
}

interface User {
	name: string,
	handle: string,
	privacy: "public" | "private",
	icon: string | null,
	verified: string,
	following: boolean,
}

interface Badge {
	emoji: string;
	label: string;
}

interface FullUser extends User {
	description: string | null,
	website: string | null,
	created: string,
	banner: string | null,
	badges: Badge[],
}

interface Score {
	up: number,
	down: number,
	total: number,
	vote: number | null,
	user_vote: number | null,
}

interface MediaType {
	file_type: string,
	mime_type: string,
}

interface Size {
	width: number,
	height: number,
}

interface Media {
	post_id: string,
	crc: number | null,
	filename: string,
	url: string,
	type: MediaType,
	size: Size,
	thumbhash: string,
	updated: Date,
}

// this needs to match the fingerprint of the api:
interface Post {
	post_id: string,
	title: string | null,
	description: string | null,
	user: User,
	score: Score | null,
	rating: "general" | "mature" | "explicit",
	parent: string | null,
	privacy: "public" | "unlisted" | "private" | "unpublished" | "draft",
	created: Date,
	updated: Date,
	media: Media | null,
	blocked: boolean,
	favorites?: number,
	reposts?: number,
	replies?: Post[],
}

interface PostSet {
	set_id: string,
	owner: User,
	count: number,
	title: string | null,
	description: string | null,
	privacy: "public" | "private",
	created: string,
	updated: string,
	first: Post | null,
	last: Post | null,
	neighbors: {
		index: number,
		before: Post[],
		after: Post[],
	},
}

interface Tag {
	tag: string,
	owner: User | null,
	group: string,
	deprecated: boolean,
	inherited_tags: string[],
	description: string | null,
	count: number,
}

interface TagPortable {
	tag: string,
	owner: User | null,
	group: string,
	count: number,
}

interface Tags {
	artist?: null | TagPortable[],
	subject?: null | TagPortable[],
	species?: null | TagPortable[],
	gender?: null | TagPortable[],
	misc?: null | TagPortable[],
}
