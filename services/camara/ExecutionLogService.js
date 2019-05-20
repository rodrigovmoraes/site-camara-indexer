/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (OTHERS MODULES) *******************************
/*****************************************************************************/
var IndexerExecutionLogModule = require('../../models/IndexerExecutionLog.js');
var ModuleIndexerExecutionLogModule = require('../../models/ModuleIndexerExecutionLog.js');
var _ = require('lodash');

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/

/*****************************************************************************
*************************** Module Setters ***********************************
/*****************************************************************************/
//...
//..
//.

/*****************************************************************************
**************************  Module functions *********************************
/*****************************************************************************/
module.exports.logExecution = function( startDate, endDate, totalItems, amountOfNewItems,
                                        amountOfProcessedItems, amountOfUpdatedItems, amountOfRemovedItems,
                                        amountOfItemsWithError, error, modulesLogs) {
   var IndexerExecutionLog = IndexerExecutionLogModule.getModel();
   var ModuleIndexerExecutionLog = ModuleIndexerExecutionLogModule.getModel();
   var indexerExecutionLog = new IndexerExecutionLog();
   var insertModulesExecutionLogs = [];

   indexerExecutionLog.startDate = startDate;
   indexerExecutionLog.endDate = endDate;
   indexerExecutionLog.totalItems = totalItems;
   indexerExecutionLog.amountOfNewItems = amountOfNewItems;
   indexerExecutionLog.amountOfProcessedItems = amountOfProcessedItems;
   indexerExecutionLog.amountOfUpdatedItems = amountOfUpdatedItems;
   indexerExecutionLog.amountOfRemovedItems = amountOfRemovedItems;
   indexerExecutionLog.amountOfItemsWithError = amountOfItemsWithError;
   indexerExecutionLog.error = error ? error : null;
   return indexerExecutionLog
          .save()
          .then(function(savedIndexerExecutionLog) {
             if (modulesLogs && modulesLogs.length > 0) {
                insertModulesExecutionLogs = _.map(modulesLogs, function(moduleLog) {
                   return {
                            insertOne: {
                              document: {
                                 modulePath: moduleLog.modulePath,
                                 startDate: moduleLog.startDate,
                                 endDate: moduleLog.endDate,
                                 totalItems: moduleLog.totalItems,
                                 amountOfNewItems: moduleLog.amountOfNewItems,
                                 amountOfProcessedItems: moduleLog.amountOfProcessedItems,
                                 amountOfUpdatedItems: moduleLog.amountOfUpdatedItems,
                                 amountOfItemsWithError: moduleLog.amountOfItemsWithError,
                                 error: moduleLog.error ? moduleLog.error : null,
                                 indexerExecutionLog: savedIndexerExecutionLog._id
                              }
                            }
                         };
                });
                return ModuleIndexerExecutionLog.bulkWrite(insertModulesExecutionLogs);
             }
          }).catch(function(error) {
             winston.error(error);
          });
}

module.exports.getIndexerExecutionLogs = function( ppage, ppageSize ) {
   var IndexerExecutionLog = IndexerExecutionLogModule.getModel();
   var page = ppage && ppage > 0 ? ppage : 1;
   var pageSize = ppageSize && ppageSize > 0 ? ppageSize : 10;
   var total = 0;

   return IndexerExecutionLog
            .count({})
            .then(function(indexerExecutionLogTotal) {
               if (indexerExecutionLogTotal && indexerExecutionLogTotal > 0) {
                  //adjust page
                  if (ppage * ppage - pageSize >= indexerExecutionLogTotal) {
                     page = Math.ceil(indexerExecutionLogTotal / pageSize); //last page
                  } else {
                     page = ppage;
                  }

                  return IndexerExecutionLog
                         .find({})
                         .sort({ endDate: -1 })
                         .skip(page * pageSize - pageSize)
                         .limit(pageSize);
               } else {
                  return [];
               }
            }).then(function(logs){
               return {
                  'logs': logs,
                  'page': page,
                  'pageSize': pageSize,
                  'total': total
               }
            });
}

module.exports.getModuleIndexerExecutionLogs = function (indexerExecutionLogId) {
   var IndexerExecutionLog = IndexerExecutionLogModule.getModel();
   var ModuleIndexerExecutionLog = ModuleIndexerExecutionLogModule.getModel();

   return IndexerExecutionLog
         .findOne(
            IndexerExecutionLogModule.getMongoose().Types.ObjectId(indexerExecutionLogId)
         ).then(function(indexerExecutionLog) {
            if (indexerExecutionLog) {
               return ModuleIndexerExecutionLog
                        .find({
                           'indexerExecutionLog': indexerExecutionLog._id
                        }).sort({ endDate: -1 });
            } else {
               return null;
            }
         });
}

module.exports.clear = function() {
   var IndexerExecutionLog = IndexerExecutionLogModule.getModel();
   var ModuleIndexerExecutionLog = ModuleIndexerExecutionLogModule.getModel();

   return ModuleIndexerExecutionLog
         .deleteMany({})
         .then(function() {
               return IndexerExecutionLog.deleteMany({});
         });
}
