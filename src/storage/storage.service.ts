import { decodeJson, encodeJson, isPlatformBrowser, Serializer } from 'rxcomp';

export interface IStorageItem {
	name: string;
	value: any;
}

export function encodeBase64(value: any): string | undefined {
	let encoded: string | undefined;
	try {
		encoded = isPlatformBrowser ? btoa(value) : Buffer.from(value).toString('base64');
	} catch (error) {
		encoded = typeof value === 'string' ? value : undefined;
	}
	return encoded;
}

export function decodeBase64(value: string): any {
	let decoded: any;
	try {
		decoded = isPlatformBrowser ? atob(value) : Buffer.from(value, 'base64').toString();
	} catch (error) {
		decoded = typeof value === 'string' ? value : undefined;
	}
	return decoded;
}

export default class StorageService {

	static supported: boolean = false;

	static encode(decoded: any): string | null {
		let encoded: string | null = Serializer.encode(decoded, [encodeJson, encodeURIComponent, encodeBase64]) || null;
		return encoded;
	}

	static decode(encoded: string | null): any {
		let decoded: any = Serializer.decode(encoded, [decodeBase64, decodeURIComponent, decodeJson]);
		return decoded;
	}

	static isSupported(type: 'localStorage' | 'sessionStorage'): boolean {
		let flag: boolean = false;
		let storage;
		try {
			storage = window[type];
			const x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			flag = true;
		} catch (error) {
			flag = error instanceof DOMException && (
				// everything except Firefox
				error.code === 22 ||
				// Firefox
				error.code === 1014 ||
				// test name field too, because code might not be present
				// everything except Firefox
				error.name === 'QuotaExceededError' ||
				// Firefox
				error.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
				// acknowledge QuotaExceededError only if there's something already stored
				Boolean(storage && storage.length !== 0);
		}
		return flag;
	}
}
