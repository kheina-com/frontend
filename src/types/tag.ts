export interface Tag {
	tag: string,
	owner: import("./user").User | null,
	group: string,
	deprecated: boolean,
	inherited_tags: string[],
	description: string | null,
	count: number,
}

export interface TagPortable {
	tag: string,
	owner: import("./user").User | null,
	group: string,
	count: number,
}

export interface Tags {
	artist?: null | TagPortable[],
	subject?: null | TagPortable[],
	species?: null | TagPortable[],
	gender?: null | TagPortable[],
	misc?: null | TagPortable[],
}
