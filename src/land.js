'use strict';
var PromisedLand;

PromisedLand = function(opts) {
  var $emit, emitter, land, promiseResolver, promises;
  if (typeof (typeof emitter !== "undefined" && emitter !== null ? emitter.emit : void 0) !== 'function') {
    land = emitter = Object.create(EventEmitter.prototype);
    EventEmitter.call(land, {
      wildcard: false
    });
  } else {
    land = Object.create(emitter);
  }
  land.constructor = PromisedLand;
  promises = Object.create(null);
  land.promise = function(ev) {
    var promise;
    if (!(arguments.length && ev !== null)) {
      return Promise.reject(new TypeError('missing event argument for promise call'));
    }
    if (promise = promises[ev]) {
      return promise;
    }
    return promises[ev] = new Promise(function(resolve, reject) {
      return land.once(ev, function(val) {
        return promiseResolver(val, resolve, reject);
      });
    });
  };
  land.promiseAll = function() {
    var list;
    Array.prototype.reduce.call(arguments, function(list, ev) {
      ev && list.push(land.promise(ev));
      return list;
    }, list = []);
    if (!list.length) {
      return Promise.reject(new TypeError('no arguments given for promiseAll call'));
    }
    return Promise.all(list);
  };
  land.promiseNow = function(ev, customEmitter) {
    var hasOn, hasOnce;
    if (typeof customEmitter !== "object") {
      throw new TypeError('missing emitter object');
    }
    if (!(hasOnce = (typeof customEmitter.once === "function") && (hasOn = typeof customEmitter.on === "function"))) {
      throw new TypeError('specified emitter is missing once or on method');
    }
    return new Promise(function(resolve, reject) {
      var handler;
      handler = function(val) {
        return promiseResolver(val, resolve, reject);
      };
      if (hasOnce) {
        return customEmitter.once(ev, handler);
      } else if (hasOn) {
        return customEmitter.on(ev, handler);
      }
    });
  };
  promiseResolver = function(value, resolve, reject) {
    if (value instanceof Error) {
      return reject(value);
    } else {
      return resolve(value);
    }
  };
  land.stream = function(ev) {
    return Bacon.fromEventTarget(this, ev);
  };
  $emit = land.emit;
  land.emit = function(ev) {
    var value;
    if (!promises[ev]) {
      value = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : arguments[1];
      promises[ev] = new Promise(promiseResolver.bind(null, value));
    }
    return $emit.apply(land, arguments);
  };
  return land;
};

module.exports = PromisedLand();

module.exports.create = function(emitter) {
  return PromisedLand(emitter);
};


