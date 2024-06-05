import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StorageService {

	private storage: any = {};

	constructor() { }

	setItem(key: string, value: any): void {
		this.storage[key] = value;
	}

	getItem(key: string): any {
		return this.storage[key];
	}

	removeItem(key: string): void {
		delete this.storage[key];
	}

	clear(): void {
		this.storage = {};
	}

	contain(key: string): boolean {
		return this.storage.hasOwnProperty(key);
	}
}
