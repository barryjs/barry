var events = require('events'),
    util = require('util'),
    _ = require('lodash');

var DictionaryService = function () {
  var self = this;

  this._value = {};

  this.listeners = {};

  this.on('assign', function (keys) {
    self.handleAssign(keys);
  });
};

util.inherits(DictionaryService, events.EventEmitter);

DictionaryService.prototype.extend = function () {
  var self = this;

  var args = Array.prototype.slice.apply(arguments);
  args.forEach(function (arg) {
    for (var name in arg) {
      if (self._value[name] !== arg[name]) {
        self._value[name] = arg[name];
      }
    }
  });
};

DictionaryService.prototype.get = function (key) {
  return this._value[key];
};

DictionaryService.prototype.set = function (key, newValue) {
  var oldValue = this._value[key];
  this._value[key] = newValue;
  if (newValue !== oldValue) {
    this.emit('assign', [key]);
  }
};

DictionaryService.prototype.unset = function (key) {
  delete this._value[key];
  
};

DictionaryService.prototype.load = function (req, callback) {
  var key = req.params.key;
  if (key.indexOf("*") !== -1 || key.indexOf("?") !== -1) {
    var filter = globStringToRegex(key);

    var obj = _.pick(this._value, function (val, key) {
      return key.match(filter);
    });
    callback(null, obj);
  } else {
    callback(null, this._value[key]);
  }
};

DictionaryService.prototype.subscribe = function (req, callback) {
  if ("function" !== typeof req.handler) {
    callback(new Error("Invalid subscription handler"));
    return;
  }
  var key = req.params.key;
  var filter;
  if (key.indexOf("*") !== -1 || key.indexOf("?") !== -1) {
    var regex = globStringToRegex(key);

    filter = function (key) {
      key = ""+key;
      return key.match(regex);
    };
  } else {
    filter = key;
  }
  this.listeners[req.handlerId] = {
    filter: filter,
    handler: req.handler
  };
  callback(null);
};

DictionaryService.prototype.unsubscribe = function (req, callback) {
  delete this.listeners[req.handlerId];
  callback(null);
};

DictionaryService.prototype.handleAssign = function (keys) {
  var self = this;

  Object.keys(self.listeners).forEach(function (key) {
    var listener = self.listeners[key];

    var obj;
    if ("string" === typeof listener.filter) {
      if (keys.indexOf(listener.filter) !== -1) {
        obj[listener.filter] = this._value[listener.filter];
      }
    } else if ("function" === typeof listener.filter) {
      var needed = _.filter(keys, listener.filter);
      if (needed.length) {
        obj = _.pick(self._value, needed);
      }
    }
    if (!_.isEmpty(obj)) {
      listener.handler({
        op: "assign",
        v: obj
      });
    }
  });
};

function globStringToRegex(str) {
  return new RegExp("^"+quoteRegex(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.')+"$", 'ig');
}
function quoteRegex(str, delimiter) {
  return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

exports.DictionaryService = DictionaryService;
