import { Component, getContext, IFactoryMeta } from 'rxcomp';
import { first, takeUntil } from 'rxjs/operators';
import { ITodoItem } from './api/api.service';
import { TodoService } from './todo/todo.service';

let c: number = 0;

export default class AppComponent extends Component {

	onInit() {
		const { node } = getContext(this);
		node.classList.add('init');
		TodoService.state$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
			this.todolist = state.todolist;
			this.error = state.error;
			this.busy = state.busy;
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

	addItem() {
		TodoService.addItem$().subscribe(console.log);
	}

	removeItem(id: number) {
		TodoService.removeItem$(id).subscribe(console.log);
	}

	static meta: IFactoryMeta = {
		selector: '[app-component]',
	};

}
