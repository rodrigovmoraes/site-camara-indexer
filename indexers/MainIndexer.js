/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');
var async = require("async");
var config = require('config');
var _ = require('lodash');
var Utils = require('../services/camara/Utils.js');
var ElasticSearchService = require('../services/camara/ElasticSearchService.js');
var ExecutionLogService = require('../services/camara/ExecutionLogService.js');
var DbModule = require('../models/Db.js');
var IndexerExecutionLogModule = require('../models/IndexerExecutionLog.js');
var ModuleIndexerExecutionLogModule = require('../models/ModuleIndexerExecutionLog.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');
var InfoIndexerExecutionStatusService = require('../services/camara/InfoIndexerExecutionStatusService.js');
var ResumeIndexExecutionModule = require('../services/camara/ResumeIndexExecutionService.js');

/*****************************************************************************
********************************** Private ***********************************
/*****************************************************************************/
var _continue = true;

var _runIndexer = async function(elasticSearchClient, done, indexerFactory, processedElementsIds) {
   try {
      InfoIndexerExecutionStatusService.setCurrentModuleProgress(0);
      /*begin: module stats*/
      var startDate = new Date();
      var total = 0;
      var amountOfProcessedItems = 0;
      var amountOfNewItems = 0;
      var amountOfUpdatedItems = 0;
      var amountOfItemsWithError = 0;
      /*end: module stats*/
      var maxItems = ElasticSearchApiConfigService.getMaxItems();

      var indexer = indexerFactory();
      var dataSummaryFromDataSource = null;
      var dataSummaryFromDataSourceProperties = null;
      var doc = null;
      var dataSourceDate = null;
      var docFromElastic = null;
      var docFromElasticSource = null;
      var elasticDate = null;
      var dataDetailFromDataSource = null;

      await indexer.init();
      total = indexer.getTotal();
      while ( _continue &&
              indexer.hasMoreElements() &&
              (maxItems === -1 || amountOfProcessedItems < maxItems) ) {
         dataSummaryFromDataSource = indexer.getSummaryData();
         dataSummaryFromDataSourceProperties = dataSummaryFromDataSource.properties;
         processedElementsIds.push({
            "type": dataSummaryFromDataSourceProperties.type,
            "id":  dataSummaryFromDataSourceProperties.datasourceId
         });
         //find the document in the index
         docFromElastic = await ElasticSearchService.findDocument(elasticSearchClient, dataSummaryFromDataSource.type, dataSummaryFromDataSource.id);
         if (docFromElastic) {
            docFromElasticSource = docFromElastic._source;
            //check the date
            if (dataSummaryFromDataSourceProperties.date && docFromElasticSource.date) {
               dataSourceDate = new Date(dataSummaryFromDataSourceProperties.date);
               elasticDate = new Date(docFromElasticSource.date);
               //if the date from datasource is greater
               //than date from elastic search
               if (dataSourceDate.getTime() > elasticDate.getTime()) {
                  //reindex
                  try {
                     dataDetailFromDataSource = await indexer.getDataDetail();
                     if (dataDetailFromDataSource) {
                        await ElasticSearchService.reindex(elasticSearchClient, docFromElastic._id, dataDetailFromDataSource.properties);
                        amountOfUpdatedItems++;
                        winston.verbose("docexists = %s, docisupdate = %s, elasticid = %s, datasourcedate = %s, elasticsearchdate = %s, type = %s, idfromdatasource = %s, contenttype = %s", "y", "n", docFromElastic._id, dataSummaryFromDataSourceProperties.date, docFromElasticSource.date, dataSummaryFromDataSource.type, dataSummaryFromDataSource.id, dataDetailFromDataSource.properties.contentType);
                     }
                  } catch(error) {
                     winston.error(error);
                     //index the summary
                     await ElasticSearchService.reindex(elasticSearchClient, docFromElastic._id, dataSummaryFromDataSourceProperties);
                     amountOfUpdatedItems++;
                     amountOfItemsWithError++;
                     winston.verbose("docexists = %s, docisupdate = %s, elasticid = %s, datasourcedate = %s, elasticsearchdate = %s, type = %s, idfromdatasource = %s, contenttype = %s", "y", "n", docFromElastic._id, dataSummaryFromDataSourceProperties.date, docFromElasticSource.date, dataSummaryFromDataSource.type, dataSummaryFromDataSource.id, '');
                  }
               }
               //else
               //document already exists and is updated
               //do nothing
               else {
                  winston.verbose("docexists = %s, docisupdate = %s, elasticid = %s, datasourcedate = %s, elasticsearchdate = %s, type = %s, idfromdatasource = %s, contenttype = %s", "y", "y", docFromElastic._id, dataSummaryFromDataSourceProperties.date, docFromElasticSource.date, dataSummaryFromDataSource.type, dataSummaryFromDataSource.id, docFromElasticSource.contentType);
               }
            }
         } else {
            //index
            try {
               dataDetailFromDataSource = await indexer.getDataDetail();
               if (dataDetailFromDataSource) {
                  await ElasticSearchService.index(elasticSearchClient, dataDetailFromDataSource.properties);
                  amountOfNewItems++;
                  winston.verbose("docexists = %s, docisupdate = %s, elasticid = %s, datasourcedate = %s, elasticsearchdate = %s, type = %s, idfromdatasource = %s, contenttype = %s", "n", "n", '', dataSummaryFromDataSourceProperties.date, '', dataSummaryFromDataSource.type, dataSummaryFromDataSource.id, dataDetailFromDataSource.properties.contentType);
               }
            } catch(error) {
               winston.error(error);
               //index the summary
               await ElasticSearchService.index(elasticSearchClient, dataSummaryFromDataSourceProperties);
               amountOfNewItems++;
               amountOfItemsWithError++;
               winston.verbose("docexists = %s, docisupdate = %s, elasticid = %s, datasourcedate = %s, elasticsearchdate = %s, type = %s, idfromdatasource = %s, contenttype = %s", "n", "n", '', dataSummaryFromDataSourceProperties.date, '', dataSummaryFromDataSource.type, dataSummaryFromDataSource.id, '');
            }
         }
         await indexer.next();
         amountOfProcessedItems++;
         InfoIndexerExecutionStatusService.setCurrentModuleProgress(amountOfProcessedItems/ ( maxItems === -1 ? total : maxItems ));
      }
      done(null, {
         'startDate': startDate,
         'endDate': new Date(),
         'totalItems': total,
         'amountOfNewItems': amountOfNewItems,
         'amountOfProcessedItems': amountOfProcessedItems,
         'amountOfUpdatedItems': amountOfUpdatedItems,
         'amountOfItemsWithError': amountOfItemsWithError,
         'error': null
      });
   } catch (error) {
      winston.error(error);
      done(error, {
         'startDate': startDate,
         'endDate': new Date(),
         'totalItems': total,
         'amountOfNewItems': amountOfNewItems,
         'amountOfProcessedItems': amountOfProcessedItems,
         'amountOfUpdatedItems': amountOfUpdatedItems,
         'amountOfItemsWithError': amountOfItemsWithError,
         'error': error.toString()
      });
   }
}

var _mainIndex = async function() {
   var indexers = ElasticSearchApiConfigService.getIndexers();

   /*begin: index stats*/
   var startDate = new Date();
   var totalItems = 0;
   var amountOfNewItems = 0;
   var amountOfProcessedItems = 0;
   var amountOfUpdatedItems = 0;
   var amountOfRemovedItems = 0;
   var amountOfItemsWithError = 0;
   var modulesLogs = [];
   var indexedElementsIds = [];
   var processedElementsIds = [];
   var anyModuleWithError = false;
   _continue = true;
   /*end: index stats*/

   try {
      await ResumeIndexExecutionModule.setResumeIndexExecution(true);
      InfoIndexerExecutionStatusService.setBeingExecuted(true);
      InfoIndexerExecutionStatusService.setTotalModules(indexers ? indexers.length : 0);

      winston.info("========== Indexing ...");

      var elasticSearchClient = ElasticSearchService.connect();

      return ElasticSearchService
               .createIndexIfDoesntExist(elasticSearchClient)
               .then(function(result) {
                  return ElasticSearchService.openIndex(elasticSearchClient);
               }).then(async function(result) {
                  winston.verbose("Getting all elements ids ...");
                  return ElasticSearchService.getAllElementsIds(elasticSearchClient);
               }).then(async function(pindexedElementsIds) {
                  winston.verbose("Elements ids were retrieved.");
                  //store the elements ids of indexed elements,
                  //these ids will be used to compare with ids of processed elements,
                  //then no processed elements will be removed from index
                  indexedElementsIds = pindexedElementsIds;

                  //run the indexers
                  //execute indexers in serie, each one running once
                  //the previous function has completed
                  var loadRoutines = _.map(indexers, function(indexPath) {
                     var indexerFactory = require(indexPath);
                     return function(done) {
                        var indexerDone = function(err, result) {
                           //store the info execution of the module
                           result['modulePath'] = indexPath;
                           modulesLogs.push(result);
                           InfoIndexerExecutionStatusService.incModulesExecuted();

                           if (!err) {
                              winston.info("========== Indexing Module ended");
                              totalItems += result.totalItems;
                              amountOfNewItems += result.amountOfNewItems;
                              amountOfProcessedItems += result.amountOfProcessedItems;
                              amountOfUpdatedItems += result.amountOfUpdatedItems;
                              amountOfItemsWithError += result.amountOfItemsWithError;
                              done(null, true);
                           } else {
                              anyModuleWithError = true;
                              done(null, true);
                              winston.error("Error during indexing process, module = [%s], err = [%s]", indexPath, err);
                           }

                        }
                        if (_continue) {
                           winston.info("========== Indexing Module = [%s]", indexPath);
                           InfoIndexerExecutionStatusService.setCurrentModulePath(indexPath);
                           _runIndexer(elasticSearchClient, indexerDone, indexerFactory, processedElementsIds);
                        } else {
                           done(null, true);
                        }
                     }
                  });
                  var loadRoutinesWithErrorHandling = _.map(loadRoutines, Utils.handleErrorForAsync);
                                                      //Each routine should be
                                                      //surronded by an error handler in order to
                                                      //improve error reporting
                  return new Promise(function(resolve, reject) {
                     async.series(loadRoutinesWithErrorHandling, async function(errSeries, results) {
                        var endDate = new Date();
                        if (errSeries) {
                           winston.error("Error during indexing process, err = [%s]", errSeries);
                        } else {
                           //remove process will be executed if only the indexing wasn't stopped by the user and
                           //there weren't any errors with modules
                           if (_continue && !anyModuleWithError && ElasticSearchApiConfigService.haveToRemoveUnprocessedElements()) {
                              //delete not processed items
                              winston.verbose("Removing unprocessed elements from index ...");
                              try {
                                 amountOfRemovedItems = await ElasticSearchService.deleteUnprocessedElements(elasticSearchClient, indexedElementsIds, processedElementsIds);
                                 winston.verbose("Unprocessed elements removed.");
                              } catch(error) {
                                 winston.error("Error while removing unprocessed elements, err = [%s]", error);
                              }
                           }
                        }
                        InfoIndexerExecutionStatusService.setBeingExecuted(false);
                        _continue = true;
                        winston.info("========== Indexing process ended");
                        //log the execution stats
                        try {
                           await ResumeIndexExecutionModule.setResumeIndexExecution(false);
                           await ExecutionLogService.logExecution(startDate, endDate, totalItems, amountOfNewItems, amountOfProcessedItems, amountOfUpdatedItems, amountOfRemovedItems, amountOfItemsWithError, errSeries ? errSeries.toString() : null, modulesLogs);
                        } catch(error) { }

                        if (errSeries) {
                           reject(errSeries);
                        } else {
                           resolve();
                        }
                     });
                  });
               }).catch(async function(err) {
                  InfoIndexerExecutionStatusService.setBeingExecuted(false);
                  _continue = true;
                  ElasticSearchService.close(elasticSearchClient);
                  winston.error("Error during indexing process, err = [%s]", err);
                  try {
                     await ResumeIndexExecutionModule.setResumeIndexExecution(false);
                     await ExecutionLogService.logExecution(startDate, new Date(), totalItems, amountOfNewItems, amountOfProcessedItems, amountOfUpdatedItems, amountOfRemovedItems, amountOfItemsWithError, err.toString(), modulesLogs);
                  } catch(error) { }
                  return Promise.reject(err);
               });
   } catch(error) {
      InfoIndexerExecutionStatusService.setBeingExecuted(false);
      _continue = true;
      winston.error("Error during indexing process, err = [%s]", error);
      try {
         await ResumeIndexExecutionModule.setResumeIndexExecution(false);
         await ExecutionLogService.logExecution(startDate, new Date(), totalItems, amountOfNewItems, amountOfProcessedItems, amountOfUpdatedItems, amountOfRemovedItems, amountOfItemsWithError, error.toString(), modulesLogs);
      } catch(error) { }
      return Promise.reject(error);
   };
}

/*****************************************************************************
******************************* Module functions *****************************
/*****************************************************************************/
module.exports.index = function() {
   return _mainIndex();
}

module.exports.stopIndexingProcess = function () {
   _continue = false;
}

module.exports.resumeIndexExecution = function () {
   return ResumeIndexExecutionModule
            .getResumeIndexExecution()
            .then(function(resume) {
               if (resume) {
                  return _mainIndex();
               }
            });
}
