import { Factory, IModuleMeta, Module, Pipe } from 'rxcomp';
import JsonComponent from './json/json.component';
import JsonPipe from './json/json.pipe';
import CookieStorageComponent from './storage/cookie-storage.component';
import LocalStorageComponent from './storage/local-storage.component';
import SessionStorageComponent from './storage/session-storage.component';

const factories: typeof Factory[] = [
	JsonComponent,
	CookieStorageComponent,
	LocalStorageComponent,
	SessionStorageComponent,
];

const pipes: typeof Pipe[] = [
	JsonPipe,
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
