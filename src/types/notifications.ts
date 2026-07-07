export type Notification = InteractNotification | PostNotification | UserNotification | ChatNotification;

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

export interface ChatNotification {
	type:    "chat",
	event:   "new" | "mention" | "new_chat",
	id:      string,
	created: Date,
	message: {
		message_id: string,
		user:       import("./user").User,
		created:    Date,
		content:    string,
		chat_id:    number,
	},
}

export interface NotificationEvent {
	notification?: Notification,
	unread:        number,
}
