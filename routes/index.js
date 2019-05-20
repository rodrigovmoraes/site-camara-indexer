/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var express = require('express');
var router = express.Router();
var passport = require('passport');


/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (APP MODULES) ********************************
/*****************************************************************************/
var indexerControllers = require('../controllers/indexer.js');
var securityMiddlewares = require('../middlewares/security.js');
var isLogged = securityMiddlewares.isLogged;

/*****************************************************************************
******************************** CONFIG **************************************
/*****************************************************************************/
indexerControllers.config();

/*****************************************************************************
********************* REQUIRE CONTROLLERS MODULES ****************************
/*****************************************************************************/
router.get('/index', isLogged(), indexerControllers.index);
router.get('/infoStatus', isLogged(), indexerControllers.getInfoStatus);
router.get('/executionLogs', isLogged(), indexerControllers.getIndexerExecutionLogs);
router.post('/executionLogsGrid', isLogged(), indexerControllers.indexerExecutionLogsGrid);
router.get('/modulesExecutionLogs/:indexerExecutionLogId', isLogged(), indexerControllers.getModulesIndexerExecutionLogs);
router.get('/clearLogs', isLogged(), indexerControllers.clearLogs);
router.get('/clearIndex', isLogged(), indexerControllers.clearIndex);
router.get('/stopIndexing', isLogged(), indexerControllers.stopIndexingProcess);
router.get('/login',
   function (req, res, next) {
        res.header('Access-Control-Expose-Headers', 'WWW-Authenticate');
        res.header( 'Access-Control-Allow-Origin', '*' );
        next();
   },
   passport.authenticate('digest', { session: false }),
   indexerControllers.loginController);

module.exports = router;
