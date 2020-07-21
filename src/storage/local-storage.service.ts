export default class LocalStorageService {

	static supported: boolean = false;

	static clear() {
		if (this.isLocalStorageSupported()) {
			localStorage.clear();
		}
	}

	static delete(name: string) {
		if (this.isLocalStorageSupported()) {
			localStorage.removeItem(name);
		}
	}

	static exist(name: string): boolean {
		if (this.isLocalStorageSupported()) {
			return localStorage.getItem(name) !== undefined;
		} else {
			return false;
		}
	}

	static get(name: string): any {
		let value = null;
		if (this.isLocalStorageSupported()) {
			try {
				const item = localStorage.getItem(name);
				if (item != null) {
					value = JSON.parse(item);
				}
			} catch (error) {
				console.log('LocalStorageService.get.error parsing', name, error);
			}
		}
		return value;
	}

	static set(name: string, value: any) {
		if (this.isLocalStorageSupported()) {
			try {
				const cache = new Map();
				const json = JSON.stringify(value, function (key, value) {
					if (typeof value === 'object' && value !== null) {
						if (cache.has(value)) {
							// Circular reference found, discard key
							return;
						}
						cache.set(value, true);
					}
					return value;
				});
				localStorage.setItem(name, json);
			} catch (error) {
				console.log('LocalStorageService.set.error serializing', name, value, error);
			}
		}
	}

	static isLocalStorageSupported(): boolean {
		if (this.supported) {
			return true;
		}
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
	}
}
