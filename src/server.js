var Namespace = require('./namespace').Namespace;
var Router = require('./router').Router;

var Server = function (transport)
{
  var self = this;

  this.transport = transport;
  this.router = new Router();

  transport.on('connection', function (socket) {
    self.handleConnection(socket);

    socket.on('disconnect', function () {
      
    });
  });
};

Server.prototype = new Namespace;

Server.prototype.handleConnection = function (socket) {
  var self = this;
  socket.on('barry', function (req) {
    if (['load', 'subscribe', 'unsubscribe'].indexOf(req.method) !== -1) {
      req.clientId = socket.id;
      req.originalUrl = req.url;

      if (req.method === 'subscribe' || req.method === 'unsubscribe') {
        if ("undefined" === typeof req.subId) {
          sendResponse(new RPCError(105, "(Un)subscribe request needs a subId field"));
          return;
        }
        req.handlerId = req.clientId + "|" + req.subId;
        if (req.method === 'subscribe') {
          req.handler = function (ops) {
            socket.emit('barry', {
              jsonrpc: "2.0",
              method: "update",
              params: [req.subId].concat(ops)
            });
          };
        }
      }

      self.router.call(req, sendResponse);
    } else {
      sendResponse(new RPCError(-32601, "Method not found"));
      return;
    }

    function sendResponse(err, res) {
      if ("undefined" === typeof req.id) return;

      var rpc = { jsonrpc: "2.0" };
      if (err) {
        rpc.error = {
          code: err.code || 1,
          message: err.toString()
        };
      } else {
        rpc.result = res;
      }
      rpc.id = req.id;

      socket.emit('barry', rpc);
    }
  });
};

Server.prototype.service = function (path, service) {
  this.router.route(path, service);
  return service;
};

function RPCError(code, message)
{
  this.code = code;
  this.message = message;
}

RPCError.prototype.toString = function ()
{
  return this.message;
}

exports.Server = Server;
exports.RPCError = RPCError;
