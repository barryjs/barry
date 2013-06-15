var barry =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function require(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(null, module, module.exports, require);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// The bundle contains no chunks. A empty chunk loading function.
/******/ 	require.e = function requireEnsure(_, callback) {
/******/ 		callback.call(null, require);
/******/ 	};
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	require.modules = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	require.cache = installedModules;
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return require(0);
/******/ })
/************************************************************************/
/******/ ({
/******/ // __webpack_public_path__
/******/ c: "",

/***/ 0:
/***/ function(module, exports, require) {

	eval("var barry = module.exports = require(1).Barry;\n\n// Angular.js Integration\nif (angular) {\n  var barryModule = angular.module('barry', []);\n\n  barryModule.provider('$barry', function () {\n    var defaultEndpoint = '/';\n\n    this.setDefaultEndpoint = function (ep) {\n      defaultEndpoint = ep;\n    };\n\n    this.$get = function () {\n      return barry.endpoint(defaultEndpoint);\n    };\n  });\n\n  barry.Consumer.prototype.toScope = function ($scope, key) {\n    var self = this;\n\n    self.init();\n\n    function updateMeta() {\n      $scope[\"$barry\"] = $scope[\"$barry\"] || {};\n      $scope[\"$barry\"][key] = {\n        url: self.url,\n        loaded: self.loaded\n      };\n    }\n\n    self.on('update', function (model) {\n      function processUpdate() {\n        $scope[key] = model;\n        updateMeta();\n      }\n      if ($scope.$$phase) processUpdate();\n      else $scope.$apply(processUpdate);\n    });\n    self.on('beforeload', function () {\n      updateMeta();\n    });\n\n    $scope.$on('$destroy', function () {\n      self.unsubscribe();\n    });\n\n    return this;\n  };\n}\n\n\n\n// WEBPACK FOOTER\n// module.id = 0\n// module.readableIdentifier = ./src/webpack.js\n//@ sourceURL=webpack-module:///./src/webpack.js");

/***/ },

/***/ 1:
/***/ function(module, exports, require) {

	eval("var namespace = require(2).global;\nvar TransportManager = require(3);\nvar Endpoint = require(4).Endpoint;\nvar Consumer = require(5).Consumer;\n\nvar Barry = namespace;\n\nBarry.endpoint = function (Transport, ep) {\n  // Simplified syntax (uses default transport:\n  //   barry.endpoint(endpoint);\n  if (!ep) {\n    ep = Transport;\n    Transport = TransportManager.getDefaultTransport();\n\n    if (!Transport)\n      throw new Error(\"Barry.endpoint: No transports available\");\n  }\n\n  if (\"string\" === typeof Transport) {\n    Transport = TransportManager.getTransport(Transport);\n  }\n\n  if (!Transport) throw new Error(\"Barry.endpoint: Invalid transport\");\n\n  return new Endpoint(new Transport(ep));\n};\n\n// Load default built-in transports\nrequire(6);\n\nBarry.transports = TransportManager;\nBarry.Endpoint = Endpoint;\nBarry.Consumer = Consumer;\n\nexports.Barry = Barry;\n\n\n// WEBPACK FOOTER\n// module.id = 1\n// module.readableIdentifier = ./src/barry.js\n//@ sourceURL=webpack-module:///./src/barry.js");

/***/ },

/***/ 2:
/***/ function(module, exports, require) {

	eval("var Namespace = function () {};\n\nexports.global = Namespace.prototype;\nexports.Namespace = Namespace;\n\n\n// WEBPACK FOOTER\n// module.id = 2\n// module.readableIdentifier = ./src/namespace.js\n//@ sourceURL=webpack-module:///./src/namespace.js");

/***/ },

/***/ 3:
/***/ function(module, exports, require) {

	eval("var Manager = module.exports = {\n  transports: [],\n  transportsByName: {},\n  registerTransport: function (transport) {\n    Manager.transports.push(transport);\n    Manager.transportsByName[transport.name] = transport;\n  },\n  getDefaultTransport: function () {\n    return Manager.transports[0] || false;\n  },\n  getTransport: function (name) {\n    return Manager.transportsByName[name] || false;\n  }\n};\n\n\n// WEBPACK FOOTER\n// module.id = 3\n// module.readableIdentifier = ./src/transports/manager.js\n//@ sourceURL=webpack-module:///./src/transports/manager.js");

/***/ },

/***/ 4:
/***/ function(module, exports, require) {

	eval("var Consumer = require(5).Consumer;\nvar extend = require(9);\n\nvar Endpoint = function (transport)\n{\n  var self = this;\n\n  this.transport = transport;\n  this.consumers = {};\n  this.callbacks = [];\n  this.subscribers = [];\n  this.subscribersByUrl = {};\n\n  this.uniqueId = 0;\n\n  transport.on('barry', function (res) {\n    if (\"number\" === typeof res.id ||\n        \"function\" === typeof self.callbacks[res.id]) {\n      self.callbacks[res.id](res.error, res.result);\n    }\n\n    if (res.method === \"update\") {\n      self.delegateUpdate(res.params.shift(), res.params);\n    }\n  });\n};\n\nEndpoint.prototype.emit = function ()\n{\n  var args = Array.prototype.slice.call(arguments);\n  this.transport.emit.apply(this.transport, args);\n};\n\nEndpoint.prototype.call = function (req, callback)\n{\n  var rpc = { jsonrpc: \"2.0\" };\n  extend(rpc, req);\n\n  if (\"function\" === typeof callback) {\n    rpc.id = this.callbacks.length;\n    this.callbacks.push(callback);\n  }\n\n  this.transport.emit('barry', rpc);\n};\n\nEndpoint.prototype.subscribe = function (url, handler, callback)\n{\n  var id = this.uniqueId++;\n  this.subscribers[id] = handler;\n  this.subscribersByUrl[url] = id;\n  this.call({\n    method: 'subscribe',\n    url: url,\n    subId: id\n  }, callback);\n};\n\nEndpoint.prototype.unsubscribe = function (url, handler, callback)\n{\n  var id = this.subscribersByUrl[url];\n  this.call({\n    method: 'unsubscribe',\n    url: url,\n    subId: id\n  }, callback);\n};\n\nEndpoint.prototype.delegateUpdate = function (subId, ops)\n{\n  var handler = this.subscribers[subId];\n\n  if (\"function\" === typeof handler) {\n    handler(ops);\n  } else {\n    this.call({\n      method: 'unsubscribe',\n      subId: subId\n    });\n  }\n};\n\nEndpoint.prototype.consumer = function (url)\n{\n  // XXX More intelligent URL parsing. We could even have URLs that let you jump\n  //     to other endpoints or transports, e.g.\n  //\n  //     endpoint.consumer('//otherserver/bla')\n  //     endpoint.consumer('io://yetanotherserver/bla')\n\n  var c = this.consumers[url] = new Consumer(this, url);\n\n  return c;\n};\n\nexports.Endpoint = Endpoint;\n\n\n// WEBPACK FOOTER\n// module.id = 4\n// module.readableIdentifier = ./src/endpoint.js\n//@ sourceURL=webpack-module:///./src/endpoint.js");

/***/ },

/***/ 5:
/***/ function(module, exports, require) {

	eval("var events = require(7),\n    util = require(8);\n\nvar Consumer = function (endpoint, url)\n{\n  events.EventEmitter.call(this);\n\n  this.endpoint = endpoint;\n  this.url = url;\n\n  this.model = null;\n  this.loaded = false;\n  this.loading = false;\n  this.current = false;\n};\n\nutil.inherits(Consumer, events.EventEmitter);\n\n/**\n * Load initial data and subscribe in one call.\n */\nConsumer.prototype.init = function (callback)\n{\n  // XXX Should be its own atomic protocol message\n  this.subscribe();\n  this.load(callback);\n};\n\nConsumer.prototype.subscribe = function ()\n{\n  var self = this;\n\n  if (this.url) {\n    this.endpoint.subscribe(this.url, function (ops) {\n      ops.forEach(function (op) {\n        self.apply(op);\n      });\n    });\n  }\n};\n\nConsumer.prototype.unsubscribe = function ()\n{\n  var self = this;\n\n  if (this.url) {\n    this.endpoint.unsubscribe(this.url);\n  }\n};\n\nConsumer.prototype.load = function (callback)\n{\n  var self = this;\n\n  if (\"function\" !== typeof callback) {\n    callback = function () {};\n  }\n\n  if (this.url) {\n    this.loading = true;\n    this.emit('beforeload');\n    this.endpoint.call({\n      method: 'load',\n      url: this.url\n    }, function (err, res) {\n      if (err) {\n        callback(err);\n      } else {\n        self.loading = false;\n        self.loaded = true;\n        self.current = true;\n        self.model = res;\n        self.emit('update', res);\n        callback(null, res);\n      }\n    });\n  }\n};\n\nConsumer.prototype.apply = function (op)\n{\n  var modified = false;\n  switch (op.op) {\n  case 'set':\n    if (this.model !== op.v) modified = true;\n    this.model = op.v;\n    break;\n  case 'assign':\n    for (var key in op.v) {\n      if (this.model[key] !== op.v[key]) {\n        this.model[key] = op.v[key];\n        modified = true;\n      }\n    }\n    break;\n  }\n\n  if (modified) this.emit('update', this.model);\n};\n\nConsumer.prototype.setUrl = function (url)\n{\n  var self = this;\n  if (url !== this.url) {\n    this.unsubscribe();\n    this.url = url;\n    if (!url) this.model = '';\n    this.current = false;\n    self.emit('update', '');\n  }\n  this.init();\n};\n\nexports.Consumer = Consumer;\n\n\n// WEBPACK FOOTER\n// module.id = 5\n// module.readableIdentifier = ./src/consumer.js\n//@ sourceURL=webpack-module:///./src/consumer.js");

/***/ },

/***/ 6:
/***/ function(module, exports, require) {

	eval("if (\"undefined\" !== typeof io) {\n  var SocketIoTransport = function (ep) {\n    this.ep = ep;\n    this.socket = io.connect(ep);\n  };\n\n  SocketIoTransport.prototype.on = function (name, handler) {\n    return this.socket.on(name, handler);\n  };\n\n  SocketIoTransport.prototype.emit = function (name, data) {\n    return this.socket.emit(name, data);\n  };\n\n  require(3).registerTransport(SocketIoTransport);\n}\n\n\n// WEBPACK FOOTER\n// module.id = 6\n// module.readableIdentifier = ./src/transports/io.js\n//@ sourceURL=webpack-module:///./src/transports/io.js");

/***/ },

/***/ 7:
/***/ function(module, exports, require) {

	eval("var EventEmitter = exports.EventEmitter = function EventEmitter() {};\nvar isArray = require(10);\nvar indexOf = require(11);\n\n\n\n// By default EventEmitters will print a warning if more than\n// 10 listeners are added to it. This is a useful default which\n// helps finding memory leaks.\n//\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nvar defaultMaxListeners = 10;\nEventEmitter.prototype.setMaxListeners = function(n) {\n  if (!this._events) this._events = {};\n  this._maxListeners = n;\n};\n\n\nEventEmitter.prototype.emit = function(type) {\n  // If there is no 'error' event listener then throw.\n  if (type === 'error') {\n    if (!this._events || !this._events.error ||\n        (isArray(this._events.error) && !this._events.error.length))\n    {\n      if (arguments[1] instanceof Error) {\n        throw arguments[1]; // Unhandled 'error' event\n      } else {\n        throw new Error(\"Uncaught, unspecified 'error' event.\");\n      }\n      return false;\n    }\n  }\n\n  if (!this._events) return false;\n  var handler = this._events[type];\n  if (!handler) return false;\n\n  if (typeof handler == 'function') {\n    switch (arguments.length) {\n      // fast cases\n      case 1:\n        handler.call(this);\n        break;\n      case 2:\n        handler.call(this, arguments[1]);\n        break;\n      case 3:\n        handler.call(this, arguments[1], arguments[2]);\n        break;\n      // slower\n      default:\n        var args = Array.prototype.slice.call(arguments, 1);\n        handler.apply(this, args);\n    }\n    return true;\n\n  } else if (isArray(handler)) {\n    var args = Array.prototype.slice.call(arguments, 1);\n\n    var listeners = handler.slice();\n    for (var i = 0, l = listeners.length; i < l; i++) {\n      listeners[i].apply(this, args);\n    }\n    return true;\n\n  } else {\n    return false;\n  }\n};\n\n// EventEmitter is defined in src/node_events.cc\n// EventEmitter.prototype.emit() is also defined there.\nEventEmitter.prototype.addListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('addListener only takes instances of Function');\n  }\n\n  if (!this._events) this._events = {};\n\n  // To avoid recursion in the case that type == \"newListeners\"! Before\n  // adding it to the listeners, first emit \"newListeners\".\n  this.emit('newListener', type, listener);\n  if (!this._events[type]) {\n    // Optimize the case of one listener. Don't need the extra array object.\n    this._events[type] = listener;\n  } else if (isArray(this._events[type])) {\n\n    // If we've already got an array, just append.\n    this._events[type].push(listener);\n\n  } else {\n    // Adding the second element, need to change to array.\n    this._events[type] = [this._events[type], listener];\n  }\n\n  // Check for listener leak\n  if (isArray(this._events[type]) && !this._events[type].warned) {\n    var m;\n    if (this._maxListeners !== undefined) {\n      m = this._maxListeners;\n    } else {\n      m = defaultMaxListeners;\n    }\n\n    if (m && m > 0 && this._events[type].length > m) {\n      this._events[type].warned = true;\n      console.error('(events) warning: possible EventEmitter memory ' +\n                    'leak detected. %d listeners added. ' +\n                    'Use emitter.setMaxListeners() to increase limit.',\n                    this._events[type].length);\n      console.trace();\n    }\n  }\n  return this;\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.once = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('.once only takes instances of Function');\n  }\n\n  var self = this;\n  function g() {\n    self.removeListener(type, g);\n    listener.apply(this, arguments);\n  }\n\n  g.listener = listener;\n  self.on(type, g);\n\n  return this;\n};\n\nEventEmitter.prototype.removeListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('removeListener only takes instances of Function');\n  }\n\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (!this._events || !this._events[type]) return this;\n\n  var list = this._events[type];\n\n  if (isArray(list)) {\n    var position = -1;\n    for (var i = 0, length = list.length; i < length; i++) {\n      if (list[i] === listener ||\n          (list[i].listener && list[i].listener === listener))\n      {\n        position = i;\n        break;\n      }\n    }\n\n    if (position < 0) return this;\n    list.splice(position, 1);\n    if (list.length == 0)\n      delete this._events[type];\n  } else if (list === listener ||\n             (list.listener && list.listener === listener)) {\n    delete this._events[type];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.removeAllListeners = function(type) {\n  if (arguments.length === 0) {\n    this._events = {};\n    return this;\n  }\n\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (type && this._events && this._events[type]) this._events[type] = null;\n  return this;\n};\n\nEventEmitter.prototype.listeners = function(type) {\n  if (!this._events) this._events = {};\n  if (!this._events[type]) this._events[type] = [];\n  if (!isArray(this._events[type])) {\n    this._events[type] = [this._events[type]];\n  }\n  return this._events[type];\n};\n\n\n// WEBPACK FOOTER\n// module.id = 7\n// module.readableIdentifier = (webpack)/~/node-libs-browser/lib/events.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/lib/events.js");

/***/ },

/***/ 8:
/***/ function(module, exports, require) {

	eval("var events = require(7);\n\nvar isArray = require(10);\nvar Object_keys = require(12);\nvar Object_getOwnPropertyNames = require(13);\nvar Object_create = require(14);\nvar isRegExp = require(15);\n\nexports.isArray = isArray;\nexports.isDate = isDate;\nexports.isRegExp = isRegExp;\n\n\nexports.print = function () {};\nexports.puts = function () {};\nexports.debug = function() {};\n\nexports.inspect = function(obj, showHidden, depth, colors) {\n  var seen = [];\n\n  var stylize = function(str, styleType) {\n    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics\n    var styles =\n        { 'bold' : [1, 22],\n          'italic' : [3, 23],\n          'underline' : [4, 24],\n          'inverse' : [7, 27],\n          'white' : [37, 39],\n          'grey' : [90, 39],\n          'black' : [30, 39],\n          'blue' : [34, 39],\n          'cyan' : [36, 39],\n          'green' : [32, 39],\n          'magenta' : [35, 39],\n          'red' : [31, 39],\n          'yellow' : [33, 39] };\n\n    var style =\n        { 'special': 'cyan',\n          'number': 'blue',\n          'boolean': 'yellow',\n          'undefined': 'grey',\n          'null': 'bold',\n          'string': 'green',\n          'date': 'magenta',\n          // \"name\": intentionally not styling\n          'regexp': 'red' }[styleType];\n\n    if (style) {\n      return '\\033[' + styles[style][0] + 'm' + str +\n             '\\033[' + styles[style][1] + 'm';\n    } else {\n      return str;\n    }\n  };\n  if (! colors) {\n    stylize = function(str, styleType) { return str; };\n  }\n\n  function format(value, recurseTimes) {\n    // Provide a hook for user-specified inspect functions.\n    // Check that value is an object with an inspect function on it\n    if (value && typeof value.inspect === 'function' &&\n        // Filter out the util module, it's inspect function is special\n        value !== exports &&\n        // Also filter out any prototype objects using the circular check.\n        !(value.constructor && value.constructor.prototype === value)) {\n      return value.inspect(recurseTimes);\n    }\n\n    // Primitive types cannot have properties\n    switch (typeof value) {\n      case 'undefined':\n        return stylize('undefined', 'undefined');\n\n      case 'string':\n        var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n                                                 .replace(/'/g, \"\\\\'\")\n                                                 .replace(/\\\\\"/g, '\"') + '\\'';\n        return stylize(simple, 'string');\n\n      case 'number':\n        return stylize('' + value, 'number');\n\n      case 'boolean':\n        return stylize('' + value, 'boolean');\n    }\n    // For some reason typeof null is \"object\", so special case here.\n    if (value === null) {\n      return stylize('null', 'null');\n    }\n\n    // Look up the keys of the object.\n    var visible_keys = Object_keys(value);\n    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;\n\n    // Functions without properties can be shortcutted.\n    if (typeof value === 'function' && keys.length === 0) {\n      if (isRegExp(value)) {\n        return stylize('' + value, 'regexp');\n      } else {\n        var name = value.name ? ': ' + value.name : '';\n        return stylize('[Function' + name + ']', 'special');\n      }\n    }\n\n    // Dates without properties can be shortcutted\n    if (isDate(value) && keys.length === 0) {\n      return stylize(value.toUTCString(), 'date');\n    }\n\n    var base, type, braces;\n    // Determine the object type\n    if (isArray(value)) {\n      type = 'Array';\n      braces = ['[', ']'];\n    } else {\n      type = 'Object';\n      braces = ['{', '}'];\n    }\n\n    // Make functions say that they are functions\n    if (typeof value === 'function') {\n      var n = value.name ? ': ' + value.name : '';\n      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';\n    } else {\n      base = '';\n    }\n\n    // Make dates with properties first say the date\n    if (isDate(value)) {\n      base = ' ' + value.toUTCString();\n    }\n\n    if (keys.length === 0) {\n      return braces[0] + base + braces[1];\n    }\n\n    if (recurseTimes < 0) {\n      if (isRegExp(value)) {\n        return stylize('' + value, 'regexp');\n      } else {\n        return stylize('[Object]', 'special');\n      }\n    }\n\n    seen.push(value);\n\n    var output = keys.map(function(key) {\n      var name, str;\n      if (value.__lookupGetter__) {\n        if (value.__lookupGetter__(key)) {\n          if (value.__lookupSetter__(key)) {\n            str = stylize('[Getter/Setter]', 'special');\n          } else {\n            str = stylize('[Getter]', 'special');\n          }\n        } else {\n          if (value.__lookupSetter__(key)) {\n            str = stylize('[Setter]', 'special');\n          }\n        }\n      }\n      if (visible_keys.indexOf(key) < 0) {\n        name = '[' + key + ']';\n      }\n      if (!str) {\n        if (seen.indexOf(value[key]) < 0) {\n          if (recurseTimes === null) {\n            str = format(value[key]);\n          } else {\n            str = format(value[key], recurseTimes - 1);\n          }\n          if (str.indexOf('\\n') > -1) {\n            if (isArray(value)) {\n              str = str.split('\\n').map(function(line) {\n                return '  ' + line;\n              }).join('\\n').substr(2);\n            } else {\n              str = '\\n' + str.split('\\n').map(function(line) {\n                return '   ' + line;\n              }).join('\\n');\n            }\n          }\n        } else {\n          str = stylize('[Circular]', 'special');\n        }\n      }\n      if (typeof name === 'undefined') {\n        if (type === 'Array' && key.match(/^\\d+$/)) {\n          return str;\n        }\n        name = JSON.stringify('' + key);\n        if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n          name = name.substr(1, name.length - 2);\n          name = stylize(name, 'name');\n        } else {\n          name = name.replace(/'/g, \"\\\\'\")\n                     .replace(/\\\\\"/g, '\"')\n                     .replace(/(^\"|\"$)/g, \"'\");\n          name = stylize(name, 'string');\n        }\n      }\n\n      return name + ': ' + str;\n    });\n\n    seen.pop();\n\n    var numLinesEst = 0;\n    var length = output.reduce(function(prev, cur) {\n      numLinesEst++;\n      if (cur.indexOf('\\n') >= 0) numLinesEst++;\n      return prev + cur.length + 1;\n    }, 0);\n\n    if (length > 50) {\n      output = braces[0] +\n               (base === '' ? '' : base + '\\n ') +\n               ' ' +\n               output.join(',\\n  ') +\n               ' ' +\n               braces[1];\n\n    } else {\n      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n    }\n\n    return output;\n  }\n  return format(obj, (typeof depth === 'undefined' ? 2 : depth));\n};\n\n\nfunction isDate(d) {\n  if (d instanceof Date) return true;\n  if (typeof d !== 'object') return false;\n  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);\n  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);\n  return JSON.stringify(proto) === JSON.stringify(properties);\n}\n\nfunction pad(n) {\n  return n < 10 ? '0' + n.toString(10) : n.toString(10);\n}\n\nvar months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',\n              'Oct', 'Nov', 'Dec'];\n\n// 26 Feb 16:19:34\nfunction timestamp() {\n  var d = new Date();\n  var time = [pad(d.getHours()),\n              pad(d.getMinutes()),\n              pad(d.getSeconds())].join(':');\n  return [d.getDate(), months[d.getMonth()], time].join(' ');\n}\n\nexports.log = function (msg) {};\n\nexports.pump = null;\n\nexports.inherits = function(ctor, superCtor) {\n  ctor.super_ = superCtor;\n  ctor.prototype = Object_create(superCtor.prototype, {\n    constructor: {\n      value: ctor,\n      enumerable: false,\n      writable: true,\n      configurable: true\n    }\n  });\n};\n\nvar formatRegExp = /%[sdj%]/g;\nexports.format = function(f) {\n  if (typeof f !== 'string') {\n    var objects = [];\n    for (var i = 0; i < arguments.length; i++) {\n      objects.push(exports.inspect(arguments[i]));\n    }\n    return objects.join(' ');\n  }\n\n  var i = 1;\n  var args = arguments;\n  var len = args.length;\n  var str = String(f).replace(formatRegExp, function(x) {\n    if (x === '%%') return '%';\n    if (i >= len) return x;\n    switch (x) {\n      case '%s': return String(args[i++]);\n      case '%d': return Number(args[i++]);\n      case '%j': return JSON.stringify(args[i++]);\n      default:\n        return x;\n    }\n  });\n  for(var x = args[i]; i < len; x = args[++i]){\n    if (x === null || typeof x !== 'object') {\n      str += ' ' + x;\n    } else {\n      str += ' ' + exports.inspect(x);\n    }\n  }\n  return str;\n};\n\n\n// WEBPACK FOOTER\n// module.id = 8\n// module.readableIdentifier = (webpack)/~/node-libs-browser/lib/util.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/lib/util.js");

/***/ },

/***/ 9:
/***/ function(module, exports, require) {

	eval("var hasOwn = Object.prototype.hasOwnProperty;\n\nfunction isPlainObject(obj) {\n\tif (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)\n\t\treturn false;\n\n\tvar has_own_constructor = hasOwnProperty.call(obj, 'constructor');\n\tvar has_is_property_of_method = hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf');\n\t// Not own constructor property must be Object\n\tif (obj.constructor && !has_own_constructor && !has_is_property_of_method)\n\t\treturn false;\n\n\t// Own properties are enumerated firstly, so to speed up,\n\t// if last one is own, then all properties are own.\n\tvar key;\n\tfor ( key in obj ) {}\n\n\treturn key === undefined || hasOwn.call( obj, key );\n};\n\nmodule.exports = function extend() {\n\tvar options, name, src, copy, copyIsArray, clone,\n\t    target = arguments[0] || {},\n\t    i = 1,\n\t    length = arguments.length,\n\t    deep = false;\n\n\t// Handle a deep copy situation\n\tif ( typeof target === \"boolean\" ) {\n\t\tdeep = target;\n\t\ttarget = arguments[1] || {};\n\t\t// skip the boolean and the target\n\t\ti = 2;\n\t}\n\n\t// Handle case when target is a string or something (possible in deep copy)\n\tif ( typeof target !== \"object\" && typeof target !== \"function\") {\n\t\ttarget = {};\n\t}\n\n\tfor ( ; i < length; i++ ) {\n\t\t// Only deal with non-null/undefined values\n\t\tif ( (options = arguments[ i ]) != null ) {\n\t\t\t// Extend the base object\n\t\t\tfor ( name in options ) {\n\t\t\t\tsrc = target[ name ];\n\t\t\t\tcopy = options[ name ];\n\n\t\t\t\t// Prevent never-ending loop\n\t\t\t\tif ( target === copy ) {\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\n\t\t\t\t// Recurse if we're merging plain objects or arrays\n\t\t\t\tif ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {\n\t\t\t\t\tif ( copyIsArray ) {\n\t\t\t\t\t\tcopyIsArray = false;\n\t\t\t\t\t\tclone = src && Array.isArray(src) ? src : [];\n\n\t\t\t\t\t} else {\n\t\t\t\t\t\tclone = src && isPlainObject(src) ? src : {};\n\t\t\t\t\t}\n\n\t\t\t\t\t// Never move original objects, clone them\n\t\t\t\t\ttarget[ name ] = extend( deep, clone, copy );\n\n\t\t\t\t// Don't bring in undefined values\n\t\t\t\t} else if ( copy !== undefined ) {\n\t\t\t\t\ttarget[ name ] = copy;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\n\t// Return the modified object\n\treturn target;\n};\n\n\n// WEBPACK FOOTER\n// module.id = 9\n// module.readableIdentifier = ./~/extend/index.js\n//@ sourceURL=webpack-module:///./~/extend/index.js");

/***/ },

/***/ 10:
/***/ function(module, exports, require) {

	eval("module.exports = typeof Array.isArray === 'function'\n    ? Array.isArray\n    : function (xs) {\n        return Object.prototype.toString.call(xs) === '[object Array]'\n    }\n;\n\n/*\n\nalternative\n\nfunction isArray(ar) {\n  return ar instanceof Array ||\n         Array.isArray(ar) ||\n         (ar && ar !== Object.prototype && isArray(ar.__proto__));\n}\n\n*/\n\n// WEBPACK FOOTER\n// module.id = 10\n// module.readableIdentifier = (webpack)/~/node-libs-browser/util/isArray.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/util/isArray.js");

/***/ },

/***/ 11:
/***/ function(module, exports, require) {

	eval("module.exports = function indexOf (xs, x) {\n    if (xs.indexOf) return xs.indexOf(x);\n    for (var i = 0; i < xs.length; i++) {\n        if (x === xs[i]) return i;\n    }\n    return -1;\n}\n\n\n// WEBPACK FOOTER\n// module.id = 11\n// module.readableIdentifier = (webpack)/~/node-libs-browser/util/indexOf.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/util/indexOf.js");

/***/ },

/***/ 12:
/***/ function(module, exports, require) {

	eval("module.exports = Object.keys || function objectKeys(object) {\n\tif (object !== Object(object)) throw new TypeError('Invalid object');\n\tvar result = [];\n\tfor (var name in object) {\n\t\tif (Object.prototype.hasOwnProperty.call(object, name)) {\n\t\t\tresult.push(name);\n\t\t}\n\t}\n\treturn result;\n};\n\n\n// WEBPACK FOOTER\n// module.id = 12\n// module.readableIdentifier = (webpack)/~/node-libs-browser/util/objectKeys.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/util/objectKeys.js");

/***/ },

/***/ 13:
/***/ function(module, exports, require) {

	eval("module.exports = Object.getOwnPropertyNames || function (obj) {\n    var res = [];\n    for (var key in obj) {\n        if (Object.hasOwnProperty.call(obj, key)) res.push(key);\n    }\n    return res;\n};\n\n// WEBPACK FOOTER\n// module.id = 13\n// module.readableIdentifier = (webpack)/~/node-libs-browser/util/objectGetOwnPropertyNames.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/util/objectGetOwnPropertyNames.js");

/***/ },

/***/ 14:
/***/ function(module, exports, require) {

	eval("module.exports = Object.create || function (prototype, properties) {\n    // from es5-shim\n    var object;\n    if (prototype === null) {\n        object = { '__proto__' : null };\n    }\n    else {\n        if (typeof prototype !== 'object') {\n            throw new TypeError(\n                'typeof prototype[' + (typeof prototype) + '] != \\'object\\''\n            );\n        }\n        var Type = function () {};\n        Type.prototype = prototype;\n        object = new Type();\n        object.__proto__ = prototype;\n    }\n    if (typeof properties !== 'undefined' && Object.defineProperties) {\n        Object.defineProperties(object, properties);\n    }\n    return object;\n};\n\n// WEBPACK FOOTER\n// module.id = 14\n// module.readableIdentifier = (webpack)/~/node-libs-browser/util/objectCreate.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/util/objectCreate.js");

/***/ },

/***/ 15:
/***/ function(module, exports, require) {

	eval("module.exports = function isRegExp(re) {\n  return re instanceof RegExp ||\n    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');\n}\n\n// WEBPACK FOOTER\n// module.id = 15\n// module.readableIdentifier = (webpack)/~/node-libs-browser/util/isRegExp.js\n//@ sourceURL=webpack-module:///(webpack)/~/node-libs-browser/util/isRegExp.js");

/***/ }
/******/ })