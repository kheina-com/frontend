import { type Emoji } from './emoji';

interface ExpiringEmoji extends Emoji {
	expires: Date,
}

let db: IDBDatabase;
const dbName = "legacy-verified-users";
const dbStore = "verified_users";
const dbVersion = 1;

export function ConnectDb(): Promise<IDBDatabase> {
	// why use a promise instead of a normal async? so that we can resolve or reject on db connect
	return new Promise<IDBDatabase>((resolve, reject) => {
		// this logic should also be much easier because we don't need to populate anything (thank god)
		const DBOpenRequest = indexedDB.open(dbName, dbVersion);
		DBOpenRequest.onerror = DBOpenRequest.onblocked = () => {
			console.error("failed to connect database:", DBOpenRequest);
			return reject();
		};

		DBOpenRequest.onupgradeneeded = e => {
			console.debug("upgrading db:", e);
			db = DBOpenRequest.result;

			if (!db.objectStoreNames.contains(dbStore)) {
				const store = db.createObjectStore(dbStore, { keyPath: "emoji" });
				store.createIndex("user.name", "user.name", { unique: false });
				store.createIndex("user.screen_name", "user.screen_name", { unique: false });
				store.createIndex("time", "time", { unique: false });
				console.log("created history database.");
			}
		};

		DBOpenRequest.onsuccess = () => {
			db = DBOpenRequest.result;
			console.log("successfully connected to db");
			return resolve(db);
		};
	});
}

export function CacheEmoji(emoji: Emoji): Promise<void> {
	// @ts-ignore  // typescript is wrong here, this cannot return idb due to final throw
	return new Promise<void>((resolve, reject) => {
		
		const transaction = db.transaction([dbStore], "readwrite");
		transaction.onabort = transaction.onerror = reject;
		transaction.oncomplete = () => resolve();

		const store = transaction.objectStore(dbStore);
		const expiring: ExpiringEmoji = {
			...emoji,
			// 1 day expiration ig?
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
		};
		store.add(expiring);

		transaction.commit();
	}).catch(e =>
		// attempt to reconnect to the db
		ConnectDb().finally(() => {
			throw e; // re-throw error to retry
		}),
	);
}

export function FetchEmoji(emoji: string): Promise<Emoji | null> {
	// @ts-ignore  // typescript is wrong here, this cannot return idb due to final throw
	return new Promise<Emoji | null>(async (resolve, reject) => {
		const transaction = db.transaction([dbStore], "readonly");
		transaction.onabort = transaction.onerror = reject;
		const store = transaction.objectStore(dbStore);

		const result = await new Promise<Emoji | undefined>((res, rej) => {
			const req = store.get(emoji);
			req.onerror = rej;
			req.onsuccess = () => {
				res(req.result as ExpiringEmoji);
			};
		});

		if (result === undefined) return resolve(null);

		transaction.oncomplete = () => resolve(result);
		transaction.commit();
	}).catch(e =>
		// attempt to reconnect to the db
		ConnectDb().finally(() => {
			throw e; // re-throw error to retry
		}),
	);
}
