export interface Emoji {
	emoji:    string,
	alt:      string | null,
	owner:    User | null,
	post_id:  string | null,
	filename: string,
}
