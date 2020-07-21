/**
 * @license rxcomp-store v1.0.0-beta.10
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (rxcomp, immer, rxjs, operators) {
  'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var LocalStorageService = function () {
    function LocalStorageService() {}

    LocalStorageService.clear = function clear() {
      if (this.isLocalStorageSupported()) {
        localStorage.clear();
      }
    };

    LocalStorageService.delete = function _delete(name) {
      if (this.isLocalStorageSupported()) {
        localStorage.removeItem(name);
      }
    };

    LocalStorageService.exist = function exist(name) {
      if (this.isLocalStorageSupported()) {
        return localStorage.getItem(name) !== undefined;
      } else {
        return false;
      }
    };

    LocalStorageService.get = function get(name) {
      var value = null;

      if (this.isLocalStorageSupported()) {
        try {
          var item = localStorage.getItem(name);

          if (item != null) {
            value = JSON.parse(item);
          }
        } catch (error) {
          console.log('LocalStorageService.get.error parsing', name, error);
        }
      }

      return value;
    };

    LocalStorageService.set = function set(name, value) {
      if (this.isLocalStorageSupported()) {
        try {
          var cache = new Map();
          var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value !== null) {
              if (cache.has(value)) {
                return;
              }

              cache.set(value, true);
            }

            return value;
          });
          localStorage.setItem(name, json);
        } catch (error) {
          console.log('LocalStorageService.set.error serializing', name, value, error);
        }
      }
    };

    LocalStorageService.isLocalStorageSupported = function isLocalStorageSupported() {
      if (this.supported) {
        return true;
      }

      var supported = false;

      try {
        supported = 'localStorage' in window && localStorage !== null;

        if (supported) {
          localStorage.setItem('test', '1');
          localStorage.removeItem('test');
        } else {
          supported = false;
        }
      } catch (error) {
        supported = false;
      }

      this.supported = supported;
      return supported;
    };

    return LocalStorageService;
  }();
  LocalStorageService.supported = false;

  var SessionStorageService = function () {
    function SessionStorageService() {}

    SessionStorageService.clear = function clear() {
      if (this.isSessionStorageSupported()) {
        sessionStorage.clear();
      }
    };

    SessionStorageService.delete = function _delete(name) {
      if (this.isSessionStorageSupported()) {
        sessionStorage.removeItem(name);
      }
    };

    SessionStorageService.exist = function exist(name) {
      if (this.isSessionStorageSupported()) {
        return sessionStorage.getItem(name) !== undefined;
      } else {
        return false;
      }
    };

    SessionStorageService.get = function get(name) {
      var value = null;

      if (this.isSessionStorageSupported()) {
        try {
          var item = sessionStorage.getItem(name);

          if (item != null) {
            value = JSON.parse(item);
          }
        } catch (eerror) {
          console.log('SessionStorageService.get.error parsing', name, error);
        }
      }

      return value;
    };

    SessionStorageService.set = function set(name, value) {
      if (this.isSessionStorageSupported()) {
        try {
          var cache = new Map();
          var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value !== null) {
              if (cache.has(value)) {
                return;
              }

              cache.set(value, true);
            }

            return value;
          });
          sessionStorage.setItem(name, json);
        } catch (error) {
          console.log('SessionStorageService.set.error serializing', name, value, error);
        }
      }
    };

    SessionStorageService.isSessionStorageSupported = function isSessionStorageSupported() {
      if (this.supported) {
        return true;
      }

      var supported = false;

      try {
        supported = 'sessionStorage' in window && sessionStorage !== null;

        if (supported) {
          sessionStorage.setItem('test', '1');
          sessionStorage.removeItem('test');
        } else {
          supported = false;
        }
      } catch (error) {
        supported = false;
      }

      this.supported = supported;
      return supported;
    };

    return SessionStorageService;
  }();
  SessionStorageService.supported = false;

  var factories = [];
  var pipes = [];

  var StoreModule = function (_Module) {
    _inheritsLoose(StoreModule, _Module);

    function StoreModule() {
      return _Module.apply(this, arguments) || this;
    }

    return StoreModule;
  }(rxcomp.Module);
  StoreModule.meta = {
    declarations: [].concat(factories, pipes),
    exports: [].concat(factories, pipes)
  };

  function _busy(store) {
    return rxjs.of(null).pipe(operators.filter(function () {
      var busy;

      store.state = function (draft) {
        busy = draft.busy;

        if (!busy) {
          draft.busy = true;
          draft.error = null;
        }
      };

      return !busy;
    }));
  }

  function setState(store) {
    return function (callback) {
      var output;

      store.state = function (draft) {
        draft.error = null;
        output = callback(draft);
        draft.busy = false;

        if (store.type === StoreType.Local) {
          LocalStorageService.set(store.key, draft);
        }

        if (store.type === StoreType.Session) {
          SessionStorageService.set(store.key, draft);
        }
      };

      return output;
    };
  }

  function setError(store) {
    return function (error) {
      store.state = function (draft) {
        draft.error = error;
        draft.busy = false;
      };

      return rxjs.of();
    };
  }

  function _getState(store, callback) {
    return rxjs.of(null).pipe(operators.map(function () {
      var value = null;

      if (store.type === StoreType.Local) {
        value = LocalStorageService.get(store.key);

        if (value && typeof callback === 'function') {
          value = callback(value);
        }
      } else if (store.type === StoreType.Session) {
        value = SessionStorageService.get(store.key);

        if (value && typeof callback === 'function') {
          value = callback(value);
        }
      }

      return value;
    }), operators.filter(function (x) {
      return x !== null;
    }));
  }

  function makeSetState(state) {
    return function (callback) {
      state.next(immer.produce(state.getValue(), function (draft) {
        if (typeof callback === 'function') {
          callback(draft);
        }

        return draft;
      }));
    };
  }

  var StoreType;

  (function (StoreType) {
    StoreType[StoreType["Memory"] = 1] = "Memory";
    StoreType[StoreType["Session"] = 2] = "Session";
    StoreType[StoreType["Local"] = 3] = "Local";
  })(StoreType || (StoreType = {}));
  var Store = function () {
    function Store(state, type, key) {
      if (state === void 0) {
        state = {};
      }

      if (type === void 0) {
        type = StoreType.Memory;
      }

      if (key === void 0) {
        key = 'store';
      }

      this.type = type;
      this.key = "rxcomp_" + key;
      state.busy = false;
      state.error = null;
      var state_ = new rxjs.BehaviorSubject(state);
      this.setState = makeSetState(state_);
      this.state$ = state_.asObservable();
    }

    var _proto = Store.prototype;

    _proto.setState = function setState(callback) {};

    _createClass(Store, [{
      key: "state",
      set: function set(callback) {
        this.setState(callback);
      }
    }]);

    return Store;
  }();
  function useStore(state, type, key) {
    var store = new Store(state, type, key);
    return {
      busy: function busy() {
        return _busy(store);
      },
      getState: function getState(callback) {
        return _getState(store, callback);
      },
      setState: setState(store),
      setError: setError(store),
      state$: store.state$
    };
  }

  var DELAY = 300;
  var PROGRESSIVE_INDEX = 0;

  var ApiService = function () {
    function ApiService() {}

    ApiService.load$ = function load$(url) {
      return rxjs.of(new Array(1).fill(0).map(function (x, i) {
        var id = new Date().valueOf() + i;
        return {
          id: id,
          name: PROGRESSIVE_INDEX++ + " item " + id
        };
      })).pipe(operators.delay(DELAY * Math.random()));
    };

    ApiService.addItem$ = function addItem$(url, item) {
      var id = new Date().valueOf();

      if (Math.random() < 0.25) {
        return rxjs.of(1).pipe(operators.delay(DELAY * Math.random()), operators.switchMap(function () {
          return rxjs.throwError("error " + id);
        }));
      }

      return rxjs.of({
        id: id,
        name: PROGRESSIVE_INDEX++ + " item " + id
      }).pipe(operators.delay(DELAY * Math.random()));
    };

    ApiService.remove$ = function remove$(url, id) {
      return rxjs.of(id).pipe(operators.delay(DELAY * Math.random()));
    };

    ApiService.patch$ = function patch$(url, item) {
      return rxjs.of(item).pipe(operators.delay(DELAY * Math.random()));
    };

    return ApiService;
  }();

  var _useStore = useStore({
    todolist: []
  }, StoreType.Session, 'todolist'),
      state$ = _useStore.state$,
      busy = _useStore.busy,
      getState = _useStore.getState,
      setState$1 = _useStore.setState,
      setError$1 = _useStore.setError;

  var TodoService = function () {
    function TodoService() {}

    TodoService.loadWithCache$ = function loadWithCache$() {
      return busy().pipe(operators.switchMap(function () {
        return rxjs.merge(getState(function (state) {
          return state.todolist;
        }), ApiService.load$('url')).pipe(operators.tap(function (todolist) {
          return setState$1(function (state) {
            return state.todolist = todolist;
          });
        }), operators.catchError(function (error) {
          return setError$1(error);
        }));
      }));
    };

    TodoService.load$ = function load$() {
      return busy().pipe(operators.switchMap(function () {
        return ApiService.load$('url').pipe(operators.tap(function (todolist) {
          return setState$1(function (state) {
            return state.todolist = todolist;
          });
        }), operators.catchError(function (error) {
          return setError$1(error);
        }));
      }));
    };

    TodoService.addItem$ = function addItem$() {
      return busy().pipe(operators.switchMap(function () {
        return ApiService.addItem$('url').pipe(operators.tap(function (item) {
          return setState$1(function (state) {
            state.todolist.push(item);
          });
        }), operators.catchError(function (error) {
          return setError$1(error);
        }));
      }));
    };

    TodoService.removeItem$ = function removeItem$(id) {
      return busy().pipe(operators.switchMap(function () {
        return ApiService.remove$('url', id).pipe(operators.tap(function (id) {
          return setState$1(function (state) {
            var index = state.todolist.reduce(function (p, c, i) {
              return c.id === id ? i : p;
            }, -1);

            if (index !== -1) {
              state.todolist.splice(index, 1);
            }
          });
        }), operators.catchError(function (error) {
          return setError$1(error);
        }));
      }));
    };

    TodoService.toggleCompleted$ = function toggleCompleted$(item) {
      return busy().pipe(operators.switchMap(function () {
        return ApiService.patch$('url', item).pipe(operators.tap(function (item) {
          return setState$1(function (state) {
            var stateItem = state.todolist.find(function (x) {
              return x.id === item.id;
            });

            if (stateItem) {
              stateItem.completed = !stateItem.completed;
            }
          });
        }), operators.catchError(function (error) {
          return setError$1(error);
        }));
      }));
    };

    _createClass(TodoService, null, [{
      key: "state$",
      get: function get() {
        return state$;
      }
    }]);

    return TodoService;
  }();

  var c = 0;

  var AppComponent = function (_Component) {
    _inheritsLoose(AppComponent, _Component);

    function AppComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = AppComponent.prototype;

    _proto.onInit = function onInit() {
      var _this = this;

      var _getContext = rxcomp.getContext(this),
          node = _getContext.node;

      node.classList.add('init');
      TodoService.state$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (state) {
        _this.todolist = state.todolist;
        _this.error = state.error;
        _this.busy = state.busy;

        _this.pushChanges();

        console.log('call', c++);
      });
      TodoService.loadWithCache$().pipe(operators.first()).subscribe(console.log);
    };

    _proto.onToggle = function onToggle(item) {
      TodoService.toggleCompleted$(item).subscribe(console.log);
    };

    _proto.addItem = function addItem() {
      TodoService.addItem$().subscribe(console.log);
    };

    _proto.removeItem = function removeItem(id) {
      TodoService.removeItem$(id).subscribe(console.log);
    };

    return AppComponent;
  }(rxcomp.Component);
  AppComponent.meta = {
    selector: '[app-component]'
  };

  var CounterComponent = function (_Component) {
    _inheritsLoose(CounterComponent, _Component);

    function CounterComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = CounterComponent.prototype;

    _proto.onInit = function onInit() {
      var _this = this;

      TodoService.state$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (state) {
        _this.todolist = state.todolist;

        _this.pushChanges();
      });
    };

    return CounterComponent;
  }(rxcomp.Component);
  CounterComponent.meta = {
    selector: 'counter-component',
    template: "#items <span [innerHTML]=\"todolist.length\"></span>"
  };

  var DebugComponent = function (_Component) {
    _inheritsLoose(DebugComponent, _Component);

    function DebugComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = DebugComponent.prototype;

    _proto.onChanges = function onChanges() {
      var _getContext = rxcomp.getContext(this),
          node = _getContext.node;

      node.innerHTML = this.debug ? JSON.stringify(this.debug, null, 2) : this.debug;
    };

    return DebugComponent;
  }(rxcomp.Component);
  DebugComponent.meta = {
    selector: '[debug-component]',
    inputs: ['debug']
  };

  var AppModule = function (_Module) {
    _inheritsLoose(AppModule, _Module);

    function AppModule() {
      return _Module.apply(this, arguments) || this;
    }

    return AppModule;
  }(rxcomp.Module);
  AppModule.meta = {
    imports: [rxcomp.CoreModule, StoreModule],
    declarations: [CounterComponent, DebugComponent],
    bootstrap: AppComponent
  };

  rxcomp.Browser.bootstrap(AppModule);

}(rxcomp, immer, rxjs, rxjs.operators));
