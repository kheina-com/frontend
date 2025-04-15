export interface UserAuth {
	token: string,
	version: string,
	algorithm: string,
	keyId: number,
	expires: Date,
	userId: number,
	guid: string,
	isMod: boolean,
	isAdmin: boolean,
	scope: string[],
}
