#!/usr/bin/env node
/*****************************************************************************
********************** START APPLICATION SCRIPT ******************************
/*****************************************************************************/
var winston = require('winston');
var config = require('config');

/*****************************************************************************
***************************** APP CONFIG SECTION *****************************
******************************************************************************/
var logConfig = config.get("Log");
//log configuration
winston.setLevels(logConfig.levels);
winston.addColors(logConfig.levelsColors);
winston.configure({
    transports: [
      new (winston.transports.Console)({ colorize: true })
    ]
 });
winston.level = logConfig.level;

//HTTP SERVER START
var app = require('../app.js');
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), '0.0.0.0', 512, function() {
   winston.info('Express server listening on port %d', server.address().port);
});
