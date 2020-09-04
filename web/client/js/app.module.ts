import { CoreModule, IModuleMeta, Module } from 'rxcomp';
import { StoreModule } from '../../../src/rxcomp-store';
import AppComponent from './app.component';

export default class AppModule extends Module {

	static meta: IModuleMeta = {
		imports: [
			CoreModule,
			StoreModule
		],
		declarations: [
		],
		bootstrap: AppComponent,
	};

}
