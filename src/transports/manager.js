var Manager = module.exports = {
  transports: [],
  transportsByName: {},
  registerTransport: function (transport) {
    Manager.transports.push(transport);
    Manager.transportsByName[transport.name] = transport;
  },
  getDefaultTransport: function () {
    return Manager.transports[0] || false;
  },
  getTransport: function (name) {
    return Manager.transportsByName[name] || false;
  }
};
