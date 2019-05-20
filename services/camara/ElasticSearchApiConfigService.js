/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
// ...

/*****************************************************************************
****************************** Flickr API Config  ****************************
/*****************************************************************************/
var _connectionConfig; //Ex, "https://localhost:9002"
var _portalCamaraIndexName; //Ex, "portalCamara"
var _portalCamaraIndexConfigBody;
var _maxWordsToExtractFromDocuments;
var _dbURI;//connection to mondodb which stores this module execution log
var _indexers; // array of string, each string is the path
               // (relative to ./indexers folder)
               // of an module indexer
var _indexerSchedule; //array of string in cron-style
var _maxItems; //max items to index for each module index
var _cleaningSchedule;
var _removeUnprocessedElements = false;
var _adminUsername;
var _adminPassword;


/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/

/*****************************************************************************
************************** Module Setters and Getters*************************
/*****************************************************************************/
module.exports.setConnectionConfig = function(connectionConfig) {
   _connectionConfig = connectionConfig;
}

module.exports.getConnectionConfig = function() {
   return _connectionConfig;
}

module.exports.setPortalCamaraIndexName = function(portalCamaraIndexName) {
   _portalCamaraIndexName = portalCamaraIndexName;
}

module.exports.getPortalCamaraIndexName = function() {
   return _portalCamaraIndexName;
}

module.exports.setPortalCamaraIndexConfigBody = function(portalCamaraIndexConfigBody) {
   _portalCamaraIndexConfigBody = portalCamaraIndexConfigBody;
}

module.exports.getPortalCamaraIndexConfigBody = function() {
   return _portalCamaraIndexConfigBody;
}

module.exports.setMaxWordsToExtractFromDocuments = function(maxWordsToExtractFromDocuments) {
   _maxWordsToExtractFromDocuments = maxWordsToExtractFromDocuments;
}

module.exports.getMaxWordsToExtractFromDocuments = function() {
   return _maxWordsToExtractFromDocuments;
}

module.exports.setDbURI = function(dbURI) {
   _dbURI = dbURI;
}

module.exports.getDbURI = function() {
   return _dbURI;
}

module.exports.setIndexers = function(indexers) {
   _indexers = indexers;
}

module.exports.getIndexers = function() {
   return _indexers;
}

module.exports.setIndexerSchedule = function(indexerSchedule) {
   _indexerSchedule = indexerSchedule;
}

module.exports.getIndexerSchedule = function() {
   return _indexerSchedule;
}

module.exports.setMaxItems = function(maxItems) {
   _maxItems = maxItems;
}

module.exports.getMaxItems = function() {
   return _maxItems;
}

module.exports.setCleaningSchedule = function(cleaningSchedule) {
   _cleaningSchedule = cleaningSchedule;
}

module.exports.getCleaningSchedule = function() {
   return _cleaningSchedule;
}

module.exports.setRemoveUnprocessedElements = function(removeUnprocessedElements) {
   _removeUnprocessedElements = removeUnprocessedElements;
}

module.exports.haveToRemoveUnprocessedElements = function() {
   return _removeUnprocessedElements;
}

module.exports.setAdminPassword = function(adminPassword) {
   _adminPassword = adminPassword;
}

module.exports.getAdminPassword = function() {
   return _adminPassword;
}

module.exports.setAdminUsername = function(adminUsername) {
   _adminUsername = adminUsername;
}

module.exports.getAdminUsername = function() {
   return _adminUsername;
}
