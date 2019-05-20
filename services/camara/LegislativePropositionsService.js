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
var _getLegislativePropositionsMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getLegislativePropositionsMethodPath();
}

var _getLegislativePropositionMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getLegislativePropositionMethodPath();
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
module.exports.getLegislativePropositions = function(page, pageSize) {
   return _requestService({
      url: _getLegislativePropositionsMethodURL(),
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

module.exports.getLegislativeProposition = function(legislativePropositionId) {
   return _requestService({
      url: _getLegislativePropositionMethodURL() + "/" + legislativePropositionId,
      method: "GET",
      json: true
   }).then(function(data) {
      return data;
   });
}
