/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');
var _requestService = require('request-promise');
var _ = require('lodash');
var Utils = require('./Utils.js');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (OTHERS MODULES) *******************************
/*****************************************************************************/
var _camaraApiConfigService = require('./CamaraApiConfigService.js');

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/
var _getAllPublicFilesMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getPublicFilesGetAllPublicFilesMethodPath();
}

var _getPublicFileMetaMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getPublicFilesGetPublicFileMetaMethodPath();
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
module.exports.getAllPublicFiles = function(page, pageSize) {
   return _requestService({
      url: _getAllPublicFilesMethodURL(),
      method: "GET",
      json: true,
      qs: {
        'page': page,
        'pageSize': pageSize
      }
   }).then(function(data) {
      return data;
   });
}

module.exports.getPublicFileMeta = function(fileId) {
   return _requestService({
      url: _getPublicFileMetaMethodURL() + "/" + fileId,
      method: "GET",
      json: true
   }).then(function(data) {
      return data;
   });
}
