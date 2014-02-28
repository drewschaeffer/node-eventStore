var q = require("q");
var http = require("q-io/http");
//var url = require("url");

var esApi = require('./eventStoreApi');
var sr = require('./streamFeedReader');

var api = esApi.EsApi.api({ host: "http://localhost:2113/" });

//api.persist("teststream", "test-event", { a: "2" });

var reader = sr.esReader("http://localhost:2113/streams/");

var p = reader.read("teststream")
.then(function(data) { console.log('in success', data); })
.fail(function(err) { console.log('in err', err);})
.catch(function(ee) { console.log('in catch', ee)}).done();

