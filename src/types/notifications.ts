import type { User } from './user';

export type Notification = InteractNotification | PostNotification | UserNotification;

export interface InteractNotification {
	type: "interact",
	event: "favorite" | "reply" | "repost",
	user: User,
	post: Post,
}

export interface PostNotification {
	type: "post",
	event: "mention" | "tagged",
	post: Post,
}

export interface UserNotification {
	type: "user",
	event: "follow",
	user: User,
}
