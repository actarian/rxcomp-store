import { Component, IFactoryMeta } from 'rxcomp';
import { takeUntil } from 'rxjs/operators';
import { TodoService } from '../todo/todo.service';

export default class CounterComponent extends Component {

	onInit() {
		TodoService.state$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe((state) => {
			this.todolist = state.todolist;
			this.pushChanges();
		});
	}

	static meta: IFactoryMeta = {
		selector: 'counter-component',
		template: `#items <span [innerHTML]="todolist.length"></span>`
	};

}
