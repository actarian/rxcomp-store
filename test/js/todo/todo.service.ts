import { merge, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StoreType, useStore } from '../../../src/rxcomp-store';
import ApiService, { ITodoItem } from '../api/api.service';

const { state$, busyState$, cachedState$, reduceState, catchErrorState, setError } = useStore({
	todolist: [],
}, StoreType.Session, 'todolist');

export class TodoService {

	static get state$() {
		return state$;
	}

	static loadWithCache$(): Observable<ITodoItem[] | unknown> {
		return busyState$().pipe(
			switchMap(() => merge(cachedState$((state: any) => state.todolist) as Observable<ITodoItem[]>, ApiService.load$('url')).pipe(
				reduceState((todolist: ITodoItem[], state: any) => state.todolist = todolist),
				catchErrorState(console.log),
				// tap((todolist: ITodoItem[]) => setState((state: any) => (state.todolist = todolist))),
				// catchError((error: any) => setError(error))
			)));
	}

	static load$(): Observable<ITodoItem[] | unknown> {
		return busyState$().pipe(
			switchMap(() => ApiService.load$('url').pipe(
				reduceState((todolist: ITodoItem[], state: any) => state.todolist = todolist),
				catchErrorState(console.log),
				// tap((todolist: ITodoItem[]) => setState((state: any) => (state.todolist = todolist))),
				// catchError((error: any) => setError(error))
			)));
	}

	static addItem$(): Observable<ITodoItem | unknown> {
		return busyState$().pipe(
			switchMap(() => ApiService.addItem$('url').pipe(
				reduceState((item: ITodoItem, state: any) => {
					state.todolist.push(item)
				}),
				catchErrorState(console.log),
				// tap((item) => setState((state: any) => { state.todolist.push(item); })),
				// catchError((error: any) => setError(error))
			))
		);
	}

	static clearItems$(): Observable<ITodoItem[] | unknown> {
		return busyState$().pipe(
			switchMap(() => ApiService.clearItems$('url').pipe(
				reduceState((items: ITodoItem[], state: any) => state.todolist = items),
				catchErrorState(console.log),
				// tap((items) => setState((state: any) => state.todolist = items)),
				// catchError((error: any) => setError(error))
			))
		);
	}

	static removeItem$(id: number): Observable<number | unknown> {
		return busyState$().pipe(
			switchMap(() => ApiService.remove$('url', id).pipe(
				reduceState((id: number, state: any) => {
					const index = state.todolist.reduce((p: number, c: ITodoItem, i: number) => {
						return c.id === id ? i : p;
					}, -1);
					if (index !== -1) {
						state.todolist.splice(index, 1);
					}
				}),
				catchErrorState(console.log),
				/*
				tap((id) => setState((state: any) => {
					const index = state.todolist.reduce((p: number, c: ITodoItem, i: number) => {
						return c.id === id ? i : p;
					}, -1);
					if (index !== -1) {
						state.todolist.splice(index, 1);
					}
				})),
				catchError((error: any) => setError(error))
				*/
			))
		);
	}

	static toggleCompleted$(item: ITodoItem): Observable<ITodoItem | unknown> {
		return busyState$().pipe(
			switchMap(() => ApiService.patch$('url', item).pipe(
				reduceState((item: ITodoItem, state: any) => {
					const stateItem = state.todolist.find((x: ITodoItem) => x.id === item.id);
					if (stateItem) {
						stateItem.completed = !stateItem.completed;
					}
				}),
				catchErrorState(console.log),
				/*
				tap((item) => setState((state: any) => {
					const stateItem = state.todolist.find((x: ITodoItem) => x.id === item.id);
					if (stateItem) {
						stateItem.completed = !stateItem.completed;
					}
				})),
				catchError((error: any) => setError(error))
				*/
			)));
	}

}

