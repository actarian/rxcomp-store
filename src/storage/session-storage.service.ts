import { ReplaySubject } from "rxjs";
import StorageService, { IStorageItem } from "./storage.service";

export default class SessionStorageService extends StorageService {

	static items$: ReplaySubject<IStorageItem[]> = new ReplaySubject(1);

	static clear(): void {
		if (this.isSupported()) {
			sessionStorage.clear();
			this.items$.next(this.toArray());
		}
	}

	static delete(name: string): void {
		if (this.isSupported()) {
			sessionStorage.removeItem(name);
			this.items$.next(this.toArray());
		}
	}

	static exist(name: string): boolean {
		if (this.isSupported()) {
			return sessionStorage.getItem(name) !== undefined;
		} else {
			return false;
		}
	}

	static get(name: string): any {
		return this.decode(this.getRaw(name));
	}

	static set(name: string, value: any): void {
		this.setRaw(name, this.encode(value));
	}

	static getRaw(name: string): string | null {
		let value = null;
		if (this.isSupported()) {
			value = sessionStorage.getItem(name);
		}
		return value;
	}

	static setRaw(name: string, value: string | null): void {
		if (value && this.isSupported()) {
			sessionStorage.setItem(name, value);
			this.items$.next(this.toArray());
		}
	}

	static toArray(): IStorageItem[] {
		return this.toRawArray().map(x => {
			x.value = this.decode(x.value);
			return x;
		});
	}

	static toRawArray(): IStorageItem[] {
		if (this.isSupported()) {
			return Object.keys(sessionStorage).map(key => {
				return {
					name: key,
					value: this.getRaw(key),
				};
			});
		} else {
			return [];
		}
	}

	static isSupported(): boolean {
		if (this.supported) {
			return true;
		}
		return StorageService.isSupported('sessionStorage');
		/*
		let supported = false;
		try {
			supported = 'sessionStorage' in window && sessionStorage !== null;
			if (supported) {
				sessionStorage.setItem('test', '1');
				sessionStorage.removeItem('test');
			} else {
				supported = false;
			}
		} catch (error) {
			supported = false;
		}
		this.supported = supported;
		return supported;
		*/
	}
}
