import { Component, IFactoryMeta } from 'rxcomp';
import { takeUntil } from 'rxjs/operators';
import LocalStorageService from './local-storage.service';
import { IStorageItem } from './storage.service';

export default class LocalStorageComponent extends Component {

	active: boolean = false;
	items: IStorageItem[] = [];

	onInit() {
		this.items = LocalStorageService.toArray();
		LocalStorageService.items$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(items => {
			this.items = items;
			this.pushChanges();
		});
	}

	onToggle() {
		this.active = !this.active;
		this.pushChanges();
	}

	onClear() {
		LocalStorageService.clear();
	}

	onRemove(item: IStorageItem) {
		LocalStorageService.delete(item.name);
	}

	static meta: IFactoryMeta = {
		selector: 'local-storage-component',
		template: `
		<div class="rxc-block">
			<div class="rxc-head">
				<span class="rxc-head__title" (click)="onToggle()">
					<span *if="!active">+ localStorage</span>
					<span *if="active">- localStorage</span>
					<span [innerHTML]="' {' + items.length + ')'"></span>
				</span>
				<span class="rxc-head__remove" (click)="onClear()">x</span>
			</div>
			<ul class="rxc-list" *if="active">
				<li class="rxc-list__item" *for="let item of items">
					<span class="rxc-list__name" [innerHTML]="item.name"></span>
					<span class="rxc-list__value" [innerHTML]="item.value | json"></span>
					<span class="rxc-list__remove" (click)="onRemove(item)">x</span>
				</li>
			</ul>
		</div>`,
	};
}
