/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');
var Utils = require('../util/Utils.js');
var _ = require('lodash');
var passport = require('passport');
var DigestStrategy = require('passport-http').DigestStrategy;
var jwt = require('jsonwebtoken');

var MainIndexer = require('../indexers/MainIndexer.js');
var InfoIndexerExecutionStatusService = require('../services/camara/InfoIndexerExecutionStatusService.js');
var ExecutionLogService = require('../services/camara/ExecutionLogService.js');
var ElasticSearchService = require('../services/camara/ElasticSearchService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

var IndexerExecutionLogModule = require('../models/IndexerExecutionLog');

var ServerGridUtils = require('../util/ServerGridUtils');

/*****************************************************************************
******************************* PRIVATE **************************************
/*****************************************************************************/
//...
var _expireInSeconds  = 86400; //1 day

var _generateJwt = function (user) {
   var expiry = new Date();
   expiry.setTime(expiry.getTime() + _expireInSeconds * 1000);

   return jwt.sign({
     user: user,
     exp: parseInt(expiry.getTime() / 1000),
   }, process.env.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
}
/*****************************************************************************
******************************* PUBLIC ***************************************
*****************************************************************************/

//config the passport framework
//this method must be executed by app init script (app.js) before
//the router configuration
module.exports.config = function() {
   passport.use(new DigestStrategy(
     { qop: 'auth' },
     function(userid, done) {
         if (userid === ElasticSearchApiConfigService.getAdminUsername()) {
            return done(null, { 'user': userid }, ElasticSearchApiConfigService.getAdminPassword());
         } else {
            return done(null, false);
         }
     }
  ));
}

//login process controller
module.exports.loginController = function(req, res, next) {
   var token;
   var err;

   if (req.user && req.user.user === ElasticSearchApiConfigService.getAdminUsername()) {
      token = _generateJwt(req.user.user);
      Utils.sendJSONresponse(res, 200, { "token" : token });
   } else {
      err = Utils.newUnauthorizedError();
      next(err); //security error request
   }
};

//module methods
module.exports.index = function(req, res, next) {
   if (!InfoIndexerExecutionStatusService.getBeingExecuted()) {
      MainIndexer.index().catch(function() { });
      Utils.sendJSONresponse(res, 200, {
         message: "indexer execution requested, track by infoStatus service"
      });
   } else {
      Utils.sendJSONresponse(res, 400, { message: 'indexing process is already being executed' });
   }
}

module.exports.getInfoStatus = function(req, res, next) {
   Utils.sendJSONresponse(res, 200, {
      info: InfoIndexerExecutionStatusService.getInfoStatus()
   });
}

module.exports.getIndexerExecutionLogs = function(req, res, next) {
   var page = req.query.page ? parseInt(req.query.page) : 1;
   var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

   return ExecutionLogService
         .getIndexerExecutionLogs(page, pageSize)
         .then(function(result) {
            Utils.sendJSONresponse(res, 200, result);
         }).catch(function(err) {
            winston.error("Error while getting indexer execution logs, err = [%s]", err);
            Utils.next(400, err, next);
         });
}

module.exports.indexerExecutionLogsGrid = function(req, res, next) {
   var IndexerExecutionLog = IndexerExecutionLogModule.getModel();
   var IndexerExecutionLogQuery = IndexerExecutionLog.find({}).select("startDate endDate totalItems amountOfNewItems amountOfProcessedItems amountOfUpdatedItems amountOfRemovedItems amountOfItemsWithError error");

   ServerGridUtils.getDataGrid(IndexerExecutionLog, IndexerExecutionLogQuery, [], req, res, next, function(data, count, selectFilters) {
      Utils.sendJSONresponse(res, 200, {
          "logs" : data,
          "totalLength" : count,
          "selectFilters" : selectFilters
      });
   });
}

module.exports.getModulesIndexerExecutionLogs = function(req, res, next) {
   var indexerExecutionLogId;

   if(req.params.indexerExecutionLogId) {
      indexerExecutionLogId = req.params.indexerExecutionLogId;
      return ExecutionLogService
            .getModuleIndexerExecutionLogs(indexerExecutionLogId)
            .then(function(result) {
               if(result) {
                  Utils.sendJSONresponse(res, 200, {
                     'modulesExecutionLogs': result
                  });
               } else {
                  Utils.sendJSONresponse(res, 400, { message: 'indexer execution log not found' });
               }
            }).catch(function(err) {
               winston.error("Error while getting modules indexer execution logs, err = [%s]", err);
               Utils.next(400, err, next);
            });
   } else {
      Utils.sendJSONresponse(res, 400, { message: 'undefined indexer execution log id' });
   }
}

module.exports.clearIndex = function(req, res, next) {
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

         Utils.sendJSONresponse(res, 200, {
            message: 'index clearing requested'
         });
      } catch(error) {
         winston.error("Error while clearing index, err = [%s]", error);
         Utils.next(400, err, error);
      };
   } else {
      Utils.sendJSONresponse(res, 400, {
         message: 'it is not allowed to clear the index, indexing process is being executed'
      });
   }
}

module.exports.clearLogs = function(req, res, next) {
   return ExecutionLogService
         .clear()
         .then(function() {
            Utils.sendJSONresponse(res, 200, {
               message: 'execution log cleared'
            });
         }).catch(function(err) {
            winston.error("Error while clearing execution log, err = [%s]", err);
            Utils.next(400, err, next);
         });
}

module.exports.stopIndexingProcess = function(req, res, next) {
   if (!InfoIndexerExecutionStatusService.getBeingExecuted()) {
      Utils.sendJSONresponse(res, 400, { message: 'indexing process isn\'t being executed' });
   } else {
      MainIndexer.stopIndexingProcess();
      Utils.sendJSONresponse(res, 200, {
         message: 'the indexing process was requested to stop'
      });
   }
}
