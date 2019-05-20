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
var _syslegisApiConfigService = require('./SyslegisApiConfigService.js');

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/
var _getPesquisaMateriasMethodURL = function () {
   return _syslegisApiConfigService.getBaseUrl() +
               _syslegisApiConfigService.getPesquisaMateriasMethodPath();
}

var _getOrdensDoDiaMethodURL = function() {
   return _syslegisApiConfigService.getBaseUrl() +
               _syslegisApiConfigService.getOrdensDoDiaMethodPath();
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
module.exports.pesquisaMateriasLegislativas = function(filter) {
   return _requestService({
      url: _getPesquisaMateriasMethodURL(),
      method: "POST",
      json: true,
      body: {
         "filter" : filter
      }
   }).then(function(data) {
      return data;
   });
}
