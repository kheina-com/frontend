import { Lock } from './async';
import type { InteractNotification, Notification, NotificationEvent, UserNotification } from '@/types/notifications';
import { host } from '@/config/constants';
import globals from '@/globals';
import { khatch } from '.';
import type { User } from '@/types/user';
import { toRaw } from 'vue';

let db: IDBDatabase;
const notificationsDbVersion = 1;
const notificationsDbName = "notifications";
const notificationsDbStore = "notifications";
const notificationsDbIndex = "notifications";
const userDbIndex = "user";
const postDbIndex = "post";
const unreadDbStore = "unread";
const readonly = "readonly";
const readwrite = "readwrite";
const logstr = "[notifications DB]";
const lock = new Lock();

interface Unread {
	userId: number,
	latest: Date,
	unread: number,
}

function transaction(mode: IDBTransactionMode, stores: string[] = [notificationsDbStore]): Promise<IDBTransaction> {
	return new Promise<IDBTransaction>(async r => {
		try {
			// the critical point is so that we don't do anything while PopulateEmojiDb is running
			await lock.Free();
			r(db.transaction(stores, mode));
		}
		catch {
			await startupDb().then(db =>
				r(db.transaction(stores, mode))
			);
		}
	});
}

export async function AddNotification(notification: Notification) {
	const userId: number | void = globals().auth?.userId;
	if (!userId) throw "user not signed in or auth data unavailable";

	const tx = (await transaction(readwrite, [
		notificationsDbStore,
		unreadDbStore,
	]));
	await addNotification(notification, tx.objectStore(notificationsDbStore));
	const store = tx.objectStore(unreadDbStore);
	const unreads: Unread = {
		userId,
		unread: 1,
		latest: notification.created,
	};

	await new Promise<void>((resolve, reject) => {
		const req: IDBRequest<Unread | void> = store.get(userId);
		const set = () => {
			const r = store.put(unreads);
			r.onerror = reject;
			r.onsuccess = () => resolve();
		};

		req.onerror = set;
		req.onsuccess = () => {
			if (req.result) unreads.unread = req.result.unread + 1;
			set();
		};
	});
	document.dispatchEvent(new CustomEvent<NotificationEvent>("notification", { detail: { unread: unreads.unread } }));
}

function addNotification(notification: Notification, store: IDBObjectStore): Promise<void> {
	notification.created = new Date(notification.created);
	return new Promise<void>((resolve, reject) => {
		const req = store.put(notification);
		req.onerror = err => {
			console.debug(logstr, "req:", req);
			console.debug(logstr, "notification:", notification);
			reject(err);
		};
		req.onsuccess = () => resolve();
	});
}

function startupDb(): Promise<IDBDatabase> {
	return new Promise<IDBDatabase>(async res => {
		const DBOpenRequest = indexedDB.open(notificationsDbName, notificationsDbVersion);

		DBOpenRequest.onerror = DBOpenRequest.onblocked = () => {
			console.error(logstr, "failed to open database:", DBOpenRequest);
		};

		DBOpenRequest.onupgradeneeded = e => {
			console.debug(logstr, "db onupgradeneeded:", e);
			db = DBOpenRequest.result;

			if (!db.objectStoreNames.contains(notificationsDbStore)) {
				const store = db.createObjectStore(notificationsDbStore, { keyPath: "id" });
				store.createIndex(notificationsDbIndex, "id", { unique: true });
				store.createIndex(userDbIndex, "user.handle");
				store.createIndex(postDbIndex, "post.post_id");
			}

			if (!db.objectStoreNames.contains(unreadDbStore)) {
				db.createObjectStore(unreadDbStore, { keyPath: "userId" });
			}

			console.log(logstr, "created database.");
		};

		DBOpenRequest.onsuccess = () => {
			db = DBOpenRequest.result;
			res(db);
		};
		console.debug(logstr, "opening database:", DBOpenRequest);
	});
}

export async function PopulateNotificationsDb(): Promise<number> {
	const userId: number | void = globals().auth?.userId;
	if (!userId) throw "user not signed in or auth data unavailable";

	const refId = await lock.Acquire();
	return new Promise<number>(async resolve => {
		startupDb().then(async () => {
			let count = 0;
			let unread = 0;

			khatch(`${host}/v1/notifications`, {
				handleError: true,
			}).then(
				r => r.json()
			).then(async (notifications: Notification[]) => {
				const transaction = db.transaction([notificationsDbStore, unreadDbStore], readwrite);
				const store = transaction.objectStore(notificationsDbStore);
				const latest = await new Promise<Date>(res => {
					const req: IDBRequest<Unread | void> = transaction.objectStore(unreadDbStore).get(userId);
					req.onerror = () => res(new Date(0));
					req.onsuccess = () => {
						if (!req.result) return res(new Date(0));
						unread = req.result.unread;
						res(req.result.latest);
					};
				});

				for (const n of notifications) {
					n.created = new Date(n.created);
					await addNotification(n, store);
					if (n.created > latest) unread++;
					count++;
				}

				if (count) transaction.commit();
				console.debug(logstr, "loaded", count, "notifications into db.", unread, "unread");
			}).finally(() => {
				resolve(unread);
				document.dispatchEvent(new CustomEvent<NotificationEvent>("notification", { detail: { unread } }));
			});

			console.debug(logstr, "successfully connected to db");
		});
	}).finally(() => lock.Release(refId));
}

export function GetNotifications(): Promise<Notification[]> {
	return new Promise<Notification[]>(async (resolve, reject) => {
		const store = (await transaction(readonly)).objectStore(notificationsDbStore);
		const index = store.index(notificationsDbIndex);
		const req: IDBRequest<Notification[]> = index.getAll();

		req.onerror = reject;
		req.onsuccess = () => resolve(
			req.result.sort(
				(a: Notification, b: Notification) =>
					b.created.valueOf() - a.created.valueOf()
			)
		);
	});
}

export function ClearNotifications(): Promise<void> {
	return new Promise<void>(async (resolve, reject) => {
		const store = (await transaction(readwrite)).objectStore(notificationsDbStore);
		const req = store.clear();
		req.onerror = reject;
		req.onsuccess = () => {
			resolve();
			document.dispatchEvent(new CustomEvent<NotificationEvent>("notification", { detail: { unread: 0 } }));
		};
	});
}

export async function GetUnreads(): Promise<number> {
	const userId: number | void = globals().auth?.userId;
	if (!userId) throw "user not signed in or auth data unavailable";

	return new Promise<number>(async (resolve, reject) => {
		const req: IDBRequest<Unread | void> = (await transaction(readwrite, [unreadDbStore]))
			.objectStore(unreadDbStore)
			.get(userId);

		req.onerror = reject;
		req.onsuccess = () => resolve(req.result ? req.result.unread : 0);
	});
}

export async function ClearUnreads(): Promise<void> {
	const userId: number | void = globals().auth?.userId;
	if (!userId) throw "user not signed in or auth data unavailable";

	return await new Promise<void>(async (resolve, reject) => {
		const store = (await transaction(readwrite, [unreadDbStore])).objectStore(unreadDbStore);
		const req: IDBRequest<Unread | void> = store.get(userId);

		const unreads: Unread = {
			userId,
			unread: 0,
			latest: new Date(0),
		};
		const set = () => {
			const r = store.put(unreads);
			r.onerror = reject;
			r.onsuccess = () => resolve();
			document.dispatchEvent(new CustomEvent<NotificationEvent>("notification", { detail: { unread: unreads.unread } }));
		};

		req.onerror = set;
		req.onsuccess = () => {
			if (req.result) unreads.latest = req.result.latest;
			set();
		};
	});
}

export async function UpdateUserNotifications(user: User): Promise<void> {
	const userId: number | void = globals().auth?.userId;
	if (!userId) throw "user not signed in or auth data unavailable";

	return await new Promise<void>(async (resolve, reject) => {
		const store = (await transaction(readwrite)).objectStore(notificationsDbStore);
		const req: IDBRequest<IDBCursorWithValue | null> = store.index(userDbIndex)
			.openCursor(user.handle);

		req.onerror = reject;
		req.onsuccess = (e: Event) => {
			const cur = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
			if (!cur) return resolve();

			const value: InteractNotification | UserNotification = {
				...cur.value,
				user: toRaw(user),
			};
			store.put(value);
			cur.continue();
		};
	});
}
