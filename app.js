/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
require('dotenv').load();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var winston = require('winston');
var config = require('config');
var java = require("java");
var Utils = require('./util/Utils.js');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (APPS MODULES) *******************************
/*****************************************************************************/
var CamaraApiConfigService = require('./services/camara/CamaraApiConfigService.js');
var SyslegisApiConfigService = require('./services/camara/SyslegisApiConfigService.js');
var ElasticSearchApiConfigService = require('./services/camara/ElasticSearchApiConfigService.js');

var IndexerScheduleService = require('./services/camara/IndexerScheduleService.js');

var IndexerExecutionLogModule = require('./models/IndexerExecutionLog.js');
var ModuleIndexerExecutionLogModule = require('./models/ModuleIndexerExecutionLog.js');
var ResumeIndexExecutionModule = require('./models/ResumeIndexExecution.js');
var MainIndexer = require('./indexers/MainIndexer.js');

/*****************************************************************************
*********************************** BEGIN ************************************
******************************************************************************/
var app = express();

/*****************************************************************************
***************************** APP CONFIG SECTION *****************************
/*****************************************************************************/
//logger
var logConfig = config.get("Log");
//log configuration
winston.setLevels(logConfig.levels);
winston.addColors(logConfig.levelsColors);
winston.configure({
    transports: [
      new (winston.transports.Console)({ colorize: true })
    ]
 });
winston.level = logConfig.level;

//set java options
//java is used by tika module
java.options.push('-Dcom.sun.management.jmxremote');
java.options.push('-Dcom.sun.management.jmxremote');
java.options.push('-Dcom.sun.management.jmxremote.port=8999');
java.options.push('-Dcom.sun.management.jmxremote.ssl=false');
java.options.push('-Dcom.sun.management.jmxremote.authenticate=false');
java.options.push('-XX:+UnlockCommercialFeatures');
java.options.push('-XX:+FlightRecorder');

java.options.push('-XX:NewSize=128m');
java.options.push('-XX:MaxNewSize=128m');
java.options.push('-XX:MaxPermSize=1024M');
java.options.push('-Xms1024m')
java.options.push('-Xmx1024m');

var camaraApiConfig = config.get('Services.CamaraApi');
CamaraApiConfigService.setBaseUrl(camaraApiConfig.baseUrl);
CamaraApiConfigService.setNewsMethodPath(camaraApiConfig.newsMethodPath);
CamaraApiConfigService.setNewsItemMethodPath(camaraApiConfig.newsItemMethodPath);
CamaraApiConfigService.setIncrementNewsViewsMethodPath(camaraApiConfig.incrementNewsViewsMethodPath);
CamaraApiConfigService.setPageMethodPath(camaraApiConfig.pageMethodPath);
CamaraApiConfigService.setPagesMethodPath(camaraApiConfig.pagesMethodPath);
CamaraApiConfigService.setLicitacaoDownloadEventFilePath(camaraApiConfig.licitacaoDownloadEventFilePath);
CamaraApiConfigService.setAllLicitacoesEventsMethodPath(camaraApiConfig.allLicitacoesEvents);
CamaraApiConfigService.setLicitacoesMethodPath(camaraApiConfig.licitacoesMethodPath);
CamaraApiConfigService.setLicitacaoMethodPath(camaraApiConfig.licitacaoMethodPath);
CamaraApiConfigService.setLegislativePropositionsMethodPath(camaraApiConfig.legislativePropositionsMethodPath);
CamaraApiConfigService.setLegislativePropositionMethodPath(camaraApiConfig.legislativePropositionMethodPath);
CamaraApiConfigService.setLegislativePropositionDownloadFileAttachmentPath(camaraApiConfig.legislativePropositionDownloadFileAttachmentPath);
CamaraApiConfigService.setPublicFilesGetAllPublicFilesMethodPath(camaraApiConfig.publicFilesGetAllPublicFilesMethodPath);
CamaraApiConfigService.setPublicFilesDownloadFilePathMethodPath(camaraApiConfig.publicFilesDownloadFilePathMethodPath);
CamaraApiConfigService.setPublicFilesGetPublicFileMetaMethodPath(camaraApiConfig.publicFilesGetPublicFileMetaMethodPath);

var elasticSearchApiConfig = config.get('Services.ElasticSearch');
ElasticSearchApiConfigService.setConnectionConfig(elasticSearchApiConfig.connectionConfig);
ElasticSearchApiConfigService.setPortalCamaraIndexName(elasticSearchApiConfig.portalCamaraIndexName);
ElasticSearchApiConfigService.setPortalCamaraIndexConfigBody(elasticSearchApiConfig.portalCamaraIndexConfigBody);
ElasticSearchApiConfigService.setMaxWordsToExtractFromDocuments(elasticSearchApiConfig.maxWordsToExtractFromDocuments);
ElasticSearchApiConfigService.setDbURI(elasticSearchApiConfig.dbUri);
ElasticSearchApiConfigService.setIndexers(elasticSearchApiConfig.indexers);
ElasticSearchApiConfigService.setIndexerSchedule(elasticSearchApiConfig.indexerSchedule);
ElasticSearchApiConfigService.setCleaningSchedule(elasticSearchApiConfig.cleaningSchedule);
ElasticSearchApiConfigService.setRemoveUnprocessedElements(elasticSearchApiConfig.removeUnprocessedElements);
if (elasticSearchApiConfig.maxItems) {
   ElasticSearchApiConfigService.setMaxItems(elasticSearchApiConfig.maxItems);
} else {
   ElasticSearchApiConfigService.setMaxItems(-1);
}

ElasticSearchApiConfigService.setAdminUsername(elasticSearchApiConfig.adminUsername);
ElasticSearchApiConfigService.setAdminPassword(elasticSearchApiConfig.adminPassword);

var syslegisApiConfig = config.get('Services.SyslegisApi');
SyslegisApiConfigService.setBaseUrl(syslegisApiConfig.baseUrl);
SyslegisApiConfigService.setPesquisaMateriasMethodPath(syslegisApiConfig.pesquisaMateriasMethodPath);
SyslegisApiConfigService.setOrdensDoDiaMethodPath(syslegisApiConfig.ordensDoDiaMethodPath);
SyslegisApiConfigService.setDownloadTextoOriginalUrl(syslegisApiConfig.downloadTextoOriginalUrl);

//models config
var DbModule = require('./models/Db.js');
var IndexerExecutionLogModule = require('./models/IndexerExecutionLog.js');
DbModule.setDbURI(ElasticSearchApiConfigService.getDbURI());
DbModule.useMock(false);

/*****************************************************************************
********************* MIDDLEWARES CONFIG SECTION *****************************
******************************************************************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set Cross Origin Resource Sharing (CORS)
//see: http://restlet.com/company/blog/2015/12/15/understanding-and-using-cors/
app.use(cors());
app.options('*', cors());

DbModule.connect(function(mongoose, connection) {
   //config models
   IndexerExecutionLogModule.setMongoose(mongoose);
   IndexerExecutionLogModule.setConnection(connection);
   ModuleIndexerExecutionLogModule.setMongoose(mongoose);
   ModuleIndexerExecutionLogModule.setConnection(connection);
   ResumeIndexExecutionModule.setMongoose(mongoose);
   ResumeIndexExecutionModule.setConnection(connection);
});

//schedule index tasks
IndexerScheduleService.scheduleAllCleanTasks();

//schedule index tasks
IndexerScheduleService.scheduleAllIndexTasks();

//routes config
// indexer routes
var indexerRoutes = require('./routes/index.js')
app.use('/', indexerRoutes);

//check if there is a execution to be resumed
//and if there is then resume
MainIndexer.resumeIndexExecution();

/*****************************************************************************
************************** ERROR HANDLING SECTION ****************************
/*****************************************************************************/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === Utils.getUnauthorizedErrorName()) {
       res.status(401);
       res.json({"message" : err.name + ": " + err.message});
   } else {
      next(err);
   }
});

app.use(function(err, req, res, next) {
   Utils.sendJSONErrorResponse( res,
                                err.status || 500,
                                err );
});

module.exports = app;
