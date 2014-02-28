
var http = require("http");
var q = require("q");
var u = require("url");

exports.esReader = function(feedUri) {   

    if (!feedUri) {
        throw new Error('feedUri missing.');
    }        

    return {
        read: read
    };
    
    function readLastFromHead (streamName) {                                        
        var dfd = q.defer();

        var uri = u.parse(feedUri + streamName + '?embed=body');
        var options = 
        {
            url: uri.protocol + '//' + uri.hostname,
            port: uri.port,
            path: uri.path,
            method:'GET'
        };
        console.log(options);
        var req = http.request(options, function(res) {
          console.log(res.statusCode);
          if (res.statusCode != 200) dfd.reject();
          res.setEncoding('utf8');
          res.on('data', function (data) {
            var lastlinks = data.links.filter(function(link) { 
                return link.relation === 'last'; 
            });
            if (lastlinks.length > 0) {               
                dfd.resolve(lastlinks[0].uri);           
            } else {
                dfd.resolve(feeduri + streamname);
            }
          });
        });

        req.on('error', function(e) {
            dfd.reject();
        });
                 
        return dfd.promise;
    };              

    var traverseToFirst = function (uri, entries, dfd) {   
                
        var uri = u.parse(uri + '?embed=body');
        var options = 
        {
            url: uri.protocol + '//' + uri.hostname,
            port: uri.port,
            path: uri.path,
        };
        var req = http.request(options, function(res) {
            console.log(res.statusCode);
          if (res.statusCode != 200) dfd.reject();
          res.setEncoding('utf8');
          res.on('data', function (data) {
            var reversedEntries = data.entries.reverse();

            for (var i = 0; i < reversedEntries.length; i++) {
                entries.push(reversedEntries[i]);
            }            

            var previousLinks = data.links.filter(function(link) { 
                return link.relation === 'previous'; 
            });            

            if (previousLinks.length === 1) {
                traverseToFirst(previousLinks[0].uri, entries, dfd);
            } else {                
                dfd.resolve(entries);
            }
          });
        });

        req.on('error', function(e) {
            dfd.reject();
        });                                  
    };  

    function read (streamName) {                   
        if (!streamName) {
            throw new Error('streamName missing.');
        }  

        var dfd = q.defer();                           
        
        readLastFromHead(streamName).done(function(lastUri) {
            var entries = [];                        
            traverseToFirst(lastUri, entries, dfd);                
        });

         //.fail(function() {             dfd.reject();         });    

        return dfd.promise;              
    };

}