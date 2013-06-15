var events = require('events'),
    util = require('util');

var Consumer = function (endpoint, url)
{
  events.EventEmitter.call(this);

  this.endpoint = endpoint;
  this.url = url;

  this.model = null;
  this.loaded = false;
  this.loading = false;
  this.current = false;
};

util.inherits(Consumer, events.EventEmitter);

/**
 * Load initial data and subscribe in one call.
 */
Consumer.prototype.init = function (callback)
{
  // XXX Should be its own atomic protocol message
  this.subscribe();
  this.load(callback);
};

Consumer.prototype.subscribe = function ()
{
  var self = this;

  if (this.url) {
    this.endpoint.subscribe(this.url, function (ops) {
      ops.forEach(function (op) {
        self.apply(op);
      });
    });
  }
};

Consumer.prototype.unsubscribe = function ()
{
  var self = this;

  if (this.url) {
    this.endpoint.unsubscribe(this.url);
  }
};

Consumer.prototype.load = function (callback)
{
  var self = this;

  if ("function" !== typeof callback) {
    callback = function () {};
  }

  if (this.url) {
    this.loading = true;
    this.emit('beforeload');
    this.endpoint.call({
      method: 'load',
      url: this.url
    }, function (err, res) {
      if (err) {
        callback(err);
      } else {
        self.loading = false;
        self.loaded = true;
        self.current = true;
        self.model = res;
        self.emit('update', res);
        callback(null, res);
      }
    });
  }
};

Consumer.prototype.apply = function (op)
{
  var modified = false;
  switch (op.op) {
  case 'set':
    if (this.model !== op.v) modified = true;
    this.model = op.v;
    break;
  case 'assign':
    for (var key in op.v) {
      if (this.model[key] !== op.v[key]) {
        this.model[key] = op.v[key];
        modified = true;
      }
    }
    break;
  }

  if (modified) this.emit('update', this.model);
};

Consumer.prototype.setUrl = function (url)
{
  var self = this;
  if (url !== this.url) {
    this.unsubscribe();
    this.url = url;
    if (!url) this.model = '';
    this.current = false;
    self.emit('update', '');
  }
  this.init();
};

exports.Consumer = Consumer;
