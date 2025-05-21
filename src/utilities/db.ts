import { Lock } from './async';

export abstract class DB {
	abstract onUpgrade(req: IDBOpenDBRequest, ev: IDBVersionChangeEvent): Promise<void>;
	abstract onSuccess(req: IDBRequest<IDBDatabase>, ev: Event, resolve: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void): Promise<void>;
	abstract populate(database: IDBDatabase): Promise<any>;

	private database: IDBDatabase | null = null;
	private loaded: boolean = false;
	private version: number;
	private name: string;
	private lock: Lock;

	constructor(name: string, version: number) {
		this.version = version;
		this.lock = new Lock();
		this.name = name;
		this.startup().then(
			this.populate
		).then(() =>
			console.debug("[" + name + "] successfully connected to db")
		);
	}

	async startup(): Promise<IDBDatabase> {
		const refId = await this.lock.Acquire();
		return new Promise<IDBDatabase>(async (res, rej) => {
			const self = this;
			const DBOpenRequest = indexedDB.open(this.name, this.version);
			DBOpenRequest.onupgradeneeded = async function (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
				self.database = DBOpenRequest.result;
				await self.onUpgrade(this, ev);
			};
			DBOpenRequest.onsuccess = async function (this: IDBRequest<IDBDatabase>, ev: Event) {
				self.database = DBOpenRequest.result;
				if (self.loaded) return res(self.database);
				await self.onSuccess(this, ev, res);
				self.loaded = true;
			};
			DBOpenRequest.onerror = DBOpenRequest.onblocked = () => {
				console.error("[" + this.name + "] failed to open database:", DBOpenRequest);
				rej();
			};
			console.debug("[" + this.name + "] opening database:", DBOpenRequest);
		}).finally(() =>
			this.lock.Release(refId)
		);
	}

	async transaction(mode: IDBTransactionMode, stores: string[]): Promise<IDBTransaction> {
		try {
			await this.lock.Free();
			if (!this.database) throw "";
			return this.database.transaction(stores, mode);
		}
		catch {
			const db: IDBDatabase = await this.startup();
			return db.transaction(stores, mode);
		}
	}
}

/**
 * wraps the given IDBRequest into an async-friendly promise
 * @param IDBRequest 
 * @returns request result
 */
export function IDBWrap<T>(req: IDBRequest<T>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		req.onerror = reject;
		req.onsuccess = () => resolve(req.result);
	});
}
