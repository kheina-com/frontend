export type Notification = InteractNotification | PostNotification | UserNotification;

export interface InteractNotification {
	type:    "interact",
	event:   "favorite" | "reply" | "repost",
	id:      string,
	created: Date,
	user:    import("./user").User,
	post:    import("./post").PostLike,
}

export interface PostNotification {
	type:    "post",
	event:   "mention" | "tagged",
	id:      string,
	created: Date,
	post:    import("./post").PostLike,
}

export interface UserNotification {
	type:    "user",
	event:   "follow",
	id:      string,
	created: Date,
	user:    import("./user").User,
}

export interface NotificationEvent {
	unread: number,
}