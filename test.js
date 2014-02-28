
var http = require("http");
var url = require('url');

//var esApi = require('./eventStoreApi');
//var sr = require('./streamFeedReader');

//var api = esApi.EsApi.api({ host: "http://localhost:2113/" });

//api.persist("teststream", "test-event", { a: "2" });

//var reader = sr.esReader("http://localhost:2113/streams/");

//var p = reader.read("teststream")
//.then(function(data) { console.log('in success', data); })
//.fail(function(err) { console.log('in err', err);})
//.catch(function(ee) { console.log('in catch', ee)}).done();

 var options = url.parse('http://localhost:9449/streams/testevent?embed=body');
  options.agent = false;
  options.method = 'GET';
 // options.headers = {};


  http.request(options, function(response) {
    var body = '';

    response.on('data', function(chunk) {
      body += chunk.toString();
    }).on('end', function() {

      console.log(body);
      
    }).on('close', function() {
      console.log('premature end-of-file');
    }).setEncoding('utf8');
  }).on('error', function(err) {
    console.log('err', err);
  }).end();

