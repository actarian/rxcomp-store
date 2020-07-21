import { CoreModule, IModuleMeta, Module } from 'rxcomp';
import { StoreModule } from '../../src/rxcomp-store';
import AppComponent from './app.component';
import CounterComponent from './counter/counter.component';
import DebugComponent from './debug/debug.component';

export default class AppModule extends Module {

	static meta: IModuleMeta = {
		imports: [
			CoreModule,
			StoreModule
		],
		declarations: [
			CounterComponent,
			DebugComponent
		],
		bootstrap: AppComponent,
	};

}
