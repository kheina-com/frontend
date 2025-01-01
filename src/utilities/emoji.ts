import { host } from '@/config/constants';
import { khatch, RefId } from '.';
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

let _cp: { time: number, refId: number, onRelease: Promise<void>, _release: { (): void; }; } | null = null;
const interval = 1000;

async function getCriticalPoint(refId: number) {
	let cpRefId: number | null = null;
	let sleep: number = 5;
	do {
		const cp = _cp;
		// cp === null: the critical point is up for grabs
		// cp.refId === this.refId: we have the critical point, so we should update the checkin time
		// cp.refId !== this.refId: we do not have the critical point
		// 	cp.refId !== this.refId && cp.time > now: another tab is running the consumer and is active
		// 	cp.refId !== this.refId && cp.time <= now: another tab is running the consumer and is inactive
		if (!cp || cp.refId === refId || cp.time <= new Date().valueOf()) {
			// @ts-ignore
			let r: { (): void; } = null;
			// try to access the critical point
			_cp = { refId, time: new Date().valueOf() + interval * 1.5, onRelease: new Promise(_r => r = _r), _release: r };
			await new Promise(r => setTimeout(r, 1)); // wait a second to make sure any other sets have resolved
			cpRefId = _cp?.refId;
		} else {
			// sleep for a little bit to let the other tab(s) release the critical point
			await new Promise(r => setTimeout(r, sleep));
			sleep = Math.min(sleep ** 2, interval);
		}
	} while (cpRefId !== refId);
}

async function releaseCriticalPoint(refId: number) {
	const cp = _cp;
	if (cp?.refId === refId && cp.time > new Date().valueOf()) {
		// critical point belongs to us, so we can safely release it
		_cp = null;
		cp._release();
	}
}

function transaction(mode: IDBTransactionMode): Promise<IDBTransaction> {
	return new Promise<IDBTransaction>(async r => {
		try {
			const cp = _cp;
			if (cp) {
				await cp.onRelease;
			}
			r(emojiDb.transaction([emojiDbStore], mode));
		}
		catch {
			await PopulateEmojiDb().then(db =>
				r(db.transaction([emojiDbStore], mode))
			);
		}
	});
}

function addEmoji(emoji: Emoji, store: IDBObjectStore): Promise<void> {
	emoji.updated = new Date(emoji.updated);
	// @ts-ignore
	emoji._prepared = fuzzysort.prepare(emoji.emoji);
	return new Promise<void>((resolve, reject) => {
		const req = store.put(emoji);
		req.onerror = err => {
			console.log("req:", req);
			console.log("emoji:", emoji);
			reject(err);
		};
		req.onsuccess = () => resolve();
	});
}

export function PopulateEmojiDb(): Promise<IDBDatabase> {
	const refId = RefId();
	return new Promise<IDBDatabase>(async res => {
		await getCriticalPoint(refId);
		const DBOpenRequest = indexedDB.open(emojiDbName, emojiDbVersion);

		DBOpenRequest.onerror = DBOpenRequest.onblocked = () => {
			console.error("failed to open emoji database:", DBOpenRequest);
		};

		DBOpenRequest.onupgradeneeded = e => {
			console.debug("emoji db onupgradeneeded:", e);
			emojiDb = DBOpenRequest.result;

			if (!emojiDb.objectStoreNames.contains(emojiDbStore)) {
				const store = emojiDb.createObjectStore(emojiDbStore, { keyPath: "emoji" });
				store.createIndex(emojiDbIndex, emojiDbIndex, { unique: true });
			}

			if (!emojiDb.objectStoreNames.contains(updatedDbStore)) {
				emojiDb.createObjectStore(updatedDbStore, { keyPath: "updated" });
			}

			console.log("created emoji database.");
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
			).then(async (emojis: Emoji[]) => {
				const transaction = emojiDb.transaction([emojiDbStore], readwrite);
				const store = transaction.objectStore(emojiDbStore);

				for (const e of emojis) {
					await addEmoji(e, store)
						.then(() => count++);
				}

				if (count) transaction.commit();
				console.debug("loaded", count, "emojis into db");
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
			console.debug("successfully connected to emoji db");
		};
		console.debug("opening emoji database:", DBOpenRequest);
	}).finally(() => releaseCriticalPoint(refId));
}

export function LookupEmoji(emoji: string): Promise<Emoji[]> {
	const lim = 100;
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
		req.onsuccess = e => {
			const cur = (e.target as IDBRequest).result;
			if (!cur) return resolve(emojis);

			const result = fuzzysort.single(emoji, cur.value._prepared);
			if (result && result.score >= thr) {
				emojis.push({ score: result.score, value: cur.value });
				if (emojis.length >= lim) resolve(emojis);
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
