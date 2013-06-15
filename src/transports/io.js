if ("undefined" !== typeof io) {
  var SocketIoTransport = function (ep) {
    this.ep = ep;
    this.socket = io.connect(ep);
  };

  SocketIoTransport.prototype.on = function (name, handler) {
    return this.socket.on(name, handler);
  };

  SocketIoTransport.prototype.emit = function (name, data) {
    return this.socket.emit(name, data);
  };

  require('./manager').registerTransport(SocketIoTransport);
}
