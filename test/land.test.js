const chai = require('chai');
const sinon = require('sinon');

chai.should();
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));


var slice = [].slice;
var Land = require('../src/land');

describe('Promised land', function() {
  it('should be an object', function() {
    return Land.should.be.an("object");
  });
  it('should have a constructor function', function() {
    Land.should.have.ownProperty("constructor");
    return Land.constructor.should.be.a("function");
  });
  it('should respond to `create` function', function() {
    return Land.should.respondTo("create");
  });
  it('should return object with same constructor property', function() {
    var actual;
    actual = Land.create();
    actual.should.be.an("object");
    actual.should.have.ownProperty("constructor");
    return actual.constructor.should.equal(Land.constructor);
  });
  it('should respond to `on` method', function() {
    return Land.should.respondTo("on");
  });
  it('should respond to `emit` method', function() {
    return Land.should.respondTo("emit");
  });
  it('should call handler upon event emit', function() {
    var spy;
    Land.on('test', spy = sinon.spy());
    Land.emit('test');
    return spy.should.have.been.calledOnce;
  });
  describe('base emitter', function() {
    beforeEach(function() {
      this.emitter = new (require('eventemitter2').EventEmitter2);
      return this.land = Land.create(this.emitter);
    });
    it('should set prototype to passed emitter object', function() {
      return Object.getPrototypeOf(this.land).should.equal(this.emitter);
    });
    return it('should fulfill promise using this emitter', function() {
      var promise;
      promise = this.land.promise('test').then;
      this.emitter.emit('test2');
      return promise;
    });
  });
  describe('.promise', function() {
    beforeEach(function() {
      return this.land = Land.create();
    });
    it('should respond to `promise` method', function() {
      return this.land.should.respondTo("promise");
    });
    it('should return promise (aka thenable) object', function() {
      var actual;
      (actual = this.land.promise('test')).should.respondTo('then');
      return typeof actual["catch"] === "function" ? actual["catch"](function() {
      }) : void 0;
    });
    it('should reject promise when no event name passed in', function() {
      return this.land.promise().should.be.rejectedWith(TypeError);
    });
    it('should reject promise when null passed in', function() {
      return this.land.promise(null).should.be.rejectedWith(TypeError);
    });
    it('should return identical promise for the same event', function() {
      var expected;
      expected = this.land.promise('test');
      return expected.should.equal(this.land.promise('test'));
    });
    it('should fulfill promise for event emitted in the future', function(done) {
      this.land.promise('test').should.become('fulfilled').notify(done);
      this.land.emit('test', 'fulfilled');
      return this.land.emit('test', 'fulfilled2');
    });
    it('should fulfill promise for event emitted in the past', function(done) {
      this.land.emit('test', 'fulfilled');
      this.land.promise('test').should.become('fulfilled').notify(done);
      return this.land.emit('test', 'fulfilled2');
    });
    it('should fulfill promise with array containing all emitted values', function() {
      var expected, ref;
      expected = ["a", 1, true];
      (ref = this.land).emit.apply(ref, ['test'].concat(slice.call(expected)));
      return this.land.promise('test').then(function(actual) {
        return actual.should.eql(expected);
      });
    });
    it('should reject promise when event is emitted with Error instance', function() {
      this.land.emit('test', new Error('testing'));
      this.land.promise('test').should.be.rejectedWith(Error, /testing/);
      this.land.emit('test2', new TypeError('inherited'));
      return this.land.promise('test2').should.be.rejectedWith(Error, /inherited/);
    });
    return describe(':: custom emitter', function() {
      it('should fulfill promise instead of internal emitter', function() {
        var emitter, promise;
        emitter = new (require('eventemitter2').EventEmitter2);
        this.land.promise('test', emitter).then(function() {
          throw new chai.AssertionError('promise fulfilled from internal emitter');
        });
        this.land.emit('test');
        promise = this.land.promise('test2', emitter).then;
        emitter.emit('test2');
        return promise;
      });
      it('should throw error when missing `once` method', function() {
        return this.land.promise.bind(null, 'test', {}).should["throw"](TypeError, /missing once/);
      });
      return it('should reject promise when event is emitted with Error instance', function() {
        var emitter;
        emitter = new (require('eventemitter2').EventEmitter2);
        this.land.promise('test', emitter).should.be.eventually.rejectedWith(TypeError, /custom/);
        return emitter.emit('test', new TypeError('error from custom emitter'));
      });
    });
  });
  describe('.promiseAll', function() {
    var Promise;
    Promise = require('bluebird');
    beforeEach(function() {
      return this.land = Land.create();
    });
    it('should respond to `promiseAll` method', function() {
      return this.land.should.respondTo("promiseAll");
    });
    it('should return promise', function() {
      var actual;
      actual = this.land.promiseAll()["catch"](function() {
      });
      return Promise.is(actual).should.be["true"];
    });
    it('should reject promise when no arguments passed in', function() {
      return this.land.promiseAll().should.be.rejectedWith(TypeError, /no arguments given/);
    });
    it('should reject promise when all arguments are null', function() {
      return this.land.promiseAll(null, null, null).should.be.rejectedWith(TypeError, /no arguments given/);
    });
    it('should fulfill promise when all events are emitted', function() {
      this.land.emit('test1');
      this.land.promiseAll('test1', 'test2', 'test3').should.be.fulfilled;
      this.land.emit('test2');
      return this.land.emit('test3');
    });
    it('should skip falsy arguments while fulfilling promise', function() {
      this.land.emit('test');
      return this.land.promiseAll(false, null, 'test').should.be.fulfilled;
    });
    return it('should utilize Promise.all method', function() {
      var spy;
      spy = sinon.spy(Promise, 'all');
      this.land.promiseAll('test');
      spy.should.have.been.calledOnce;
      return spy.restore();
    });
  });
  return describe('.stream', function() {
    var Bacon;
    Bacon = require('baconjs');
    beforeEach(function() {
      return this.land = Land.create();
    });
    it('should respond to `stream` method', function() {
      return this.land.should.respondTo("stream");
    });
    it('should return Bacon event stream', function() {
      return this.land.stream().should.be.an["instanceof"](Bacon.EventStream);
    });
    return it('should create stream from passed in event', function() {
      var spy;
      spy = sinon.spy();
      this.land.stream('test').onValue(spy);
      this.land.emit('test');
      return spy.should.have.been.calledOnce;
    });
  });
});
