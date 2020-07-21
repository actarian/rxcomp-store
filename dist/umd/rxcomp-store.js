/**
 * @license rxcomp-store v1.0.0-beta.10
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxcomp'), require('immer'), require('rxjs'), require('rxjs/operators')) :
	typeof define === 'function' && define.amd ? define(['exports', 'rxcomp', 'immer', 'rxjs', 'rxjs/operators'], factory) :
	(global = global || self, factory((global.rxcomp = global.rxcomp || {}, global.rxcomp.form = {}), global.rxcomp, global.immer, global.rxjs, global.rxjs.operators));
}(this, (function (exports, rxcomp, immer, rxjs, operators) { 'use strict';

	var LocalStorageService = /*#__PURE__*/function () {
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
	              // Circular reference found, discard key
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

	var SessionStorageService = /*#__PURE__*/function () {
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
	      } catch (error) {
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
	              // Circular reference found, discard key
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

	var factories = [];
	var pipes = [];
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

	var StoreModule = /*#__PURE__*/function (_Module) {
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

	      if (store.type === exports.StoreType.Local) {
	        LocalStorageService.set(store.key, draft); // console.log('setState.LocalStorageService.set', store.key, draft);
	      }

	      if (store.type === exports.StoreType.Session) {
	        SessionStorageService.set(store.key, draft); // console.log('setState.SessionStorageService.set', store.key, draft);
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

	    if (store.type === exports.StoreType.Local) {
	      value = LocalStorageService.get(store.key);

	      if (value && typeof callback === 'function') {
	        value = callback(value);
	      } // console.log('getLocal.LocalStorageService.get', store.key, value);

	    } else if (store.type === exports.StoreType.Session) {
	      value = SessionStorageService.get(store.key);

	      if (value && typeof callback === 'function') {
	        value = callback(value);
	      } // console.log('getLocal.SessionStorageService.get', store.key, value);

	    }

	    return value;
	  }), operators.filter(function (x) {
	    // console.log('value', x);
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

	(function (StoreType) {
	  StoreType[StoreType["Memory"] = 1] = "Memory";
	  StoreType[StoreType["Session"] = 2] = "Session";
	  StoreType[StoreType["Local"] = 3] = "Local";
	})(exports.StoreType || (exports.StoreType = {}));
	var Store = /*#__PURE__*/function () {
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

	exports.LocalStorageService = LocalStorageService;
	exports.SessionStorageService = SessionStorageService;
	exports.Store = Store;
	exports.StoreModule = StoreModule;
	exports.useStore = useStore;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
