import { Module } from 'rxcomp';
import CookieStorageComponent from './storage/cookie-storage.component';
import LocalStorageComponent from './storage/local-storage.component';
import SessionStorageComponent from './storage/session-storage.component';
const factories = [
    CookieStorageComponent,
    LocalStorageComponent,
    SessionStorageComponent,
];
const pipes = [];
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
}
StoreModule.meta = {
    declarations: [
        ...factories,
        ...pipes,
    ],
    exports: [
        ...factories,
        ...pipes,
    ]
};
