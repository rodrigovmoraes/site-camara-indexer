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
var _getAllLicitacoesEventsMethodURL = function () {
   return _camaraApiConfigService.getBaseUrl() +
               _camaraApiConfigService.getAllLicitacoesEventsMethodPath();
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
module.exports.getAllLicitacoesEvents = function(page, pageSize) {
   return _requestService({
      url: _getAllLicitacoesEventsMethodURL(),
      method: "GET",
      json: true,
      qs: {
        'page': page,
        'pageSize': pageSize,
        'state': 1
      }
   }).then(function(data) {
      return data;
   });
}
