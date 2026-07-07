import { RefId } from '.';

interface CriticalPoint {
	refId: number,
	onRelease: Promise<void>,
	_release: { (): void; },
}

export class Lock {
	private _cp: CriticalPoint | null;

	constructor() {
		this._cp = null;
	}

	// Exec executes a function within the lock without needing to manage refids
	Exec<T>(func: (() => T | PromiseLike<T>)): Promise<T> {
		let refId: number;
		return this.acquire().then(
			_refId => refId = _refId
		).then(func).finally(() =>
			this.release(refId)
		);
	}

	private async acquire(): Promise<number> {
		const refId = RefId();
		do {
			const cp = this._cp;
			// cp === null: the critical point is up for grabs
			// cp.refId === this.refId: we have the critical point, so we should update the checkin time
			// cp.refId !== this.refId: we do not have the critical point
			if (!cp || cp.refId === refId) {
				// @ts-ignore
				let r: { (): void; } = null;
				// try to access the critical point
				this._cp = { refId, onRelease: new Promise(_r => r = _r), _release: r };
			} else {
				// critical point is populated, so wait until it is freed
				await cp.onRelease;
			}
		} while (this._cp?.refId !== refId);
		return refId;
	}

	private async release(refId: number): Promise<void> {
		const cp = this._cp;
		if (cp?.refId === refId) {
			// critical point belongs to us, so we can safely release it
			this._cp = null;
			cp._release();
		}
	}

	Free(): Promise<void> {
		const cp = this._cp;
		if (!cp) return new Promise(r => r());
		return cp.onRelease;
	}
}
