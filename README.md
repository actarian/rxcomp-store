# 💎 RxComp StoreModule

[![Licence](https://img.shields.io/github/license/actarian/rxcomp-store.svg)](https://github.com/actarian/rxcomp-store)

[RxComp StoreModule](https://github.com/actarian/rxcomp-store) is a Reactive Store Module for RxComp library

[RxComp](https://github.com/actarian/rxcomp) is a reactive component library built on top of [RxJs](https://github.com/ReactiveX/rxjs) that mimics the [Angular](https://angular.io/) declarative syntax. 

If you like Angular declarative syntax but you just want go Vanilla, RxComp library come in useful.

 lib & dependancy    | size
:--------------------|:----------------------------------------------------------------------------------------------|
rxcomp-store.min.js   | ![](https://img.badgesize.io/actarian/rxcomp-store/master/dist/iife/rxcomp-store.min.js.svg?compression=gzip)
rxcomp-store.min.js   | ![](https://img.badgesize.io/actarian/rxcomp-store/master/dist/iife/rxcomp-store.min.js.svg)
rxcomp.min.js        | ![](https://img.badgesize.io/actarian/rxcomp/master/dist/iife/rxcomp.min.js.svg?compression=gzip)
rxcomp.min.js        | ![](https://img.badgesize.io/actarian/rxcomp/master/dist/iife/rxcomp.min.js.svg)
rxjs.min.js          | ![](https://img.badgesize.io/https://unpkg.com/@reactivex/rxjs@6.5.4/dist/global/rxjs.umd.min.js.svg?compression=gzip)
rxjs.min.js          | ![](https://img.badgesize.io/https://unpkg.com/@reactivex/rxjs@6.5.4/dist/global/rxjs.umd.min.js.svg)
 
> [RxComp Form Demo](https://actarian.github.io/rxcomp-store/)  
> [RxComp Form Api](https://actarian.github.io/rxcomp-store/api/)  
> [RxComp Form Codepen](https://codepen.io/actarian/pen/vYEXXPe?editors=0010)  
___

### What is included
* Models  
*```FormControl```, ```FormGroup```, ```FormArray```*  

* Directives  
*```FormInput```, ```FormTextarea```, ```FormSelect```, ```FormCheckbox```, ```FormRadio```, ```FormSubmit```*  

* Validators  
*```EmailValidator```, ```MaxLengthValidator```, ```MaxValidator```, ```MinLengthValidator```, ```MinValidator```, ```NullValidator```, ```PatternValidator```, ```RequiredTrueValidator```, ```RequiredValidator```* 

___

## Installation and Usage

### ES6 via npm
This library depend on [RxComp](https://github.com/actarian/rxcomp) and [RxJs](https://github.com/ReactiveX/rxjs)  
install via npm or include via script   

```
npm install rxjs rxcomp rxcomp-store --save
```
___

### CDN

For CDN, you can use unpkg

```html
<script src="https://unpkg.com/@reactivex/rxjs@6.5.4/dist/global/rxjs.umd.min.js"></script>  
<script src="https://unpkg.com/rxcomp@1.0.0-beta.10/dist/umd/rxcomp.min.js"></script>  
<script src="https://unpkg.com/rxcomp-store@1.0.0-beta.10/dist/umd/rxcomp-store.min.js"></script>  
```

The global namespace for RxComp is `rxcomp`

```javascript
import { CoreModule, Module } from 'rxcomp';
```

The global namespace for RxComp StoreModule is `rxcomp.form`

```javascript
import { StoreModule } from 'rxcomp-store';
```
___

### Bootstrapping Module

```javascript
import { Browser, CoreModule, Module } from 'rxcomp';
import { StoreModule } from 'rxcomp-store';
import AppComponent from './app.component';

export default class AppModule extends Module {}

AppModule.meta = {
    imports: [
        CoreModule,
        StoreModule
    ],
    declarations: [],
    bootstrap: AppComponent,
};

Browser.bootstrap(AppModule);
```
___

### Reactive Form Definition

```javascript
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Component } from 'rxcomp';
import { StoreType, useStore } from 'rxcomp-store';

const { state$, busy, getState, setState, setError } = useStore({
	todolist: [],
}, StoreType.Memory, 'todolist');

export default class AppComponent extends Component {

    onInit() {
        state$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe((state) => {
			this.todolist = state.todolist;
			this.busy = state.busy;
			this.error = state.error;
			this.pushChanges();
		});
		busy().pipe(
			switchMap(() => ApiService.load$().pipe(
				tap((todolist: ITodoItem[]) => setState((state: any) => (state.todolist = todolist))),
				catchError((error: any) => setError(error))
			)));
		))).subscribe(console.log);
    }

}

AppComponent.meta = {
    selector: '[app-component]',
};
```
___
### Browser Compatibility
RxComp supports all browsers that are [ES5-compliant](http://kangax.github.io/compat-table/es5/) (IE8 and below are not supported).
___
## Contributing

*Pull requests are welcome and please submit bugs 🐞*
___

### Install packages
```
npm install
```
___

### Build, Serve & Watch 
```
gulp
```
___

### Build Dist
```
gulp build --target dist
```
___

*Thank you for taking the time to provide feedback and review. This feedback is appreciated and very helpful 🌈*

[![GitHub forks](https://img.shields.io/github/forks/actarian/rxcomp.svg?style=social&label=Fork&maxAge=2592000)](https://gitHub.com/actarian/rxcomp/network/)  [![GitHub stars](https://img.shields.io/github/stars/actarian/rxcomp.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/actarian/rxcomp/stargazers/)  [![GitHub followers](https://img.shields.io/github/followers/actarian.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/actarian?tab=followers)

* [Github Project Page](https://github.com/actarian/rxcomp)  

*If you find it helpful, feel free to contribute in keeping this library up to date via [PayPal](https://www.paypal.me/circledev/5)*

[![PayPal](https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png)](https://www.paypal.me/circledev/5)
___

## Contact

* Luca Zampetti <lzampetti@gmail.com>
* Follow [@actarian](https://twitter.com/actarian) on Twitter

[![Twitter Follow](https://img.shields.io/twitter/follow/actarian.svg?style=social&label=Follow%20@actarian)](https://twitter.com/actarian)
___

## Release Notes
Changelog [here](https://github.com/actarian/rxcomp-store/blob/master/CHANGELOG.md).

<!-- 
Docs Schema
"$schema": "http://json.schemastore.org/typedoc",
"toc": [
	"FormAbstract",
	"FormControl",
	"FormAbstractCollection",
	"FormGroup",
	"FormArray"
],
-->
