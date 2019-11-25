/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var indexerPrototype = require('./IndexerPrototype.js');
var winston = require('winston');
var tika = require('tika');
var _ = require('lodash');

var LicitacaoService = require('../services/camara/LicitacaoService.js');
var CamaraApiConfigService = require('../services/camara/CamaraApiConfigService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

/*****************************************************************************
********************************** Config ************************************
/*****************************************************************************/
var _pageSize = 100;
var _type = "licitacao";
var _typeDescription = "Licitação";

/*****************************************************************************
********************************** Private ***********************************
/*****************************************************************************/
var _getRepresentativaDate = function(licitacaoEventRow) {
   var licitacaoEventDate = licitacaoEventRow.changedDate ? licitacaoEventRow.changedDate : licitacaoEventRow.creationDate;
   var licitacaoEventDateObj = new Date(licitacaoEventDate);
   var licitacaoDate = null;
   var licitacaoDateObj = null;
   if (licitacaoEventRow.licitacao) {
      licitacaoDate = licitacaoEventRow.licitacao.changedDate ? licitacaoEventRow.licitacao.changedDate : licitacaoEventRow.licitacao.creationDate;
      licitacaoDateObj = new Date(licitacaoDate);
      if (licitacaoEventDateObj.getTime() > licitacaoDateObj.getTime()) {
         return licitacaoEventDate;
      } else {
         return licitacaoDate;
      }
   } else {
      return licitacaoEventDate;
   }
}

var _getTitle = function(licitacaoEventRow) {
   if (licitacaoEventRow && licitacaoEventRow.licitacao) {
      return licitacaoEventRow.licitacao.category.description + " " +
               _.padStart(licitacaoEventRow.licitacao.number, 3, '0') + "/" +
               licitacaoEventRow.licitacao.year + " - " +
               licitacaoEventRow.description;
   } else {
      return "";
   }
}

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
      return LicitacaoService
             .getAllLicitacoesEvents(page, pageSize)
             .then(function(result) {
               if ( result &&
                    result.licitacoesEvents &&
                    result.licitacoesEvents.length > 0) {
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
                   _result.licitacoesEvents &&
                   _index >= 0 &&
                   _index < _result.licitacoesEvents.length
         }
      },
      getSummaryData: {
         value: function () {
            if (this.hasMoreElements()) {
               var currentRow = _result.licitacoesEvents[_index];
               return {
                  'type': _type,
                  'id': currentRow._id,
                  'properties' : {
                     'type': _type,
                     'typeDescription': _typeDescription,
                     'subtypeDescription': currentRow.licitacao && currentRow.licitacao.category ? currentRow.licitacao.category.description : null,
                     'datasourceId': currentRow._id,
                     'dateDescription': currentRow.date ? currentRow.date : null,
                     'date': _getRepresentativaDate(currentRow),
                     'title': _getTitle(currentRow),
                     'description': currentRow.licitacao ? currentRow.licitacao.description : currentRow.description
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
               var currentRow = _result.licitacoesEvents[_index];
               return new Promise(function(resolve, reject) {
                  tika.type( //content type detection to avoid error in the parse
                     CamaraApiConfigService.getBaseUrl() +
                     CamaraApiConfigService.getLicitacaoDownloadEventFilePath() + "/" + currentRow._id,
                     function(err, contentType) {
                        if (!err) {
                           tika.extract( //extract the text from document
                              CamaraApiConfigService.getBaseUrl() +
                              CamaraApiConfigService.getLicitacaoDownloadEventFilePath() + "/" + currentRow._id,
                              {
                                 'contentType': contentType,
                                 'maxLength': ElasticSearchApiConfigService.getMaxWordsToExtractFromDocuments(),
                                 'pdfExtractInlineImages': false,
                                 'pdfExtractAnnotationText': false
                              },
                              function(err, text, meta) {
                                 if (!err) {
                                    resolve({
                                      'type': _type,
                                      'id': currentRow._id,
                                      'properties' : {
                                         'type': _type,
                                         'typeDescription': _typeDescription,
                                         'subtypeDescription': currentRow.licitacao && currentRow.licitacao.category ? currentRow.licitacao.category.description : null,
                                         'datasourceId': currentRow._id,
                                         'date': _getRepresentativaDate(currentRow),
                                         'title': _getTitle(currentRow),
                                         'description': currentRow.licitacao ? currentRow.licitacao.description : currentRow.description,
                                         'contentType': contentType,
                                         'text': text
                                      }
                                    });
                                 } else { //error in text extraction
                                   reject(err);
                                 }
                              }
                           );
                        } else { //error in content type detection
                           reject(err);
                        }
                     }
                  ); //end content type detection
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
