/**
 * Module dependencies.
 */

var Route = require('./route')
  , debug = function () {}//require('debug')('express:router')
  , parse = require('url').parse;

/**
 * Expose `Router` constructor.
 */

exports.Router = Router;

/**
 * Initialize a new `Router` with the given `options`.
 *
 * @param {Object} options
 * @api private
 */

function Router(options) {
  options = options || {};
  var self = this;
  this.map = [];
  this.params = {};
  this._params = [];
  this.caseSensitive = options.caseSensitive;
  this.strict = options.strict;
}

/**
 * Register a param callback `fn` for the given `name`.
 *
 * @param {String|Function} name
 * @param {Function} fn
 * @return {Router} for chaining
 * @api public
 */

Router.prototype.param = function(name, fn){
  // param logic
  if ('function' == typeof name) {
    this._params.push(name);
    return;
  }

  // apply param functions
  var params = this._params
    , len = params.length
    , ret;

  for (var i = 0; i < len; ++i) {
    if (ret = params[i](name, fn)) {
      fn = ret;
    }
  }

  // ensure we end up with a
  // middleware function
  if ('function' != typeof fn) {
    throw new Error('invalid param() call for ' + name + ', got ' + fn);
  }

  (this.params[name] = this.params[name] || []).push(fn);
  return this;
};

/**
 * Route dispatcher for calling service methods.
 *
 * @param {IncomingMessage} req
 * @param {Function} callback
 */

Router.prototype.call = function(req, callback){
  var params = this.params
    , self = this;

  debug('dispatching %s (%s)', req.url, req.originalUrl);

  // route dispatch
  (function pass(i, err){
    var paramCallbacks
      , paramIndex = 0
      , paramVal
      , route
      , keys
      , key;

    // match next route
    function nextRoute(err) {
      pass(req._route_index + 1, err);
    }

    // match route
    req.route = route = self.matchRequest(req, i);

    // no route
    if (!route) return callback(err);
    debug('matched %s', route.path);

    // we have a route
    // start at param 0
    req.params = route.params;
    keys = route.keys;
    i = 0;

    // param callbacks
    function param(err) {
      paramIndex = 0;
      key = keys[i++];
      paramVal = key && req.params[key.name];
      paramCallbacks = key && params[key.name];

      try {
        if ('route' == err) {
          nextRoute();
        } else if (err) {
          i = 0;
          execute(err);
        } else if (paramCallbacks && undefined !== paramVal) {
          paramCallback();
        } else if (key) {
          param();
        } else {
          i = 0;
          execute();
        }
      } catch (err) {
        param(err);
      }
    };

    param(err);

    // single param callbacks
    function paramCallback(err) {
      var fn = paramCallbacks[paramIndex++];
      if (err || !fn) return param(err);
      fn(req, paramCallback, paramVal, key.name);
    }

    // invoke route
    function execute(err) {
      if (err) return callback(err);

      var service = route.service;
      try {
        service[req.method](req, callback);
      } catch (err) {
        callback(err);
      }
    }
  })(0);
};

/**
 * Attempt to match a route for `req`
 * with optional starting index of `i`
 * defaulting to 0.
 *
 * @param {IncomingMessage} req
 * @param {Number} i
 * @return {Route}
 * @api private
 */

Router.prototype.matchRequest = function(req, i, head){
  var url = parse(req.url)
  , path = url.pathname
  , routes = this.map
  , i = i || 0
  , route;

  // matching routes
  for (var len = routes.length; i < len; ++i) {
    route = routes[i];
    if (route.match(path)) {
      req._route_index = i;
      return route;
    }
  }
};

/**
 * Attempt to match a route for `url`
 * with optional starting index of
 * `i` defaulting to 0.
 *
 * @param {String} url
 * @param {Number} i
 * @return {Route}
 * @api private
 */

Router.prototype.match = function(url, i, head){
  var req = { url: url };
  return  this.matchRequest(req, i, head);
};

/**
 * Route `path`, and one or more callbacks.
 *
 * @param {String} path
 * @param {Function} callback...
 * @return {Router} for chaining
 * @api private
 */

Router.prototype.route = function(path, service){
  // ensure path was given
  if (!path) throw new Error('Router#route() requires a path');

  // ensure service has required functions
  if ("function" !== typeof service.load ||
      "function" !== typeof service.subscribe ||
      "function" !== typeof service.unsubscribe) {
    throw new Error("Barry.Router: Service missing required methods");
  }

  // create the route
  debug('defined %s', path);
  var route = new Route(path, service, {
    sensitive: this.caseSensitive,
    strict: this.strict
  });

  // add it
  this.map.push(route);
  return this;
};
