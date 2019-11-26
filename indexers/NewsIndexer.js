/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var indexerPrototype = require('./IndexerPrototype.js');
var winston = require('winston');
var _ = require('lodash');
var htmlToText = require('html-to-text');

var NewsService = require('../services/camara/NewsService.js');
var CamaraApiConfigService = require('../services/camara/CamaraApiConfigService.js');
var ElasticSearchApiConfigService = require('../services/camara/ElasticSearchApiConfigService.js');

/*****************************************************************************
********************************** Config ************************************
/*****************************************************************************/
var _pageSize = 100;
var _type = "news";
var _typeDescription = "Notícia";

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
      return NewsService
             .getNews(page, pageSize)
             .then(function(result) {
               if ( result &&
                    result.news &&
                    result.news.length > 0) {
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
                   _result.news &&
                   _index >= 0 &&
                   _index < _result.news.length
         }
      },
      getSummaryData: {
         value: function () {
            if (this.hasMoreElements()) {
               var currentRow = _result.news[_index];
               return {
                  'type': _type,
                  'id': currentRow.id,
                  'properties' : {
                     'type': _type,
                     'typeDescription': _typeDescription,
                     'subtypeDescription': null,
                     'datasourceId': currentRow.id,
                     'date': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                     'title': currentRow.title,
                     'description': currentRow.headline
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
               var currentRow = _result.news[_index];
               return NewsService
                        .getNewsItem(currentRow.id)
                        .then(function(result) {
                           return {
                             'type': _type,
                             'id': currentRow.id,
                             'properties' : {
                                'type': _type,
                                'typeDescription': _typeDescription,
                                'subtypeDescription': null,
                                'datasourceId': currentRow.id,
                                'dateDescription': currentRow.publicationDate ? currentRow.publicationDate : null,
                                'date': currentRow.changedDate ? currentRow.changedDate : currentRow.creationDate,
                                'title': currentRow.title,
                                'description': currentRow.headline,
                                'contentType': "text/html",
                                'text': htmlToText.fromString(result.newsItem.body)
                             }
                          }
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
