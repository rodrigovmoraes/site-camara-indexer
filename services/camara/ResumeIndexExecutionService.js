/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (OTHERS MODULES) *******************************
/*****************************************************************************/
var ResumeIndexExecutionModule = require('../../models/ResumeIndexExecution.js');
var _ = require('lodash');

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/

/*****************************************************************************
*************************** Module Setters ***********************************
/*****************************************************************************/
//...
//..
//.

/*****************************************************************************
**************************  Module functions *********************************
/*****************************************************************************/
module.exports.getResumeIndexExecution = function() {
   var ResumeIndexExecution = ResumeIndexExecutionModule.getModel();
   return ResumeIndexExecution
         .find({})
         .then(function(elements) {
            if (elements && elements.length > 0) {
               return elements[0].resume;
            } else {
               return false;
            }
         });
}

module.exports.setResumeIndexExecution = function( status ) {
   var ResumeIndexExecution = ResumeIndexExecutionModule.getModel();
   var element;

   return ResumeIndexExecution
         .find({})
         .then(function(elements) {
            if (elements && elements.length > 0) {
               element = elements[0];
               element.resume = status;
               return element.save();
            } else {
               element = new ResumeIndexExecution();
               element.resume = status;
               return element.save();
            }
         });
}
