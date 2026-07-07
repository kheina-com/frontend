export interface ChatPortable {
	chat_id: number,
	title: string,
	members: number,
}

export interface Chat {
	chat_id: number,
	title: string,
	members: import("./user").User[],
}

export interface ChatLog {
	chat_id: number,
	messages: Message[],
}

export interface Message {
	message_id: string,
	user: import("./user").User,
	created: Date,
	content: string,
}
