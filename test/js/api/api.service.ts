import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

const DELAY: number = 300;
let PROGRESSIVE_INDEX: number = 0;

export interface ITodoItem {
	id?: number;
	name?: string;
	completed?: boolean;
}

export default class ApiService {

	static load$(url: string): Observable<ITodoItem[]> {
		// simulate api call
		return of(new Array(1).fill(0).map((x, i) => {
			const id = new Date().valueOf() + i;
			return { id: id, name: `${PROGRESSIVE_INDEX++} item ${id}` };
		})).pipe(
			delay(DELAY * Math.random())
		);
	}

	static addItem$(url: string, item?: ITodoItem): Observable<ITodoItem> {
		// simulate api call
		const id = new Date().valueOf();
		return of({ id: id, name: `${PROGRESSIVE_INDEX++} item ${id}` }).pipe(
			delay(DELAY * Math.random()),
			tap(() => {
				if (Math.random() < 0.6) {
					throw (`simulated error ${id}`);
					/*
					// simulate api error
					return of(1).pipe(
						delay(DELAY * Math.random()),
						tap(() => console.log('error')),
						switchMap(() => throwError(`simulated error ${id}`))
					);
					*/
				}
			})
		);
	}

	static clearItems$(url: string): Observable<ITodoItem[]> {
		// simulate api call
		return of([]).pipe(
			delay(DELAY * Math.random())
		);
	}

	static remove$(url: string, id: number): Observable<number> {
		// simulate api call
		return of(id).pipe(
			delay(DELAY * Math.random())
		);
	}

	static patch$(url: string, item: ITodoItem): Observable<ITodoItem> {
		// simulate api call
		return of(item).pipe(
			delay(DELAY * Math.random())
		);
	}
}
