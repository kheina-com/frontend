import { Lock } from './async';
import type { Emoji, EmojiLike } from '@/types/emoji';
import { host } from '@/config/constants';
import { khatch } from '.';
import fuzzysort from 'fuzzysort';

let emojiDb: IDBDatabase;
// used so we don't load the db twice
let emojiDbLoaded: boolean = false;

const emojiDbVersion = 1;
const emojiDbName = "emoji";
const emojiDbStore = "emoji";
const emojiDbIndex = "emoji";
const updatedDbStore = "latest";
const readonly = "readonly";
const readwrite = "readwrite";
const lock = new Lock();

function transaction(mode: IDBTransactionMode): Promise<IDBTransaction> {
	return new Promise<IDBTransaction>(async r => {
		try {
			// the critical point is so that we don't do anything while PopulateEmojiDb is running
			await lock.Free();
			r(emojiDb.transaction([emojiDbStore], mode));
		}
		catch {
			await PopulateEmojiDb().then(db =>
				r(db.transaction([emojiDbStore], mode))
			);
		}
	});
}

function addEmoji(emoji: EmojiLike, store: IDBObjectStore): Promise<void> {
	const e: Emoji = {
		...emoji,
		updated: new Date(emoji.updated),
		_prepared: fuzzysort.prepare(emoji.emoji),
	};
	return new Promise<void>((resolve, reject) => {
		const req = store.put(e);
		req.onerror = err => {
			console.log("req:", req);
			console.log("emoji:", e);
			reject(err);
		};
		req.onsuccess = () => resolve();
	});
}

export async function PopulateEmojiDb(): Promise<IDBDatabase> {
	const refId = await lock.Acquire();
	return new Promise<IDBDatabase>(async res => {
		const DBOpenRequest = indexedDB.open(emojiDbName, emojiDbVersion);
		DBOpenRequest.onerror = DBOpenRequest.onblocked = () => {
			console.error("[emoji] failed to open database:", DBOpenRequest);
		};

		DBOpenRequest.onupgradeneeded = e => {
			console.debug("[emoji] db onupgradeneeded:", e);
			emojiDb = DBOpenRequest.result;

			if (!emojiDb.objectStoreNames.contains(emojiDbStore)) {
				const store = emojiDb.createObjectStore(emojiDbStore, { keyPath: "emoji" });
				store.createIndex(emojiDbIndex, emojiDbIndex, { unique: true });
			}

			if (!emojiDb.objectStoreNames.contains(updatedDbStore)) {
				emojiDb.createObjectStore(updatedDbStore, { keyPath: "updated" });
			}

			console.log("[emoji] created database.");
		};

		DBOpenRequest.onsuccess = async () => {
			emojiDb = DBOpenRequest.result;
			if (emojiDbLoaded) return res(emojiDb);

			const latest = await new Promise<Date>(resolve => {
				const transaction = emojiDb.transaction([updatedDbStore], readonly);
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
				const transaction = emojiDb.transaction([emojiDbStore], readwrite);
				const store = transaction.objectStore(emojiDbStore);

				for (const e of emojis) {
					await addEmoji(e, store)
						.then(() => count++);
				}

				if (count) transaction.commit();
				console.debug("[emojis] loaded", count, "emojis into db");
			}).then(async () => {
				const transaction = emojiDb.transaction([updatedDbStore], readwrite);
				const store = transaction.objectStore(updatedDbStore);
				store.clear();

				await new Promise<Event>((resolve, reject) => {
					const req = store.add({
						updated: newest,
					});
					req.onerror = reject;
					req.onsuccess = resolve;
				});

				transaction.commit();
			});

			res(emojiDb);
			console.debug("[emoji] successfully connected to db");
		};
		console.debug("[emoji] opening database:", DBOpenRequest);
	}).finally(() => lock.Release(refId));
}

export function LookupEmoji(emoji: string, limit: number = 100): Promise<Emoji[]> {
	const thr = 0.5;
	return new Promise<Emoji[]>(async (_resolve, reject) => {
		const req = (await transaction(readonly))
			.objectStore(emojiDbStore)
			.index(emojiDbIndex)
			.openCursor();

		const emojis: { score: number, value: Emoji; }[] = [];
		const resolve = (value: { score: number, value: Emoji; }[]): void => {
			_resolve(value.sort((a, b) => b.score - a.score).map(x => x.value));
		};

		req.onerror = reject;
		req.onsuccess = (e: Event) => {
			const cur = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
			if (!cur) return resolve(emojis);

			const result = fuzzysort.single(emoji, cur.value._prepared);
			if (result && result.score >= thr) {
				emojis.push({ score: result.score, value: cur.value });
				if (emojis.length >= limit) resolve(emojis);
				else cur.continue();
			}
			else {
				cur.continue();
			}
		};
	});
}

const emojiCache: { [emoji: string]: null; } = {};
export function GetEmoji(emoji: string): Promise<Emoji> {
	return new Promise<Emoji>(async (resolve, reject) => {
		if (emojiCache.hasOwnProperty(emoji)) return reject();

		const store = (await transaction(readwrite)).objectStore(emojiDbStore);
		const index = store.index(emojiDbIndex);

		const req = index.get(emoji.toLowerCase());
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
			).then(r => {
				addEmoji(r, store);
				resolve(r);
			}).catch(reject);
		};
	});
}

export function GetAll(): Promise<Emoji[]> {
	return new Promise<Emoji[]>(async (resolve, reject) => {
		const req = (await transaction(readonly))
			.objectStore(emojiDbStore)
			.index(emojiDbIndex)
			.getAll();

		req.onerror = reject;
		req.onsuccess = () => {
			resolve(req.result);
		};
	});
}
