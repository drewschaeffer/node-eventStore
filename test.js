var esApi = require('./eventStoreApi');
var api = esApi.EsApi({ host: "http://localhost:9449/" });

api.persist(
[{ eventId: "ebf4a1a1-b4a3-4dfe-a01f-ec52c34e16e4",
   eventType: "event-type",
   data: { a: "2" } 
}]);