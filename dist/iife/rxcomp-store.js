/**
 * @license rxcomp-store v1.0.0-beta.13
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

this.rxcomp=this.rxcomp||{};this.rxcomp.store=(function(exports,rxcomp,operators,rxjs,immer){'use strict';function _defineProperties(target, props) {
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
}var StorageService = function () {
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
StorageService.supported = false;var CookieStorageService = function (_StorageService) {
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
CookieStorageService.items$ = new rxjs.ReplaySubject(1);var CookieStorageComponent = function (_Component) {
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
};var LocalStorageService = function (_StorageService) {
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
LocalStorageService.items$ = new rxjs.ReplaySubject(1);var LocalStorageComponent = function (_Component) {
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
};var SessionStorageService = function (_StorageService) {
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
SessionStorageService.items$ = new rxjs.ReplaySubject(1);var SessionStorageComponent = function (_Component) {
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
};var factories = [CookieStorageComponent, LocalStorageComponent, SessionStorageComponent];
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
};(function (StoreType) {
  StoreType[StoreType["Memory"] = 1] = "Memory";
  StoreType[StoreType["Session"] = 2] = "Session";
  StoreType[StoreType["Local"] = 3] = "Local";
  StoreType[StoreType["Cookie"] = 4] = "Cookie";
})(exports.StoreType || (exports.StoreType = {}));
var Store = function () {
  function Store(state, type, key) {
    if (state === void 0) {
      state = {};
    }

    if (type === void 0) {
      type = exports.StoreType.Memory;
    }

    if (key === void 0) {
      key = 'store';
    }

    this.cancel$ = new rxjs.Subject();
    this.type = type;
    this.key = "rxcomp_" + key;
    state.busy = false;
    state.error = null;
    var state_ = new rxjs.BehaviorSubject(state);
    this.next = makeNext(state_);
    this.nextError = makeNextError(state_);
    this.select = makeSelect(state_);
    this.state$ = state_.asObservable();
  }

  var _proto = Store.prototype;

  _proto.busy$ = function busy$() {
    var _this = this;

    return rxjs.of(null).pipe(operators.filter(function () {
      var busy = _this.select(function (state) {
        return state.busy;
      });

      if (!busy) {
        _this.state = function (draft) {
          draft.busy = true;
          draft.error = null;
          draft.retry = null;
        };

        return true;
      } else {
        return false;
      }
    }), operators.takeUntil(this.cancel$));
  };

  _proto.cached$ = function cached$(callback) {
    var _this2 = this;

    return rxjs.of(null).pipe(operators.map(function () {
      var value = null;

      if (_this2.type === exports.StoreType.Local) {
        value = LocalStorageService.get(_this2.key);
      } else if (_this2.type === exports.StoreType.Session) {
        value = SessionStorageService.get(_this2.key);
      } else if (_this2.type === exports.StoreType.Cookie) {
        value = CookieStorageService.get(_this2.key);
      }

      if (value && typeof callback === 'function') {
        value = callback(value);
      }

      return value;
    }), operators.filter(function (x) {
      return x != null;
    }));
  };

  _proto.select$ = function select$(callback) {
    return this.state$.pipe(operators.map(callback), operators.distinctUntilChanged());
  };

  _proto.select = function select(callback) {};

  _proto.next = function next(callback) {};

  _proto.nextError = function nextError(error) {
    return rxjs.of();
  };

  _proto.reducer = function reducer(_reducer) {
    var _this3 = this;

    return function (source) {
      return rxjs.defer(function () {
        return source.pipe(operators.map(function (data) {
          if (typeof _reducer === 'function') {
            _this3.state = function (draft) {
              draft.error = null;
              draft.retry = null;

              _reducer(data, draft);

              draft.busy = false;

              if (_this3.type === exports.StoreType.Local) {
                LocalStorageService.set(_this3.key, draft);
              }

              if (_this3.type === exports.StoreType.Session) {
                SessionStorageService.set(_this3.key, draft);
              }

              if (_this3.type === exports.StoreType.Cookie) {
                CookieStorageService.set(_this3.key, draft, 365);
              }
            };
          }

          return data;
        }));
      });
    };
  };

  _proto.retryState = function retryState(times, delay) {
    var _this4 = this;

    if (times === void 0) {
      times = 3;
    }

    if (delay === void 0) {
      delay = 1000;
    }

    return function (source) {
      return rxjs.defer(function () {
        var i = 0;
        return source.pipe(operators.retryWhen(function (errors) {
          return errors.pipe(operators.delayWhen(function () {
            return rxjs.timer(delay);
          }), operators.switchMap(function (error) {
            if (i < times) {
              i++;

              _this4.state = function (draft) {
                draft.retry = i;
              };

              return rxjs.of(i);
            } else {
              return rxjs.throwError(error);
            }
          }));
        }));
      });
    };
  };

  _proto.catchState = function catchState(errorReducer) {
    var _this5 = this;

    return function (source) {
      return rxjs.defer(function () {
        return source.pipe(operators.takeUntil(_this5.cancel$.pipe(operators.tap(function () {
          _this5.state = function (draft) {
            draft.busy = false;
            draft.retry = null;
          };
        }))), operators.catchError(function (error) {
          _this5.state = function (draft) {
            draft.error = error;
            draft.busy = false;
            draft.retry = null;
          };

          if (typeof errorReducer === 'function') {
            error = errorReducer(error);
          } else {
            error = null;
          }

          return error ? rxjs.of(error) : rxjs.of();
        }));
      });
    };
  };

  _proto.cancel = function cancel() {
    this.cancel$.next();
  };

  _createClass(Store, [{
    key: "state",
    get: function get() {
      return this.select(function (draft) {
        return draft;
      });
    },
    set: function set(callback) {
      this.next(callback);
    }
  }]);

  return Store;
}();
function useStore(state, type, key) {
  var store = new Store(state, type, key);
  return {
    state$: store.state$,
    busy$: store.busy$.bind(store),
    cached$: store.cached$.bind(store),
    select$: store.select$.bind(store),
    select: store.select.bind(store),
    next: store.next.bind(store),
    nextError: store.nextError.bind(store),
    reducer: store.reducer.bind(store),
    catchState: store.catchState.bind(store),
    retryState: store.retryState.bind(store),
    cancel: store.cancel.bind(store)
  };
}

function makeNext(state) {
  return function (callback) {
    state.next(immer.produce(state.getValue(), function (draft) {
      if (typeof callback === 'function') {
        callback(draft);
      }

      return draft;
    }));
  };
}

function makeNextError(state) {
  return function (error) {
    state.next(immer.produce(state.getValue(), function (draft) {
      draft.error = error;
      draft.busy = false;
      draft.retry = null;
      return draft;
    }));
    return rxjs.of(error);
  };
}

function makeSelect(state) {
  return function (callback) {
    return callback(state.getValue());
  };
}exports.CookieStorageComponent=CookieStorageComponent;exports.CookieStorageService=CookieStorageService;exports.LocalStorageComponent=LocalStorageComponent;exports.LocalStorageService=LocalStorageService;exports.SessionStorageComponent=SessionStorageComponent;exports.SessionStorageService=SessionStorageService;exports.Store=Store;exports.StoreModule=StoreModule;exports.useStore=useStore;return exports;}({},rxcomp,rxjs.operators,rxjs,immer));