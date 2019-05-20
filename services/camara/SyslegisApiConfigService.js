/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
// ...

/*****************************************************************************
****************************** Flickr API Config  ****************************
/*****************************************************************************/
var _baseUrl; //Ex, "http://localhost:3003/"
//methods paths
var _pesquisaMateriasMethodPath;//Ex: "materiasLegislativas"
var _ordensDoDiaMethodPath;//Ex: "ordensDoDia"
var _downloadTextoOriginalUrl;//Ex: "http://www.camarasorocaba.sp.gov.br:8383/syslegis/materiaLegislativa/imprimirTextoIntegral?idMateria="
/*****************************************************************************
*************************** Private Methods **********************************
/*****************************************************************************/

/*****************************************************************************
************************** Module Setters and Getters*************************
/*****************************************************************************/
module.exports.setBaseUrl = function(baseUrl) {
   _baseUrl = baseUrl;
}

module.exports.getBaseUrl = function() {
   return _baseUrl;
}

module.exports.setPesquisaMateriasMethodPath = function(pesquisaMateriasMethodPath) {
   _pesquisaMateriasMethodPath = pesquisaMateriasMethodPath;
}

module.exports.getPesquisaMateriasMethodPath = function() {
   return _pesquisaMateriasMethodPath;
}

module.exports.setOrdensDoDiaMethodPath = function(ordensDoDiaMethodPath) {
   _ordensDoDiaMethodPath = ordensDoDiaMethodPath;
}

module.exports.getOrdensDoDiaMethodPath = function() {
   return _ordensDoDiaMethodPath;
}

module.exports.setDownloadTextoOriginalUrl = function(downloadTextoOriginalUrl) {
   _downloadTextoOriginalUrl = downloadTextoOriginalUrl;
}

module.exports.getDownloadTextoOriginalUrl = function() {
   return _downloadTextoOriginalUrl;
}
