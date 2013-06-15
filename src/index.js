var Barry = module.exports = require('./barry').Barry;
var Server = require('./server').Server;
var ScalarService = require('./services/scalar').ScalarService;
var DictionaryService = require('./services/dictionary').DictionaryService;

// Add server-side components
Barry.Server = Server;
Barry.ScalarService = ScalarService;
Barry.DictionaryService = DictionaryService;
