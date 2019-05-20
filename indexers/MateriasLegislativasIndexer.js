/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var indexerPrototype = require('./IndexerPrototype.js');
var winston = require('winston');
var tika = require('tika');
var _ = require('lodash');

var SyslegisService = require('../services/camara/SyslegisService.js');
var SyslegisApiConfigService = require('../services/camara/SyslegisApiConfigService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

/*****************************************************************************
********************************** Config ************************************
/*****************************************************************************/
var _limit = 1000;
var _type = "materia_legislativa";
var _typeDescription = "Matéria Legislativa";

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
   var _offset = 0;
   var _total = 0;

   //fetch elements from data source
   var _fetchMoreElements = function(offset, limit) {
      return SyslegisService
             .pesquisaMateriasLegislativas({
                'offset': offset,
                'limit': limit
             }).then(function(result) {
               if ( result &&
                    result.materiasLegislativas &&
                    result.materiasLegislativas.length > 0) {
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
            return _fetchMoreElements( //fetch elements from data source
               _offset,
               _limit
            ).then(function() {
               winston.verbose("total = " + _result.total);
               _total = _result.total;
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
                   _result.materiasLegislativas &&
                   _index >= 0 &&
                   _index < _result.materiasLegislativas.length
         }
      },
      getSummaryData: {
         value: function () {
            if (this.hasMoreElements()) {
               var currentRow = _result.materiasLegislativas[_index];
               return {
                  'type': _type,
                  'id': currentRow.id,
                  'properties' : {
                     'type': _type,
                     'typeDescription': _typeDescription,
                     'subtypeDescription': currentRow.tipoDocumento,
                     'datasourceId': currentRow.id,
                     'date': currentRow.ultimaAtualizacao,
                     'title': currentRow.tipoDocumento + " " + _.padStart(currentRow.numero, 3, '0') + "/" + currentRow.ano,
                     'description': currentRow.ementa
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
               var currentRow = _result.materiasLegislativas[_index];
               return new Promise(function(resolve, reject) {
                  tika.type( //content type detection to avoid error in the parse
                     SyslegisApiConfigService.getDownloadTextoOriginalUrl() + currentRow.id,
                     function(err, contentType) {
                        if (!err) {
                           tika.extract( //extract the text from document
                              SyslegisApiConfigService.getDownloadTextoOriginalUrl() + currentRow.id,
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
                                      'id': currentRow.id,
                                      'properties' : {
                                         'type': _type,
                                         'typeDescription': _typeDescription,
                                         'subtypeDescription': currentRow.tipoDocumento,
                                         'datasourceId': currentRow.id,
                                         'date': currentRow.ultimaAtualizacao,
                                         'title': currentRow.tipoDocumento + " " + _.padStart(currentRow.numero, 3, '0') + "/" + currentRow.ano,
                                         'description': currentRow.ementa,
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
                  _offset += _result.materiasLegislativas.length;
                  if(_offset < _total) {
                     //fetch more elements
                     return _fetchMoreElements( //fetch elements from data source
                        _offset,
                        _limit
                     );
                  }
               }
            }
         }
      }
   });
}
