import { DB, IDBWrap } from '../utilities/db';
import type { Emoji, EmojiLike } from '@/types/emoji';
import { host } from '@/config/constants';
import { khatch } from '.';
import fuzzysort from 'fuzzysort';

const emojiDbStore = "emoji";
const emojiDbIndex = "emoji";
const updatedDbStore = "latest";
const readonly = "readonly";
const readwrite = "readwrite";
const logstr = "[emoji]";

interface PreparedEmoji extends Emoji {
	_prepared: Fuzzysort.Prepared,
}

async function addEmoji(emoji: EmojiLike, store: IDBObjectStore): Promise<Emoji> {
	const e: PreparedEmoji = {
		...emoji,
		updated: new Date(emoji.updated),
		_prepared: fuzzysort.prepare(emoji.emoji),
	};
	await IDBWrap(store.put(e));
	return e;
}

class EmojiDB extends DB {
	async onUpgrade(req: IDBOpenDBRequest, e: IDBVersionChangeEvent): Promise<void> {
		console.debug(logstr, "db onupgradeneeded:", e);
		const db = req.result;

		if (!db.objectStoreNames.contains(emojiDbStore)) {
			const store = db.createObjectStore(emojiDbStore, { keyPath: "emoji" });
			store.createIndex(emojiDbIndex, emojiDbIndex, { unique: true });
		}

		if (!db.objectStoreNames.contains(updatedDbStore)) {
			db.createObjectStore(updatedDbStore, { keyPath: "updated" });
		}

		console.log(logstr, "created database.");
	}

	async onSuccess(req: IDBRequest<IDBDatabase>, e: Event, resolve: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void): Promise<void> {
		resolve(req.result);
	}

	async populate(database: IDBDatabase) {
		const latest = await new Promise<Date>(resolve => {
			const transaction = database.transaction([updatedDbStore], readonly);
			const store = transaction.objectStore(updatedDbStore);
			const req = store.getAll();

			req.onerror = () => resolve(new Date(0));
			req.onsuccess = () => {
				if (req.result.length) {
					return resolve(req.result[0].updated);
				}
				resolve(new Date(0));
			};
		});

		const newest = new Date();
		let count = 0;

		khatch(`${host}/v1/emojis/${latest.toISOString()}`, {
			handleError: true,
		}).then(
			r => r.json()
		).then(async (emojis: EmojiLike[]) => {
			const transaction = database.transaction([emojiDbStore], readwrite);
			const store = transaction.objectStore(emojiDbStore);

			for (const e of emojis) {
				await addEmoji(e, store)
					.then(() => count++);
			}

			if (count) transaction.commit();
			console.debug(logstr, "loaded", count, "emojis into db");
		}).then(async () => {
			const transaction = database.transaction([updatedDbStore], readwrite);
			const store = transaction.objectStore(updatedDbStore);
			store.clear();

			await IDBWrap(store.add({
				updated: newest,
			}));

			transaction.commit();
		});
	}
}

const db = new EmojiDB("emoji", 1);

export function LookupEmoji(emoji: string, limit: number = 100): Promise<Emoji[]> {
	const thr = 0.5;
	return new Promise<Emoji[]>(async (_resolve, reject) => {
		const req = (await db.transaction(readonly, [emojiDbStore]))
			.objectStore(emojiDbStore)
			.index(emojiDbIndex)
			.openCursor();

		const emojis: { score: number, value: Emoji; }[] = [];
		const resolve = (value: { score: number, value: Emoji; }[]): void =>
			_resolve(value.sort((a, b) => b.score - a.score).map(x => x.value));

		req.onerror = reject;
		req.onsuccess = (e: Event) => {
			const cur = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
			if (!cur) return resolve(emojis);

			const v: PreparedEmoji = cur.value;
			const result = fuzzysort.single(emoji, v._prepared);
			if (result && result.score >= thr) {
				emojis.push({ score: result.score, value: v });
				if (emojis.length >= limit) return resolve(emojis);
			}
			cur.continue();
		};
	});
}

const emojiCache: { [emoji: string]: null; } = {};
export function GetEmoji(emoji: string): Promise<Emoji> {
	return new Promise<Emoji>(async (resolve, reject) => {
		if (emojiCache.hasOwnProperty(emoji)) return reject();

		const store = (await db.transaction(readwrite, [emojiDbStore])).objectStore(emojiDbStore);
		const index = store.index(emojiDbIndex);

		const req: IDBRequest<PreparedEmoji> = index.get(emoji.toLowerCase());
		req.onerror = reject;
		req.onsuccess = () => {
			if (req.result) return resolve(req.result);

			khatch(`${host}/v1/emoji/${emoji}`, {
				errorHandlers: {
					404: () => {
						emojiCache[emoji] = null;
						reject();
					},
				},
			}).then(
				r => r.json()
			).then((r: EmojiLike) =>
				resolve(addEmoji(r, store))
			).catch(reject);
		};
	});
}

export async function GetAll(): Promise<Emoji[]> {
	const req: IDBRequest<PreparedEmoji[]> = (await db.transaction(readonly, [emojiDbStore]))
		.objectStore(emojiDbStore)
		.index(emojiDbIndex)
		.getAll();

	return IDBWrap(req);
}
