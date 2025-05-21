import { DB, IDBWrap } from '../utilities/db';
import { getCookie, deleteCookie } from '../utilities';

const dbStore = "configs";
const dbIndex = "configs";
const readonly = "readonly";
const readwrite = "readwrite";

export const [Cookies, Theme, Accent, AnimatedAccents, CssTransitions, Tiles, MaxRating, FontFamily] = ["cookies", "theme", "accent", "animated-accents", "css-transitions", "search-results-tiles", "max-rating", "font-family"];

interface Config {
	key: string,
	value: any,
}

class ConfigDB extends DB {
	async onUpgrade(req: IDBOpenDBRequest, _: IDBVersionChangeEvent): Promise<void> {
		const db = req.result;
		if (!db.objectStoreNames.contains(dbStore)) {
			const store = db.createObjectStore(dbStore, { keyPath: "key" });
			store.createIndex(dbIndex, "key", { unique: true });
		}
	}

	async onSuccess(req: IDBRequest<IDBDatabase>, _: Event, resolve: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void): Promise<void> {
		resolve(req.result);
	}

	async populate(database: IDBDatabase) {
		const transaction = database.transaction([dbStore], readwrite);
		const store = transaction.objectStore(dbStore);
		for (const c of [Cookies, Theme, Accent, AnimatedAccents, CssTransitions, Tiles, MaxRating]) {
			const v = getCookie(c);
			if (v === null || v === undefined) continue;

			await IDBWrap(store.put({
				key: c,
				value: v,
			} as Config));
			deleteCookie(c);
		}
		transaction.commit();
	}
}

const db = new ConfigDB("configs", 1);

export async function GetConfig(key: string, default_value: any = undefined, type: string | null = null): Promise<any> {
	const store = (await db.transaction(readonly, [dbStore])).objectStore(dbStore);
	const value = (await IDBWrap(store.get(key)))?.value;
	if (value === undefined) return default_value;

	switch (type) {
	case "boolean":
		return typeof (value) === "string" ? "false" !== value : Boolean(value);
	case "number":
		return typeof (value) === "string" ? parseFloat(value) : Number(value);
	default:
		return value;
	}
}

/**
 * retrieves all configs provided
 * @param keys mapping of key: default
 * @returns a populated map of { key: value }. all provided keys will always be populated.
 */
export async function GetConfigs(keys: { [k: string]: any; }): Promise<any> {
	const store = (await db.transaction(readonly, [dbStore])).objectStore(dbStore);
	(await IDBWrap(store.getAll())).forEach((config: Config) => {
		if (!keys.hasOwnProperty(config.key)) return;
		keys[config.key] = config.value;
	});

	return keys;
}

export async function SetConfig(key: string, value: any): Promise<void> {
	const store = (await db.transaction(readwrite, [dbStore])).objectStore(dbStore);
	await IDBWrap(store.put({ key, value } as Config));
}
