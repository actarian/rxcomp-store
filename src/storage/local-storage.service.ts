import { ReplaySubject } from "rxjs";
import StorageService, { IStorageItem } from "./storage.service";

export default class LocalStorageService extends StorageService {
	static items$: ReplaySubject<IStorageItem[]> = new ReplaySubject(1);
	static clear(): void {
		if (this.isSupported()) {
			localStorage.clear();
			this.items$.next(this.toArray());
		}
	}
	static delete(name: string): void {
		if (this.isSupported()) {
			localStorage.removeItem(name);
			this.items$.next(this.toArray());
		}
	}
	static exist(name: string): boolean {
		if (this.isSupported()) {
			return localStorage.getItem(name) !== undefined;
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
			value = localStorage.getItem(name);
		}
		return value;
	}
	static setRaw(name: string, value: string | null): void {
		if (value && this.isSupported()) {
			localStorage.setItem(name, value);
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
			return Object.keys(localStorage).map(key => {
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
		return StorageService.isSupported('localStorage');
		/*
		let supported = false;
		try {
			supported = 'localStorage' in window && localStorage !== null;
			if (supported) {
				localStorage.setItem('test', '1');
				localStorage.removeItem('test');
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
