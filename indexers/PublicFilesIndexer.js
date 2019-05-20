/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var indexerPrototype = require('./IndexerPrototype.js');
var winston = require('winston');
var tika = require('tika');
var _ = require('lodash');

var PublicFilesService = require('../services/camara/PublicFilesService.js');
var CamaraApiConfigService = require('../services/camara/CamaraApiConfigService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

/*****************************************************************************
********************************** Config ************************************
/*****************************************************************************/
var _pageSize = 100;
var _type = "publicFile";
var _typeDescription = "Arquivo Público";

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
      return PublicFilesService
             .getAllPublicFiles(page, pageSize)
             .then(function(result) {
               if ( result &&
                    result.publicFiles &&
                    result.publicFiles.length > 0) {
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
                   _result.publicFiles &&
                   _index >= 0 &&
                   _index < _result.publicFiles.length
         }
      },
      getSummaryData: {
         value: function () {
            if (this.hasMoreElements()) {
               var currentRow = _result.publicFiles[_index];
               return {
                  'type': _type,
                  'id': currentRow._id,
                  'properties' : {
                     'type': _type,
                     'typeDescription': _typeDescription,
                     'subtypeDescription': currentRow.extension,
                     'datasourceId': currentRow._id,
                     'date': currentRow.creationDate,
                     'title': currentRow.description, //get more detailed title in getDataDetail
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
               var currentRow = _result.publicFiles[_index];
               return new Promise(function(resolve, reject) {
                  tika.type( //content type detection to avoid error in the parse
                     CamaraApiConfigService.getBaseUrl() +
                     CamaraApiConfigService.getPublicFilesDownloadFilePathMethodPath() + "/" + currentRow._id,
                     function(err, contentType) {
                        if (!err) {
                           tika.extract( //extract the text from document
                              CamaraApiConfigService.getBaseUrl() +
                              CamaraApiConfigService.getPublicFilesDownloadFilePathMethodPath() + "/" + currentRow._id,
                              {
                                 'contentType': contentType,
                                 'maxLength': ElasticSearchApiConfigService.getMaxWordsToExtractFromDocuments(),
                                 'pdfExtractInlineImages': false,
                                 'pdfExtractAnnotationText': false
                              },
                              function(err, text, meta) {
                                 if (!err) {
                                    PublicFilesService
                                           .getPublicFileMeta(currentRow._id)
                                           .then(function(result) {
                                              resolve({
                                                'type': _type,
                                                'id': currentRow._id,
                                                'properties' : {
                                                   'type': _type,
                                                   'typeDescription': _typeDescription,
                                                   'subtypeDescription': currentRow.extension,
                                                   'datasourceId': currentRow._id,
                                                   'date': currentRow.creationDate,
                                                   'title': result.folderPath && result.folderPath !== '' ? result.folderPath + " > " + currentRow.description : currentRow.description,
                                                   'description': null,
                                                   'contentType': contentType,
                                                   'text': text
                                                }
                                              });
                                           }).catch(function(fileMetaError) {
                                              reject(fileMetaError);
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
