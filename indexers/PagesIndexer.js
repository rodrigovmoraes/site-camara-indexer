/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var indexerPrototype = require('./IndexerPrototype.js');
var winston = require('winston');
var _ = require('lodash');
var htmlToText = require('html-to-text');

var PagesService = require('../services/camara/PagesService.js');
var CamaraApiConfigService = require('../services/camara/CamaraApiConfigService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

/*****************************************************************************
********************************** Config ************************************
/*****************************************************************************/
var _pageSize = 100;
var _type = "page";
var _typeDescription = "Página";

/*****************************************************************************
********************************** Private ***********************************
/*****************************************************************************/


/*****************************************************************************
************************** Module Setters and Getters*************************
/*****************************************************************************/
module.exports = function() {
   /**************************************************************************
   ************************ PRIVATE PROPERTIES *******************************
   ***************************************************************************/
   var _result = []; //stores the partial result of the total search
   var _index = -1; //index to _result
   var _page = 1;
   var _total = 0;
   var _totalPages = 0;

   //fetch elements from data source
   var _fetchMoreElements = function(page, pageSize) {
      return PagesService
             .getPages(page, pageSize)
             .then(function(result) {
               if ( result &&
                    result.pages &&
                    result.pages.length > 0) {
                  //init data structure
                  _index = 0;
                  _result = result;
               } else {
                  _index = -1;
                  _result = [];
               }
            });
   }

   return Object.create(indexerPrototype, {
      init: {
         value: function() {
            return _fetchMoreElements(_page, _pageSize)
            .then(function() {
               winston.verbose("total = " + _result.totalLength);
               _total = _result.totalLength;
               _totalPages = Math.ceil(_total / _pageSize);
            });
         }
      },
      getTotal: {
         value: function() {
            return _total;
         }
      },
      hasMoreElements: {
         //check if it has more elements in the data source
         value: function() {
            return _result &&
                   _result.pages &&
                   _index >= 0 &&
                   _index < _result.pages.length
         }
      },
      getSummaryData: {
         value: function () {
            if (this.hasMoreElements()) {
               var currentRow = _result.pages[_index];
               return {
                  'type': _type,
                  'id': currentRow._id,
                  'properties' : {
                     'type': _type,
                     'typeDescription': _typeDescription,
                     'subtypeDescription': null,
                     'datasourceId': currentRow._id,
                     'dateDescription': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                     'date': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                     'title': currentRow.title,
                     'description': null
                  }
               }
            } else {
               return null;
            }
         }
      },
      getDataDetail: {
         value: function() {
            if (this.hasMoreElements()) {
               var currentRow = _result.pages[_index];
               return new Promise(function(resolve, reject) {
                           resolve({
                             'type': _type,
                             'id': currentRow._id,
                             'properties' : {
                                'type': _type,
                                'typeDescription': _typeDescription,
                                'subtypeDescription': null,
                                'datasourceId': currentRow._id,
                                'date': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                                'title': currentRow.title,
                                'description': null,
                                'contentType': "text/html",
                                'text': htmlToText.fromString(currentRow.body)
                             }
                          });
               });
            } else {
               return Promise.resolve(null);
            }
         }
      },
      next: {
         value: function() {
            if (this.hasMoreElements()) {
               _index++;
               if (!this.hasMoreElements()) {
                  _page += 1;
                  if (_page <= _totalPages) {
                     //fetch more elements
                     return _fetchMoreElements( //fetch elements from data source
                        _page,
                        _pageSize
                     );
                  }
               }
            }
         }
      }
   });
}
