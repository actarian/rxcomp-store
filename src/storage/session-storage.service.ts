export default class SessionStorageService {

	static supported: boolean = false;

	static clear() {
		if (this.isSessionStorageSupported()) {
			sessionStorage.clear();
		}
	}

	static delete(name: string) {
		if (this.isSessionStorageSupported()) {
			sessionStorage.removeItem(name);
		}
	}

	static exist(name: string): boolean {
		if (this.isSessionStorageSupported()) {
			return sessionStorage.getItem(name) !== undefined;
		} else {
			return false;
		}
	}

	static get(name: string): any {
		let value = null;
		if (this.isSessionStorageSupported()) {
			try {
				const item = sessionStorage.getItem(name);
				if (item != null) {
					value = JSON.parse(item);
				}
			} catch (error) {
				console.log('SessionStorageService.get.error parsing', name, error);
			}
		}
		return value;
	}

	static set(name: string, value: any) {
		if (this.isSessionStorageSupported()) {
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
				sessionStorage.setItem(name, json);
			} catch (error) {
				console.log('SessionStorageService.set.error serializing', name, value, error);
			}
		}
	}

	static isSessionStorageSupported(): boolean {
		if (this.supported) {
			return true;
		}
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
	}
}
