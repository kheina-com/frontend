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

interface Thumbnail {
	post_id: string,
	bounds: number,
	size: Size,
	type: MediaType,
	filename: string,
	length: number,
	url: string,
}

interface Media {
	post_id: string,
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

// this needs to match the fingerprint of the api:
interface Post {
	post_id: string,
	title: string | null,
	description: string | null,
	user: User,
	score: Score | null,
	rating: "general" | "mature" | "explicit",
	parent_id: string | null,
	parent: Post | null | undefined,
	privacy: "public" | "unlisted" | "private" | "unpublished" | "draft",
	created: Date,
	updated: Date,
	media: Media | null,
	blocked: boolean,
	favorites: number | null,
	reposts: number | null,
	tags: Tags | null,
	replies: Post[] | null,
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

interface Emoji {
	emoji: string,
	alt: string | null,
	owner: User | null,
	post_id: string | null,
	filename: string,
	url: string,
	updated: Date,
}
