var namespace = require('./namespace').global;
var TransportManager = require('./transports/manager');
var Endpoint = require('./endpoint').Endpoint;
var Consumer = require('./consumer').Consumer;

var Barry = namespace;

Barry.endpoint = function (Transport, ep) {
  // Simplified syntax (uses default transport:
  //   barry.endpoint(endpoint);
  if (!ep) {
    ep = Transport;
    Transport = TransportManager.getDefaultTransport();

    if (!Transport)
      throw new Error("Barry.endpoint: No transports available");
  }

  if ("string" === typeof Transport) {
    Transport = TransportManager.getTransport(Transport);
  }

  if (!Transport) throw new Error("Barry.endpoint: Invalid transport");

  return new Endpoint(new Transport(ep));
};

// Load default built-in transports
require('./transports/io');

Barry.transports = TransportManager;
Barry.Endpoint = Endpoint;
Barry.Consumer = Consumer;

exports.Barry = Barry;
