import { Factory, IModuleMeta, Module, Pipe } from 'rxcomp';
import CookieStorageComponent from './storage/cookie-storage.component';
import LocalStorageComponent from './storage/local-storage.component';
import SessionStorageComponent from './storage/session-storage.component';

const factories: typeof Factory[] = [
	CookieStorageComponent,
	LocalStorageComponent,
	SessionStorageComponent,
];

const pipes: typeof Pipe[] = [
];

/**
 * StoreModule Class.
 * @example
 * export default class AppModule extends Module {}
 *
 * AppModule.meta = {
 *  imports: [
 *   CoreModule,
 *   StoreModule
 *  ],
 *  declarations: [
 *   ErrorsComponent
 *  ],
 *  bootstrap: AppComponent,
 * };
 * @extends Module
 */
export default class StoreModule extends Module {
	static meta: IModuleMeta = {
		declarations: [
			...factories,
			...pipes,
		],
		exports: [
			...factories,
			...pipes,
		]
	};
}
