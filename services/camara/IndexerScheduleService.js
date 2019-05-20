/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');
var nodeSchedule = require('node-schedule');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (OTHERS MODULES) *******************************
/*****************************************************************************/
var _ = require('lodash');
var MainIndexer = require('../../indexers/MainIndexer.js');
var ElasticSearchApiConfigService = require('./ElasticSearchApiConfigService.js');
var ElasticSearchService = require('./ElasticSearchService.js');
var InfoIndexerExecutionStatusService = require('./InfoIndexerExecutionStatusService.js');

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/
var _getIndexTasks = function() {
   return ElasticSearchApiConfigService.getIndexerSchedule();
}

var _getCleanTasks = function() {
   return ElasticSearchApiConfigService.getCleaningSchedule();
}

var _index = function() {
   if (!InfoIndexerExecutionStatusService.getBeingExecuted()) {
      MainIndexer.index().catch(function() { });
      winston.verbose("indexer execution requested by scheduled task");
   } else {
      winston.warn("indexer execution requested by scheduled task but indexing process is already being executed");
   }
}

var _clean = function() {
   winston.verbose("index cleaning execution requested by scheduled task");
   if (!InfoIndexerExecutionStatusService.getBeingExecuted()) {
      try {
            var elasticSearchClient = ElasticSearchService.connect();

            ElasticSearchService
            .clear(elasticSearchClient)
            .then(function() {
               winston.info("Index clearing was requested and it has completed");
            }).catch(function(err) {
               winston.error("Error while clearing index, err = [%s]", err);
            });
      } catch(error) {
         winston.error("Error while cleaning index, err = [%s]", error);
      }
   } else {
      winston.warn("index cleaning requested by scheduled task but indexing process is being executed");
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
module.exports.scheduleAllIndexTasks = function() {
   var schedule = _getIndexTasks();

   if (schedule && schedule.length > 0) {
      var k;
      for (k = 0; k < schedule.length; k++) {
         nodeSchedule.scheduleJob(schedule[k], _index);
      }
   }
}

module.exports.scheduleAllCleanTasks = function() {
   var schedule = _getCleanTasks();

   if (schedule && schedule.length > 0) {
      var k;
      for (k = 0; k < schedule.length; k++) {
         nodeSchedule.scheduleJob(schedule[k], _clean);
      }
   }
}
