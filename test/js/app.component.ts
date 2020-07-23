import { Component, getContext, IFactoryMeta } from 'rxcomp';
import { first, takeUntil } from 'rxjs/operators';
import { LocalStorageService, SessionStorageService } from '../../dist/cjs/rxcomp-store';
import { CookieStorageService } from '../../src/rxcomp-store';
import { ITodoItem } from './api/api.service';
import { TodoService } from './todo/todo.service';

let c: number = 0;

export default class AppComponent extends Component {

	onInit() {
		const { node } = getContext(this);
		node.classList.add('init');
		TodoService.state$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
			this.state = state;
			this.pushChanges();
			console.log('call', c++);
		});
		TodoService.loadWithCache$()
			.pipe(first())
			.subscribe(console.log);
	}

	onToggle(item: ITodoItem) {
		TodoService.toggleCompleted$(item).subscribe(console.log);
	}

	onAddItem() {
		TodoService.addItem$().subscribe(console.log);
	}

	onClearItems() {
		TodoService.clearItems$().subscribe(console.log);
	}

	removeItem(id: number) {
		TodoService.removeItem$(id).subscribe(console.log);
	}

	clearCookie() {
		CookieStorageService.clear();
	}

	clearLocalStorage() {
		LocalStorageService.clear();
	}

	clearSessionStorage() {
		SessionStorageService.clear();
	}

	static meta: IFactoryMeta = {
		selector: '[app-component]',
	};

}
