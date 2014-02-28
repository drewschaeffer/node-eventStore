
var http = require("http");
var q = require("q");
var url = require("url");


// use dfd.notify to do a call back type stream rather than get all events...
exports.esReader = function(feedUri) {   

    if (!feedUri) {
        throw new Error('feedUri missing.');
    }        

    return {
        read: read
    };
    
    function readLastFromHead (streamName) {                                        
        var dfd = q.defer();

        var options = url.parse(feedUri + streamName + '?embed=body');
        options.agent = false;
        options.method = 'GET';

          http.request(options, function(response) {       
            var body = '';
            response.on('data', function(chunk) {
              body += chunk.toString();
            }).on('end', function() {
                body = JSON.parse(body);

                var lastlinks = body.links.filter(function(link) { 
                return link.relation === 'last'; 
                });
                if (lastlinks.length > 0) {               
                    dfd.resolve(lastlinks[0].uri);           
                } else {
                    dfd.resolve(feedUri + streamName);
                }
              
            }).on('close', function() {
                dfd.reject();
            }).setEncoding('utf8');
          }).on('error', function(err) {
                dfd.reject();
          }).end();
                 
        return dfd.promise;
    };              

    function traverseToFirst (uri, entries, dfd) {   
                
        var options = url.parse(uri + '?embed=body');
        options.agent = false;
        options.method = 'GET';

        http.request(options, function(response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk.toString();
                }).on('end', function() {
                body = JSON.parse(body);
                var reversedEntries = body.entries.reverse();

                for (var i = 0; i < reversedEntries.length; i++) {
                    entries.push(reversedEntries[i]);
                }            

                var previousLinks = body.links.filter(function(link) { 
                    return link.relation === 'previous'; 
                });            
                if (previousLinks.length === 1) {
                    traverseToFirst(previousLinks[0].uri, entries, dfd);
                } else {             
                    dfd.resolve(entries);
                }
            }).on('close', function() {               
                dfd.reject();
            }).setEncoding('utf8');
          }).on('error', function(err) {        
                dfd.reject();
          }).end();
    };  

    function read (streamName) {                   
        if (!streamName) {
            throw new Error('streamName missing.');
        }  

        var dfd = q.defer();                           
        
        readLastFromHead(streamName).then(function(lastUri) {
            console.log('lasturi', lastUri);
            var entries = [];                        
            traverseToFirst(lastUri, entries, dfd);                

        });

        return dfd.promise;              
    };

}