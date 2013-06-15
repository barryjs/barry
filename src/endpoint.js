var Consumer = require('./consumer').Consumer;
var extend = require('extend');

var Endpoint = function (transport)
{
  var self = this;

  this.transport = transport;
  this.consumers = {};
  this.callbacks = [];
  this.subscribers = [];
  this.subscribersByUrl = {};

  this.uniqueId = 0;

  transport.on('barry', function (res) {
    if ("number" === typeof res.id ||
        "function" === typeof self.callbacks[res.id]) {
      self.callbacks[res.id](res.error, res.result);
    }

    if (res.method === "update") {
      self.delegateUpdate(res.params.shift(), res.params);
    }
  });
};

Endpoint.prototype.emit = function ()
{
  var args = Array.prototype.slice.call(arguments);
  this.transport.emit.apply(this.transport, args);
};

Endpoint.prototype.call = function (req, callback)
{
  var rpc = { jsonrpc: "2.0" };
  extend(rpc, req);

  if ("function" === typeof callback) {
    rpc.id = this.callbacks.length;
    this.callbacks.push(callback);
  }

  this.transport.emit('barry', rpc);
};

Endpoint.prototype.subscribe = function (url, handler, callback)
{
  var id = this.uniqueId++;
  this.subscribers[id] = handler;
  this.subscribersByUrl[url] = id;
  this.call({
    method: 'subscribe',
    url: url,
    subId: id
  }, callback);
};

Endpoint.prototype.unsubscribe = function (url, handler, callback)
{
  var id = this.subscribersByUrl[url];
  this.call({
    method: 'unsubscribe',
    url: url,
    subId: id
  }, callback);
};

Endpoint.prototype.delegateUpdate = function (subId, ops)
{
  var handler = this.subscribers[subId];

  if ("function" === typeof handler) {
    handler(ops);
  } else {
    this.call({
      method: 'unsubscribe',
      subId: subId
    });
  }
};

Endpoint.prototype.consumer = function (url)
{
  // XXX More intelligent URL parsing. We could even have URLs that let you jump
  //     to other endpoints or transports, e.g.
  //
  //     endpoint.consumer('//otherserver/bla')
  //     endpoint.consumer('io://yetanotherserver/bla')

  var c = this.consumers[url] = new Consumer(this, url);

  return c;
};

exports.Endpoint = Endpoint;
