/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');
var _ = require('lodash');
var Utils = require('./Utils.js');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (OTHERS MODULES) *******************************
/*****************************************************************************/
var _elasticSearchConfigService = require('./ElasticSearchApiConfigService.js');

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/
var _getAllElementsIdsInitial = function(_elasticSearchClient, size, scroll) {
   return _elasticSearchClient
            .search({
               "size": size,
               "_source": ['type', 'datasourceId'],
               "index": _elasticSearchConfigService.getPortalCamaraIndexName(),
               "scroll": scroll,
               "body": {
                  "query": {
                     "match_all": {}
                  }
               }
            });
}


var _compareElementsId = function(idA, idB) { //used in _calcToBeDeletedElements
   if (idA.type > idB.type) {
      return 1;
   } else if (idA.type < idB.type) {
      return -1;
   } else {
      if (idA.id > idB.id) {
         return 1;
      } else if (idA.id < idB.id) {
         return -1;
      } else {
         return 0;
      }
   }
}

//calc pIndexedElementsIds - pProcessedElementsIds
var _calcToBeDeletedElements = function (pIndexedElementsIds, pProcessedElementsIds) {
   var i = 0;
   var j = 0;
   var k = 0;
   var compare = 0;
   var ltoBeDeleted = [];
   var sortedIndexedElementsIds = _.sortBy(pIndexedElementsIds, ['type', 'id']);
   var sortedProcessedElementsIds = _.sortBy(pProcessedElementsIds, ['type', 'id']);

   while (i < sortedIndexedElementsIds.length && j < sortedProcessedElementsIds.length) {
      compare = _compareElementsId(sortedIndexedElementsIds[i], sortedProcessedElementsIds[j]);
      if ( compare === -1 ) {
         ltoBeDeleted.push(sortedIndexedElementsIds[i]);
         i++;
      } else if (compare === 1) {
         j++;
      } else {
         i++;
         j++;
      }
   }
   //if there is elements in indexed elements list while
   //there isn't elements in processed elements list anymore
   //the remaining items should be deleted
   if (i < sortedIndexedElementsIds.length && j >= sortedProcessedElementsIds.length) {
      for (k = i; k < sortedIndexedElementsIds.length; k++) {
         ltoBeDeleted.push(sortedIndexedElementsIds[k]);
      }
   }
   return ltoBeDeleted;
}

var _processBulkCommands = async function(elasticSearchClient, bulkCommands, batchSize) {
   var k = 0;
   var amountToBeProcessed = 0;
   var error = null;
   var cont = true;
   var body = null;
   if (bulkCommands && bulkCommands.length > 0) {
      while (k < bulkCommands.length && cont) {
         amountToBeProcessed = k + batchSize <= bulkCommands.length ? batchSize : bulkCommands.length - k;
         //process [k .. k+amountToBeProcessed-1]
         body = _.join(bulkCommands.slice(k, k + amountToBeProcessed), "\n");
         try {
            await elasticSearchClient
                     .bulk({
                        'index': _elasticSearchConfigService.getPortalCamaraIndexName(),
                        'type': "_doc",
                        'body': body
                     });
         } catch (err) {
            error = err;
            cont = false;
         }
         k += amountToBeProcessed;
      }
   }
   if (error) {
      return Promise.reject(error);
   } else {
      return Promise.resolve(bulkCommands ? bulkCommands.length : 0);
   }
}

/*****************************************************************************
*************************** Module Setters ***********************************
/*****************************************************************************/
//...
//..
//.

/*****************************************************************************
**************************  Module functions *********************************
/*****************************************************************************/
module.exports.connect = function() {
   var elasticsearch = require('elasticsearch');
   var elasticsearchConfig = _.clone(_elasticSearchConfigService.getConnectionConfig());
   return new elasticsearch.Client(elasticsearchConfig);
}

module.exports.createIndexIfDoesntExist = async function(_elasticSearchClient) {
   if (_elasticSearchClient) {
      return _elasticSearchClient
               .indices
               .exists({
                  index: _elasticSearchConfigService.getPortalCamaraIndexName()
               }).then(function(exists) {
                  if(!exists) {
                     return _elasticSearchClient
                           .indices
                           .create({
                              index: _elasticSearchConfigService.getPortalCamaraIndexName(),
                              body: _elasticSearchConfigService.getPortalCamaraIndexConfigBody()
                           });
                  } else {
                     return true;
                  }
               })

   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.openIndex = async function(_elasticSearchClient) {
   if (_elasticSearchClient) {
      return _elasticSearchClient
               .indices
               .open({
                  'index': _elasticSearchConfigService.getPortalCamaraIndexName()
               });
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.close = async function(_elasticSearchClient) {
   if (_elasticSearchClient) {
      try {
         _elasticSearchClient.close();
      } catch(err) {
         console.log(error);
      }
   }
}

module.exports.find = async function(_elasticSearchClient, bodyQuery) {
   if (_elasticSearchClient) {
      return _elasticSearchClient
               .search({
                  'index': _elasticSearchConfigService.getPortalCamaraIndexName(),
                  'type': "_doc",
                  'body': bodyQuery
               });
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.findDocument = async function(_elasticSearchClient, type, id) {
   if (_elasticSearchClient) {
      return _elasticSearchClient
               .search({
                  'index': _elasticSearchConfigService.getPortalCamaraIndexName(),
                  'type': "_doc",
                  'body': {
                     "query": {
                        "bool" : {
                           "must" : [
                             { "term" : { "type" : type } },
                             { "term" : { "datasourceId" : id } }
                           ]
                        }
                     }
                  }
               }).then(function(result) {
                  if (result && result.hits) {
                     if (result.hits.hits.length > 0) {
                        return result.hits.hits[0];
                     } else {
                        return null;
                     }
                  } else {
                     return null;
                  }
               });
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.index = async function(_elasticSearchClient, body) {
   if (_elasticSearchClient) {
      return _elasticSearchClient
               .index({
                  'index': _elasticSearchConfigService.getPortalCamaraIndexName(),
                  'type': "_doc",
                  'body': body
               });
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.clear = async function(_elasticSearchClient) {
   if (_elasticSearchClient) {
      return _elasticSearchClient.deleteByQuery({
        'index': _elasticSearchConfigService.getPortalCamaraIndexName(),
        'type': "_doc",
        'body': {
           'query': {
             "match_all": {}
           }
        }
      });
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.reindex = async function(_elasticSearchClient, id, body) {
   if (_elasticSearchClient) {
      return _elasticSearchClient
               .index({
                  'id': id,
                  'index': _elasticSearchConfigService.getPortalCamaraIndexName(),
                  'type': "_doc",
                  'body': body
               });
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.getAllElementsIds = async function(_elasticSearchClient) {
   var elementsIds = [];
   var size = 1000;
   var result = [];
   var scroll_id = null;

   if (_elasticSearchClient) {
      result = await _getAllElementsIdsInitial(_elasticSearchClient, size, "1m");
      scroll_id = result._scroll_id;

      while (result && result.hits && result.hits.hits && result.hits.hits.length > 0) {
         elementsIds = elementsIds.concat(
            _.map(result.hits.hits, function (hit) {
               return {
                  "type":  hit._source.type,
                  "id": hit._source.datasourceId,
                  "elasticSearchId": hit._id
               }
            })
         );
         result = await _elasticSearchClient.scroll({
                                                      "scroll": '1m',
                                                      "scroll_id": scroll_id
                                                   });
      }
      await _elasticSearchClient.clearScroll({
         "body": {
            "scroll_id": scroll_id
         }
      });
      return elementsIds;
   } else {
      return Promise.reject(new Error("Elastic search client must be initalized !"));
   }
}

module.exports.deleteUnprocessedElements = async function(_elasticSearchClient, indexedElementsIds, processedElementsIds) {
   var toBeDeleted = _calcToBeDeletedElements(indexedElementsIds, processedElementsIds);
   var bulkCommands = _.map(toBeDeleted, function(item) {
      var jsonCommandObj = { "delete" : { "_index" : _elasticSearchConfigService.getPortalCamaraIndexName(), "_type" : "_doc", "_id" : item.elasticSearchId } };
      return JSON.stringify(jsonCommandObj);
   });
   return _processBulkCommands(_elasticSearchClient, bulkCommands, 1000);
}

module.exports.ping = function(_elasticSearchClient) {
   return _elasticSearchClient.ping({
      requestTimeout: 10000
   });
}
