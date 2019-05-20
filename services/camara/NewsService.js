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
var _getNewsMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getNewsMethodPath();
}

var _getNewsItemMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getNewsItemMethodPath();
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
module.exports.getNews = function(page, pageSize) {
   return _requestService({
      url: _getNewsMethodURL(),
      method: "GET",
      json: true,
      qs: {
        'page': page,
        'pageSize': pageSize,
        'publication': 'PUBLISHED'
      }
   }).then(function(data) {
      return data;
   });
}

module.exports.getNewsItem = function(newsItemId) {
   return _requestService({
      url: _getNewsItemMethodURL() + "/" + newsItemId,
      method: "GET",
      json: true
   }).then(function(data) {
      return data;
   });
}
