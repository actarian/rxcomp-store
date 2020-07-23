/**
 * @license rxcomp-store v1.0.0-beta.10
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (rxcomp, operators, rxjs, immer) {
  'use strict';

  var rxcomp__default = 'default' in rxcomp ? rxcomp['default'] : rxcomp;
  var operators__default = 'default' in operators ? operators['default'] : operators;
  var rxjs__default = 'default' in rxjs ? rxjs['default'] : rxjs;
  var immer__default = 'default' in immer ? immer['default'] : immer;

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

  var JsonComponent = function (_Component) {
    _inheritsLoose(JsonComponent, _Component);

    function JsonComponent() {
      var _this;

      _this = _Component.apply(this, arguments) || this;
      _this.active = false;
      return _this;
    }

    var _proto = JsonComponent.prototype;

    _proto.onToggle = function onToggle() {
      this.active = !this.active;
      this.pushChanges();
    };

    return JsonComponent;
  }(rxcomp.Component);
  JsonComponent.meta = {
    selector: 'json-component',
    inputs: ['item'],
    template: "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ json </span>\n\t\t\t\t\t<span *if=\"active\">- json </span>\n\t\t\t\t\t<span [innerHTML]=\"item\"></span>\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\">\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item | json\"></span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>"
  };

  var StorageService = function () {
    function StorageService() {}

    StorageService.encode = function encode(value) {
      var encodedJson = null;

      try {
        var cache = new Map();
        var json = JSON.stringify(value, function (key, value) {
          if (typeof value === 'object' && value != null) {
            if (cache.has(value)) {
              return;
            }

            cache.set(value, true);
          }

          return value;
        });
        encodedJson = btoa(encodeURIComponent(json));
      } catch (error) {
        console.warn('StorageService.encode.error', value, error);
      }

      return encodedJson;
    };

    StorageService.decode = function decode(encodedJson) {
      var value;

      if (encodedJson) {
        try {
          value = JSON.parse(decodeURIComponent(atob(encodedJson)));
        } catch (error) {
          value = encodedJson;
        }
      }

      return value;
    };

    StorageService.isSupported = function isSupported(type) {
      var flag = false;
      var storage;

      try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        flag = true;
      } catch (error) {
        flag = error instanceof DOMException && (error.code === 22 || error.code === 1014 || error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') && Boolean(storage && storage.length !== 0);
      }

      return flag;
    };

    return StorageService;
  }();
  StorageService.supported = false;

  var CookieStorageService = function (_StorageService) {
    _inheritsLoose(CookieStorageService, _StorageService);

    function CookieStorageService() {
      return _StorageService.apply(this, arguments) || this;
    }

    CookieStorageService.clear = function clear() {
      var _this = this;

      this.toRawArray().forEach(function (x) {
        _this.setter(x.name, '', -1);
      });
    };

    CookieStorageService.delete = function _delete(name) {
      this.setter(name, '', -1);
    };

    CookieStorageService.exist = function exist(name) {
      return document.cookie.indexOf(';' + name + '=') !== -1 || document.cookie.indexOf(name + '=') === 0;
    };

    CookieStorageService.get = function get(name) {
      return this.decode(this.getRaw(name));
    };

    CookieStorageService.set = function set(name, value, days) {
      this.setter(name, this.encode(value), days);
    };

    CookieStorageService.getRaw = function getRaw(name) {
      var value = null;
      var cookies = this.toRawArray();
      var cookie = cookies.find(function (x) {
        return x.name === name;
      });

      if (cookie) {
        value = cookie.value;
      }

      return value;
    };

    CookieStorageService.setRaw = function setRaw(name, value, days) {
      this.setter(name, value, days);
    };

    CookieStorageService.toArray = function toArray() {
      var _this2 = this;

      return this.toRawArray().map(function (x) {
        x.value = _this2.decode(x.value);
        return x;
      });
    };

    CookieStorageService.toRawArray = function toRawArray() {
      return document.cookie.split(';').map(function (x) {
        var items = x.split('=');
        return {
          name: items[0].trim(),
          value: items[1] ? items[1].trim() : null
        };
      }).filter(function (x) {
        return x.name !== '';
      });
    };

    CookieStorageService.setter = function setter(name, value, days) {
      var expires;

      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      } else {
        expires = '';
      }

      document.cookie = name + '=' + value + expires + '; path=/';
      this.items$.next(this.toArray());
    };

    CookieStorageService.isSupported = function isSupported() {
      var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
      return isBrowser;
    };

    return CookieStorageService;
  }(StorageService);
  CookieStorageService.items$ = new rxjs.ReplaySubject(1);

  var CookieStorageComponent = function (_Component) {
    _inheritsLoose(CookieStorageComponent, _Component);

    function CookieStorageComponent() {
      var _this;

      _this = _Component.apply(this, arguments) || this;
      _this.active = false;
      _this.items = [];
      return _this;
    }

    var _proto = CookieStorageComponent.prototype;

    _proto.onInit = function onInit() {
      var _this2 = this;

      this.items = CookieStorageService.toArray();
      CookieStorageService.items$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
        _this2.items = items;

        _this2.pushChanges();
      });
    };

    _proto.onToggle = function onToggle() {
      this.active = !this.active;
      this.pushChanges();
    };

    _proto.onClear = function onClear() {
      CookieStorageService.clear();
    };

    _proto.onRemove = function onRemove(item) {
      CookieStorageService.delete(item.name);
    };

    return CookieStorageComponent;
  }(rxcomp.Component);
  CookieStorageComponent.meta = {
    selector: 'cookie-storage-component',
    template: "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ cookie</span>\n\t\t\t\t\t<span *if=\"active\">- cookie</span>\n\t\t\t\t\t<span [innerHTML]=\"' {' + items.length + ')'\"></span>\n\t\t\t\t</span>\n\t\t\t\t<span class=\"rxc-head__remove\" (click)=\"onClear()\">x</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\" *for=\"let item of items\">\n\t\t\t\t\t<span class=\"rxc-list__name\" [innerHTML]=\"item.name\"></span>\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item.value | json\"></span>\n\t\t\t\t\t<span class=\"rxc-list__remove\" (click)=\"onRemove(item)\">x</span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>"
  };

  var LocalStorageService = function (_StorageService) {
    _inheritsLoose(LocalStorageService, _StorageService);

    function LocalStorageService() {
      return _StorageService.apply(this, arguments) || this;
    }

    LocalStorageService.clear = function clear() {
      if (this.isSupported()) {
        localStorage.clear();
        this.items$.next(this.toArray());
      }
    };

    LocalStorageService.delete = function _delete(name) {
      if (this.isSupported()) {
        localStorage.removeItem(name);
        this.items$.next(this.toArray());
      }
    };

    LocalStorageService.exist = function exist(name) {
      if (this.isSupported()) {
        return localStorage.getItem(name) !== undefined;
      } else {
        return false;
      }
    };

    LocalStorageService.get = function get(name) {
      return this.decode(this.getRaw(name));
    };

    LocalStorageService.set = function set(name, value) {
      this.setRaw(name, this.encode(value));
    };

    LocalStorageService.getRaw = function getRaw(name) {
      var value = null;

      if (this.isSupported()) {
        value = localStorage.getItem(name);
      }

      return value;
    };

    LocalStorageService.setRaw = function setRaw(name, value) {
      if (value && this.isSupported()) {
        localStorage.setItem(name, value);
        this.items$.next(this.toArray());
      }
    };

    LocalStorageService.toArray = function toArray() {
      var _this = this;

      return this.toRawArray().map(function (x) {
        x.value = _this.decode(x.value);
        return x;
      });
    };

    LocalStorageService.toRawArray = function toRawArray() {
      var _this2 = this;

      if (this.isSupported()) {
        return Object.keys(localStorage).map(function (key) {
          return {
            name: key,
            value: _this2.getRaw(key)
          };
        });
      } else {
        return [];
      }
    };

    LocalStorageService.isSupported = function isSupported() {
      if (this.supported) {
        return true;
      }

      return StorageService.isSupported('localStorage');
    };

    return LocalStorageService;
  }(StorageService);
  LocalStorageService.items$ = new rxjs.ReplaySubject(1);

  var LocalStorageComponent = function (_Component) {
    _inheritsLoose(LocalStorageComponent, _Component);

    function LocalStorageComponent() {
      var _this;

      _this = _Component.apply(this, arguments) || this;
      _this.active = false;
      _this.items = [];
      return _this;
    }

    var _proto = LocalStorageComponent.prototype;

    _proto.onInit = function onInit() {
      var _this2 = this;

      this.items = LocalStorageService.toArray();
      LocalStorageService.items$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
        _this2.items = items;

        _this2.pushChanges();
      });
    };

    _proto.onToggle = function onToggle() {
      this.active = !this.active;
      this.pushChanges();
    };

    _proto.onClear = function onClear() {
      LocalStorageService.clear();
    };

    _proto.onRemove = function onRemove(item) {
      LocalStorageService.delete(item.name);
    };

    return LocalStorageComponent;
  }(rxcomp.Component);
  LocalStorageComponent.meta = {
    selector: 'local-storage-component',
    template: "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ localStorage</span>\n\t\t\t\t\t<span *if=\"active\">- localStorage</span>\n\t\t\t\t\t<span [innerHTML]=\"' {' + items.length + ')'\"></span>\n\t\t\t\t</span>\n\t\t\t\t<span class=\"rxc-head__remove\" (click)=\"onClear()\">x</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\" *for=\"let item of items\">\n\t\t\t\t\t<span class=\"rxc-list__name\" [innerHTML]=\"item.name\"></span>\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item.value | json\"></span>\n\t\t\t\t\t<span class=\"rxc-list__remove\" (click)=\"onRemove(item)\">x</span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>"
  };

  var SessionStorageService = function (_StorageService) {
    _inheritsLoose(SessionStorageService, _StorageService);

    function SessionStorageService() {
      return _StorageService.apply(this, arguments) || this;
    }

    SessionStorageService.clear = function clear() {
      if (this.isSupported()) {
        sessionStorage.clear();
        this.items$.next(this.toArray());
      }
    };

    SessionStorageService.delete = function _delete(name) {
      if (this.isSupported()) {
        sessionStorage.removeItem(name);
        this.items$.next(this.toArray());
      }
    };

    SessionStorageService.exist = function exist(name) {
      if (this.isSupported()) {
        return sessionStorage.getItem(name) !== undefined;
      } else {
        return false;
      }
    };

    SessionStorageService.get = function get(name) {
      return this.decode(this.getRaw(name));
    };

    SessionStorageService.set = function set(name, value) {
      this.setRaw(name, this.encode(value));
    };

    SessionStorageService.getRaw = function getRaw(name) {
      var value = null;

      if (this.isSupported()) {
        value = sessionStorage.getItem(name);
      }

      return value;
    };

    SessionStorageService.setRaw = function setRaw(name, value) {
      if (value && this.isSupported()) {
        sessionStorage.setItem(name, value);
        this.items$.next(this.toArray());
      }
    };

    SessionStorageService.toArray = function toArray() {
      var _this = this;

      return this.toRawArray().map(function (x) {
        x.value = _this.decode(x.value);
        return x;
      });
    };

    SessionStorageService.toRawArray = function toRawArray() {
      var _this2 = this;

      if (this.isSupported()) {
        return Object.keys(sessionStorage).map(function (key) {
          return {
            name: key,
            value: _this2.getRaw(key)
          };
        });
      } else {
        return [];
      }
    };

    SessionStorageService.isSupported = function isSupported() {
      if (this.supported) {
        return true;
      }

      return StorageService.isSupported('sessionStorage');
    };

    return SessionStorageService;
  }(StorageService);
  SessionStorageService.items$ = new rxjs.ReplaySubject(1);

  var SessionStorageComponent = function (_Component) {
    _inheritsLoose(SessionStorageComponent, _Component);

    function SessionStorageComponent() {
      var _this;

      _this = _Component.apply(this, arguments) || this;
      _this.active = false;
      _this.items = [];
      return _this;
    }

    var _proto = SessionStorageComponent.prototype;

    _proto.onInit = function onInit() {
      var _this2 = this;

      this.items = SessionStorageService.toArray();
      SessionStorageService.items$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
        _this2.items = items;

        _this2.pushChanges();
      });
    };

    _proto.onToggle = function onToggle() {
      this.active = !this.active;
      this.pushChanges();
    };

    _proto.onClear = function onClear() {
      SessionStorageService.clear();
    };

    _proto.onRemove = function onRemove(item) {
      SessionStorageService.delete(item.name);
    };

    return SessionStorageComponent;
  }(rxcomp.Component);
  SessionStorageComponent.meta = {
    selector: 'session-storage-component',
    template: "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ sessionStorage</span>\n\t\t\t\t\t<span *if=\"active\">- sessionStorage</span>\n\t\t\t\t\t<span [innerHTML]=\"' {' + items.length + ')'\"></span>\n\t\t\t\t</span>\n\t\t\t\t<span class=\"rxc-head__remove\" (click)=\"onClear()\">x</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\" *for=\"let item of items\">\n\t\t\t\t\t<span class=\"rxc-list__name\" [innerHTML]=\"item.name\"></span>\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item.value | json\"></span>\n\t\t\t\t\t<span class=\"rxc-list__remove\" (click)=\"onRemove(item)\">x</span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>"
  };

  var JsonPipe = function (_Pipe) {
    _inheritsLoose(JsonPipe, _Pipe);

    function JsonPipe() {
      return _Pipe.apply(this, arguments) || this;
    }

    JsonPipe.transform = function transform(value) {
      var cache = new Map();
      var json = JSON.stringify(value, function (key, value) {
        if (typeof value === 'object' && value != null) {
          if (cache.has(value)) {
            return '#ref';
          }

          cache.set(value, true);
        }

        return value;
      }, 2);
      return json;
    };

    return JsonPipe;
  }(rxcomp.Pipe);
  JsonPipe.meta = {
    name: 'json'
  };

  var factories = [JsonComponent, CookieStorageComponent, LocalStorageComponent, SessionStorageComponent];
  var pipes = [JsonPipe];

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

        if (store.type === StoreType.Cookie) {
          CookieStorageService.set(store.key, draft, 365);
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
      } else if (store.type === StoreType.Session) {
        value = SessionStorageService.get(store.key);
      } else if (store.type === StoreType.Cookie) {
        value = CookieStorageService.get(store.key);
      }

      if (value && typeof callback === 'function') {
        value = callback(value);
      }

      return value;
    }), operators.filter(function (x) {
      return x != null;
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
    StoreType[StoreType["Cookie"] = 4] = "Cookie";
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

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var localStorage_service = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var LocalStorageService = function () {
      function LocalStorageService() {}

      LocalStorageService.clear = function () {
        if (this.isLocalStorageSupported()) {
          localStorage.clear();
        }
      };

      LocalStorageService.delete = function (name) {
        if (this.isLocalStorageSupported()) {
          localStorage.removeItem(name);
        }
      };

      LocalStorageService.exist = function (name) {
        if (this.isLocalStorageSupported()) {
          return localStorage.getItem(name) !== undefined;
        } else {
          return false;
        }
      };

      LocalStorageService.get = function (name) {
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

      LocalStorageService.set = function (name, value) {
        if (this.isLocalStorageSupported()) {
          try {
            var cache_1 = new Map();
            var json = JSON.stringify(value, function (key, value) {
              if (typeof value === 'object' && value !== null) {
                if (cache_1.has(value)) {
                  return;
                }

                cache_1.set(value, true);
              }

              return value;
            });
            localStorage.setItem(name, json);
          } catch (error) {
            console.log('LocalStorageService.set.error serializing', name, value, error);
          }
        }
      };

      LocalStorageService.isLocalStorageSupported = function () {
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

      LocalStorageService.supported = false;
      return LocalStorageService;
    }();

    exports.default = LocalStorageService;
  });
  unwrapExports(localStorage_service);

  var sessionStorage_service = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var SessionStorageService = function () {
      function SessionStorageService() {}

      SessionStorageService.clear = function () {
        if (this.isSessionStorageSupported()) {
          sessionStorage.clear();
        }
      };

      SessionStorageService.delete = function (name) {
        if (this.isSessionStorageSupported()) {
          sessionStorage.removeItem(name);
        }
      };

      SessionStorageService.exist = function (name) {
        if (this.isSessionStorageSupported()) {
          return sessionStorage.getItem(name) !== undefined;
        } else {
          return false;
        }
      };

      SessionStorageService.get = function (name) {
        var value = null;

        if (this.isSessionStorageSupported()) {
          try {
            var item = sessionStorage.getItem(name);

            if (item != null) {
              value = JSON.parse(item);
            }
          } catch (error) {
            console.log('SessionStorageService.get.error parsing', name, error);
          }
        }

        return value;
      };

      SessionStorageService.set = function (name, value) {
        if (this.isSessionStorageSupported()) {
          try {
            var cache_1 = new Map();
            var json = JSON.stringify(value, function (key, value) {
              if (typeof value === 'object' && value !== null) {
                if (cache_1.has(value)) {
                  return;
                }

                cache_1.set(value, true);
              }

              return value;
            });
            sessionStorage.setItem(name, json);
          } catch (error) {
            console.log('SessionStorageService.set.error serializing', name, value, error);
          }
        }
      };

      SessionStorageService.isSessionStorageSupported = function () {
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

      SessionStorageService.supported = false;
      return SessionStorageService;
    }();

    exports.default = SessionStorageService;
  });
  unwrapExports(sessionStorage_service);

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __param(paramIndex, decorator) {
      return function (target, key) { decorator(target, key, paramIndex); }
  }

  function __metadata(metadataKey, metadataValue) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
  }

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  });

  function __exportStar(m, exports) {
      for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
  }

  function __values(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
          next: function () {
              if (o && i >= o.length) o = void 0;
              return { value: o && o[i++], done: !o };
          }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  function __spread() {
      for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read(arguments[i]));
      return ar;
  }

  function __spreadArrays() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
      return r;
  }
  function __await(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
  }

  function __asyncGenerator(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
      function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
      function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
      function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
      function fulfill(value) { resume("next", value); }
      function reject(value) { resume("throw", value); }
      function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
  }

  function __asyncDelegator(o) {
      var i, p;
      return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
      function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
  }

  function __asyncValues(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
      function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
      function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
  }

  function __makeTemplateObject(cooked, raw) {
      if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
      return cooked;
  }
  var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  };

  function __importStar(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  }

  function __importDefault(mod) {
      return (mod && mod.__esModule) ? mod : { default: mod };
  }

  function __classPrivateFieldGet(receiver, privateMap) {
      if (!privateMap.has(receiver)) {
          throw new TypeError("attempted to get private field on non-instance");
      }
      return privateMap.get(receiver);
  }

  function __classPrivateFieldSet(receiver, privateMap, value) {
      if (!privateMap.has(receiver)) {
          throw new TypeError("attempted to set private field on non-instance");
      }
      privateMap.set(receiver, value);
      return value;
  }

  var tslib_es6 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __extends: __extends,
    get __assign () { return __assign; },
    __rest: __rest,
    __decorate: __decorate,
    __param: __param,
    __metadata: __metadata,
    __awaiter: __awaiter,
    __generator: __generator,
    __createBinding: __createBinding,
    __exportStar: __exportStar,
    __values: __values,
    __read: __read,
    __spread: __spread,
    __spreadArrays: __spreadArrays,
    __await: __await,
    __asyncGenerator: __asyncGenerator,
    __asyncDelegator: __asyncDelegator,
    __asyncValues: __asyncValues,
    __makeTemplateObject: __makeTemplateObject,
    __importStar: __importStar,
    __importDefault: __importDefault,
    __classPrivateFieldGet: __classPrivateFieldGet,
    __classPrivateFieldSet: __classPrivateFieldSet
  });

  var store_module = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var factories = [];
    var pipes = [];

    var StoreModule = function (_super) {
      tslib_es6.__extends(StoreModule, _super);

      function StoreModule() {
        return _super !== null && _super.apply(this, arguments) || this;
      }

      StoreModule.meta = {
        declarations: tslib_es6.__spreadArrays(factories, pipes),
        exports: tslib_es6.__spreadArrays(factories, pipes)
      };
      return StoreModule;
    }(rxcomp__default.Module);

    exports.default = StoreModule;
  });
  unwrapExports(store_module);

  var store = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var local_storage_service_1 = tslib_es6.__importDefault(localStorage_service);

    var session_storage_service_1 = tslib_es6.__importDefault(sessionStorage_service);

    function _busy(store) {
      return rxjs__default.of(null).pipe(operators__default.filter(function () {
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
            local_storage_service_1.default.set(store.key, draft);
          }

          if (store.type === StoreType.Session) {
            session_storage_service_1.default.set(store.key, draft);
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

        return rxjs__default.of();
      };
    }

    function _getState(store, callback) {
      return rxjs__default.of(null).pipe(operators__default.map(function () {
        var value = null;

        if (store.type === StoreType.Local) {
          value = local_storage_service_1.default.get(store.key);

          if (value && typeof callback === 'function') {
            value = callback(value);
          }
        } else if (store.type === StoreType.Session) {
          value = session_storage_service_1.default.get(store.key);

          if (value && typeof callback === 'function') {
            value = callback(value);
          }
        }

        return value;
      }), operators__default.filter(function (x) {
        return x !== null;
      }));
    }

    function makeSetState(state) {
      return function (callback) {
        state.next(immer__default.produce(state.getValue(), function (draft) {
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
    })(StoreType = exports.StoreType || (exports.StoreType = {}));

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
        var state_ = new rxjs__default.BehaviorSubject(state);
        this.setState = makeSetState(state_);
        this.state$ = state_.asObservable();
      }

      Object.defineProperty(Store.prototype, "state", {
        set: function set(callback) {
          this.setState(callback);
        },
        enumerable: true,
        configurable: true
      });

      Store.prototype.setState = function (callback) {};

      return Store;
    }();

    exports.Store = Store;

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

    exports.useStore = useStore;
  });
  unwrapExports(store);
  var store_1 = store.StoreType;
  var store_2 = store.Store;
  var store_3 = store.useStore;

  var rxcompStore = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.LocalStorageService = localStorage_service.default;
    exports.SessionStorageService = sessionStorage_service.default;
    exports.StoreModule = store_module.default;
    exports.Store = store.Store;
    exports.StoreType = store.StoreType;
    exports.useStore = store.useStore;
  });
  unwrapExports(rxcompStore);
  var rxcompStore_1 = rxcompStore.LocalStorageService;
  var rxcompStore_2 = rxcompStore.SessionStorageService;
  var rxcompStore_3 = rxcompStore.StoreModule;
  var rxcompStore_4 = rxcompStore.Store;
  var rxcompStore_5 = rxcompStore.StoreType;
  var rxcompStore_6 = rxcompStore.useStore;

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
          return rxjs.throwError("simulated error " + id);
        }));
      }

      return rxjs.of({
        id: id,
        name: PROGRESSIVE_INDEX++ + " item " + id
      }).pipe(operators.delay(DELAY * Math.random()));
    };

    ApiService.clearItems$ = function clearItems$(url) {
      return rxjs.of([]).pipe(operators.delay(DELAY * Math.random()));
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

    TodoService.clearItems$ = function clearItems$() {
      return busy().pipe(operators.switchMap(function () {
        return ApiService.clearItems$('url').pipe(operators.tap(function (items) {
          return setState$1(function (state) {
            return state.todolist = items;
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
        _this.state = state;

        _this.pushChanges();

        console.log('call', c++);
      });
      TodoService.loadWithCache$().pipe(operators.first()).subscribe(console.log);
    };

    _proto.onToggle = function onToggle(item) {
      TodoService.toggleCompleted$(item).subscribe(console.log);
    };

    _proto.onAddItem = function onAddItem() {
      TodoService.addItem$().subscribe(console.log);
    };

    _proto.onClearItems = function onClearItems() {
      TodoService.clearItems$().subscribe(console.log);
    };

    _proto.removeItem = function removeItem(id) {
      TodoService.removeItem$(id).subscribe(console.log);
    };

    _proto.clearCookie = function clearCookie() {
      CookieStorageService.clear();
    };

    _proto.clearLocalStorage = function clearLocalStorage() {
      rxcompStore_1.clear();
    };

    _proto.clearSessionStorage = function clearSessionStorage() {
      rxcompStore_2.clear();
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

  var AppModule = function (_Module) {
    _inheritsLoose(AppModule, _Module);

    function AppModule() {
      return _Module.apply(this, arguments) || this;
    }

    return AppModule;
  }(rxcomp.Module);
  AppModule.meta = {
    imports: [rxcomp.CoreModule, StoreModule],
    declarations: [CounterComponent],
    bootstrap: AppComponent
  };

  rxcomp.Browser.bootstrap(AppModule);

}(rxcomp, rxjs.operators, rxjs, immer));
