/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');

/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (OTHERS MODULES) *******************************
/*****************************************************************************/

/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/
var _info = {
   beingExecuted: false,
   currentModulePath: "",
   totalModules: 0,
   modulesExecuted: 0,
   currentModuleProgress: 0
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
module.exports.setBeingExecuted = function(beingExecuted) {
   if (beingExecuted) {
      _info.currentModulePath = '';
      _info.totalModules = 0;
      _info.modulesExecuted = 0;
      _info.currentModuleProgress = 0;
   }
   _info.beingExecuted = beingExecuted;
}

module.exports.getBeingExecuted = function() {
   return _info.beingExecuted;
}

module.exports.setCurrentModulePath = function(currentModulePath) {
   _info.currentModulePath = currentModulePath;
}

module.exports.setTotalModules = function(totalModules) {
   _info.totalModules = totalModules;
}

module.exports.setModulesExecuted = function(modulesExecuted) {
   _info.modulesExecuted = modulesExecuted;
}

module.exports.incModulesExecuted = function() {
   _info.modulesExecuted++;
}

module.exports.setCurrentModuleProgress = function(currentModuleProgress) {
   _info.currentModuleProgress = currentModuleProgress;
}

module.exports.setInfoStatus = function(info) {
   _info = info;
}

module.exports.getInfoStatus = function() {
   return _info;
}
