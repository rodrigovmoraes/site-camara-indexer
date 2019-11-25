/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var indexerPrototype = require('./IndexerPrototype.js');
var winston = require('winston');
var _ = require('lodash');
var htmlToText = require('html-to-text')

var LegislativePropositionsService = require('../services/camara/LegislativePropositionsService.js');
var CamaraApiConfigService = require('../services/camara/CamaraApiConfigService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

/*****************************************************************************
********************************** Config ************************************
/*****************************************************************************/
var _pageSize = 1000;
var _type = "legislative_proposition";
var _typeDescription = "Propositura";

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
      return LegislativePropositionsService
             .getLegislativePropositions(page, pageSize)
             .then(function(result) {
               if ( result &&
                    result.legislativePropositions &&
                    result.legislativePropositions.length > 0) {
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
                   _result.legislativePropositions &&
                   _index >= 0 &&
                   _index < _result.legislativePropositions.length
         }
      },
      getSummaryData: {
         value: function () {
            if (this.hasMoreElements()) {
               var currentRow = _result.legislativePropositions[_index];
               return {
                  'type': _type,
                  'id': currentRow._id,
                  'properties' : {
                     'type': _type,
                     'typeDescription': _typeDescription,
                     'subtypeDescription': currentRow.typeDescription,
                     'datasourceId': currentRow._id,
                     'date': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                     'title': currentRow.typeDescription + " " + _.padStart(currentRow.number, 3, '0') + "/" + currentRow.year,
                     'description': currentRow.description
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
               var currentRow = _result.legislativePropositions[_index];
               return new Promise(function(resolve, reject) {
                  LegislativePropositionsService
                     .getLegislativeProposition(currentRow._id)
                     .then(function(result) {
                        var legislativeProposition = result.legislativeProposition;
                        resolve({
                          'type': _type,
                          'id': currentRow._id,
                          'properties' : {
                             'type': _type,
                             'typeDescription': _typeDescription,
                             'subtypeDescription': currentRow.typeDescription,
                             'datasourceId': currentRow._id,
                             'date': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                             'dateDescription': currentRow.date ? currentRow.date : null,
                             'title': currentRow.typeDescription + " " + _.padStart(currentRow.number, 3, '0') + "/" + currentRow.year,
                             'description': currentRow.description,
                             'contentType': "text/html",
                             'text': legislativeProposition.consolidatedText && _.trim(legislativeProposition.consolidatedText) !== ""
                                          ? htmlToText.fromString(legislativeProposition.consolidatedText)
                                          : htmlToText.fromString(legislativeProposition.text)
                          }
                        });
                     }).catch(function(err) {
                        reject(err);
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
