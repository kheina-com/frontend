export interface User {
	name: string,
	handle: string,
	privacy: "public" | "private",
	icon: string | null,
	verified: string,
	following: boolean,
}

export interface Badge {
	emoji: string;
	label: string;
}

export interface FullUser extends User {
	description: string | null,
	website: string | null,
	created: Date,
	banner: string | null,
	badges: Badge[],
}

export interface FullUserLike extends User {
	description: string | null,
	website: string | null,
	created: string | Date,
	banner: string | null,
	badges: Badge[],
}
