var events = require('events'),
    util = require('util');

var ScalarService = function () {
  var self = this;

  this._value = undefined;

  this.__defineGetter__("value", function () { return this.get(); });
  this.__defineSetter__("value", function (x) { return this.set(x); });

  this.listeners = {};

  this.on('change', function (newValue, oldValue) {
    Object.keys(self.listeners).forEach(function (clientId) {
      var handler = self.listeners[clientId];
      handler({
        op: "set",
        v: newValue
      });
    });
  });
};

util.inherits(ScalarService, events.EventEmitter);

ScalarService.prototype.get = function () {
  return this._value;
};

ScalarService.prototype.set = function (newValue) {
  var oldValue = this._value;
  this._value = newValue;
  if (newValue !== oldValue) {
    this.emit('change', newValue, oldValue);
  }
};

ScalarService.prototype.load = function (req, callback) {
  callback(null, this._value);
};

ScalarService.prototype.subscribe = function (req, callback) {
  if ("function" !== typeof req.handler) {
    callback(new Error("Invalid subscription handler"));
    return;
  }
  this.listeners[req.clientId] = req.handler;
  callback(null);
};

ScalarService.prototype.unsubscribe = function (req, callback) {
  delete this.listeners[req.clientId];
  callback(null);
};

exports.ScalarService = ScalarService;
