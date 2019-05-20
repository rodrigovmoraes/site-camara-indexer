/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
// ...

/*****************************************************************************
****************************** Flickr API Config  ****************************
/*****************************************************************************/
var _baseUrl; //Ex, "http://localhost:3002/"
//methods paths
var _portalMenuMethodPath; //Ex, "menuPortalTree"
var _newsMethodPath; //Ex, "newsItems"
var _newsItemMethodPath; //Ex, "newsItem"
var _incrementNewsViewsMethodPath; //Ex, "incrementNewsViews"
var _pageMethodPath; //Ex, "page"
var _pagesMethodPath; //Ex, "pages"
var _bannersMethodPath; //Ex, "banners"
var _hotNewsMethodPath; //Ex, "hotnews"
var _breakingNewsMethodPath; //Ex, "breakingNews"
var _fbreakingNewsMethodPath; //Ex, "fbreakingNews"
var _eventsCalendarMethodPath; //Ex, "eventsCalendar"
var _eventCalendarMethodPath; //Ex, "eventCalendar"
var _eventsCalendarUTCOffset; //Ex, -3
var _lastLicitacoesEventsMethodPath; //Ex, "licitacao/events/last"
var _allLicitacoesEventsMethodPath; //Ex, "licitacao/events/all"
var _licitacaoDownloadEventFilePath; //Ex, "licitacao/event/download"
var _licitacoesMethodPath; //Ex, "licitacoes"
var _licitacoesCategoriesMethodPath; //Ex, "licitacoesCategories"
var _licitacaoMethodPath; //Ex, "licitacao"
var _legislativePropositionsMethodPath; //Ex, "legislativePropositions"
var _legislativePropositionTypesMethodPath; //Ex, "legislativePropositionTypes"
var _legislativePropositionMethodPath; //Ex, "legislativeProposition"
var _legislativePropositionDownloadFileAttachmentPath; //Ex, "legislativeProposition/attachment/download"
var _publicFilesGetAllPublicFilesMethodPath; //Ex, "publicFiles/file/all"
var _publicFilesDownloadFilePathMethodPath; //Ex, "publicFiles/file"
var _publicFilesGetPublicFileMetaMethodPath; //Ex, "publicFiles/file/meta"

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

module.exports.setPortalMenuMethodPath = function(portalMenuMethodPath) {
   _portalMenuMethodPath = portalMenuMethodPath;
}

module.exports.getPortalMenuMethodPath = function() {
   return _portalMenuMethodPath;
}

module.exports.setNewsMethodPath = function(newsMethodPath) {
   _newsMethodPath = newsMethodPath;
}

module.exports.getNewsMethodPath = function() {
   return _newsMethodPath;
}

module.exports.setNewsItemMethodPath = function(newsItemMethodPath) {
   _newsItemMethodPath = newsItemMethodPath;
}

module.exports.getNewsItemMethodPath = function() {
   return _newsItemMethodPath;
}

module.exports.setIncrementNewsViewsMethodPath = function(incrementNewsViewsMethodPath) {
   _incrementNewsViewsMethodPath = incrementNewsViewsMethodPath;
}

module.exports.getIncrementNewsViewsMethodPath = function() {
   return _incrementNewsViewsMethodPath;
}

module.exports.setPageMethodPath = function(pageMethodPath) {
   _pageMethodPath = pageMethodPath;
}

module.exports.getPageMethodPath = function() {
   return _pageMethodPath;
}

module.exports.setPagesMethodPath = function(pagesMethodPath) {
   _pagesMethodPath = pagesMethodPath;
}

module.exports.getPagesMethodPath = function() {
   return _pagesMethodPath;
}

module.exports.setBannersMethodPath = function(bannersMethodPath) {
   _bannersMethodPath = bannersMethodPath;
}

module.exports.getBannersMethodPath = function() {
   return _bannersMethodPath;
}

module.exports.setHotNewsMethodPath = function(hotNewsMethodPath) {
   _hotNewsMethodPath = hotNewsMethodPath;
}

module.exports.getHotNewsMethodPath = function() {
   return _hotNewsMethodPath;
}

module.exports.setBreakingNewsMethodPath = function(breakingNewsMethodPath) {
   _breakingNewsMethodPath = breakingNewsMethodPath;
}

module.exports.getBreakingNewsMethodPath = function() {
   return _breakingNewsMethodPath;
}

module.exports.setFBreakingNewsMethodPath = function(fbreakingNewsMethodPath) {
   _fbreakingNewsMethodPath = fbreakingNewsMethodPath;
}

module.exports.getFBreakingNewsMethodPath = function() {
   return _fbreakingNewsMethodPath;
}

module.exports.setEventsCalendarMethodPath = function(eventsCalendarMethodPath) {
   _eventsCalendarMethodPath = eventsCalendarMethodPath;
}

module.exports.getEventsCalendarMethodPath = function() {
   return _eventsCalendarMethodPath;
}

module.exports.setEventCalendarMethodPath = function(eventCalendarMethodPath) {
   _eventCalendarMethodPath = eventCalendarMethodPath;
}

module.exports.getEventCalendarMethodPath = function() {
   return _eventCalendarMethodPath;
}

module.exports.setEventsCalendarUTCOffset = function(eventsCalendarUTCOffset) {
   _eventsCalendarUTCOffset = eventsCalendarUTCOffset;
}

module.exports.getEventsCalendarUTCOffset = function() {
   return _eventsCalendarUTCOffset;
}

module.exports.setLastLicitacoesEventsMethodPath = function(lastLicitacoesEventsMethodPath) {
   _lastLicitacoesEventsMethodPath = lastLicitacoesEventsMethodPath;
}

module.exports.getLastLicitacoesEventsMethodPath = function() {
   return _lastLicitacoesEventsMethodPath;
}

module.exports.setAllLicitacoesEventsMethodPath = function(allLicitacoesEventsMethodPath) {
   _allLicitacoesEventsMethodPath = allLicitacoesEventsMethodPath;
}

module.exports.getAllLicitacoesEventsMethodPath = function() {
   return _allLicitacoesEventsMethodPath;
}

module.exports.setLicitacaoDownloadEventFilePath = function(licitacaoDownloadEventFilePath) {
   _licitacaoDownloadEventFilePath = licitacaoDownloadEventFilePath;
}

module.exports.getLicitacaoDownloadEventFilePath = function() {
   return _licitacaoDownloadEventFilePath;
}

module.exports.setLicitacoesMethodPath = function(licitacoesMethodPath) {
   _licitacoesMethodPath = licitacoesMethodPath;
}

module.exports.getLicitacoesMethodPath = function() {
   return _licitacoesMethodPath;
}

module.exports.setLicitacoesCategoriesMethodPath = function(licitacoesCategoriesMethodPath) {
   _licitacoesCategoriesMethodPath = licitacoesCategoriesMethodPath;
}

module.exports.getLicitacoesCategoriesMethodPath = function() {
   return _licitacoesCategoriesMethodPath;
}

module.exports.setLicitacaoMethodPath = function(licitacaoMethodPath) {
   _licitacaoMethodPath = licitacaoMethodPath;
}

module.exports.getLicitacaoMethodPath = function() {
   return _licitacaoMethodPath;
}

module.exports.setLegislativePropositionsMethodPath = function(legislativePropositionsPath) {
   _legislativePropositionsPath = legislativePropositionsPath;
}

module.exports.getLegislativePropositionsMethodPath = function() {
   return _legislativePropositionsPath;
}

module.exports.setLegislativePropositionTypesMethodPath = function(legislativePropositionTypesMethodPath) {
   _legislativePropositionTypesMethodPath = legislativePropositionTypesMethodPath;
}

module.exports.getLegislativePropositionTypesMethodPath = function() {
   return _legislativePropositionTypesMethodPath;
}

module.exports.setLegislativePropositionMethodPath = function(legislativePropositionMethodPath) {
   _legislativePropositionMethodPath = legislativePropositionMethodPath;
}

module.exports.getLegislativePropositionMethodPath = function() {
   return _legislativePropositionMethodPath;
}

module.exports.setLegislativePropositionDownloadFileAttachmentPath = function(legislativePropositionDownloadFileAttachmentPath) {
   _legislativePropositionDownloadFileAttachmentPath = legislativePropositionDownloadFileAttachmentPath;
}

module.exports.getLegislativePropositionDownloadFileAttachmentPath = function() {
   return _legislativePropositionDownloadFileAttachmentPath;
}

module.exports.setPublicFilesGetAllPublicFilesMethodPath = function(publicFilesGetAllPublicFilesMethodPath) {
   _publicFilesGetAllPublicFilesMethodPath = publicFilesGetAllPublicFilesMethodPath;
}

module.exports.getPublicFilesGetAllPublicFilesMethodPath = function() {
   return _publicFilesGetAllPublicFilesMethodPath;
}

module.exports.setPublicFilesDownloadFilePathMethodPath = function(publicFilesDownloadFilePathMethodPath) {
   _publicFilesDownloadFilePathMethodPath = publicFilesDownloadFilePathMethodPath;
}

module.exports.getPublicFilesDownloadFilePathMethodPath = function() {
   return _publicFilesDownloadFilePathMethodPath;
}

module.exports.setPublicFilesGetPublicFileMetaMethodPath = function(publicFilesGetPublicFileMetaMethodPath) {
   _publicFilesGetPublicFileMetaMethodPath = publicFilesGetPublicFileMetaMethodPath;
}

module.exports.getPublicFilesGetPublicFileMetaMethodPath = function() {
   return _publicFilesGetPublicFileMetaMethodPath;
}
