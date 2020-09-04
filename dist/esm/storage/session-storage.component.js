import { Component } from 'rxcomp';
import { takeUntil } from 'rxjs/operators';
import SessionStorageService from './session-storage.service';
export default class SessionStorageComponent extends Component {
    constructor() {
        super(...arguments);
        this.active = false;
        this.items = [];
    }
    onInit() {
        this.items = SessionStorageService.toArray();
        SessionStorageService.items$.pipe(takeUntil(this.unsubscribe$)).subscribe(items => {
            this.items = items;
            this.pushChanges();
        });
    }
    onToggle() {
        this.active = !this.active;
        console.log('SessionStorageComponent.onToggle', this.active);
        this.pushChanges();
    }
    onClear() {
        SessionStorageService.clear();
    }
    onRemove(item) {
        SessionStorageService.delete(item.name);
    }
}
SessionStorageComponent.meta = {
    selector: 'session-storage-component',
    template: `
		<div class="rxc-block">
			<div class="rxc-head">
				<span class="rxc-head__title" (click)="onToggle()">
					<span *if="!active">+ sessionStorage</span>
					<span *if="active">- sessionStorage</span>
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
