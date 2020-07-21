import { Module } from 'rxcomp';
const factories = [];
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
