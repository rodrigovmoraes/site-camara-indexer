/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
var winston = require('winston');
var _ = require('lodash');
var _camaraApiConfigService = require('./CamaraApiConfigService.js');

/*****************************************************************************
******************************* PRIVATE **************************************
/*****************************************************************************/
var _monthsDescription = ['JAN', 'Fev', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/*****************************************************************************
******************************* PUBLIC ***************************************
*****************************************************************************/
//module methods

//Error handler for functions that are to be used in async.series method.
//This should be done in order to improve error reporting,
//if a function is not surronded by this handler in the async.series method,
//the async will not be able to catch an error thrown by the function
module.exports.handleErrorForAsync = function(fn, resultOnError) {
   if(resultOnError == undefined){
      resultOnError = false;
   }
   return function(done) {
      try {
         fn(done);
      } catch(err) {
         done(err, resultOnError);
      }
   }
};

module.exports.toDateFromDDMMYYYY = function(strDate) {
   var dateParts = strDate.split("/");
   var days = parseInt(dateParts[0]);
   var months = parseInt(dateParts[1]) - 1;
   var years = parseInt(dateParts[2]);
   return new Date(years, months, days);
}

module.exports.toDDMMYYYYHHhmm = function(pdate) {
   if(pdate) {
      return _.padStart(pdate.getDate(), 2, '0') + "/" +
                        _.padStart(pdate.getMonth() + 1, 2, '0')  + "/" +
                        _.padStart(pdate.getFullYear(), 4, '0') + " " +
                        _.padStart(pdate.getHours(), 2, '0') + "h" +
                        _.padStart(pdate.getMinutes(), 2, '0')
   } else {
      return "";
   }
}

module.exports.toDDMMYYYY = function(pdate) {
   if(pdate) {
      return _.padStart(pdate.getDate(), 2, '0') + "/" +
             _.padStart(pdate.getMonth() + 1, 2, '0')  + "/" +
             _.padStart(pdate.getFullYear(), 4, '0')
   } else {
      return "";
   }
}

//build a string describing how much time has elapsed
//since pdate: eg. 15 minitos atrás, 1 dia atrás, 2 horas atrás,
//3 horas atrás
module.exports.getElapsedTimeDescription = function(pdate) {
   if(pdate) {
      var now = new Date();
      var desc = "";
      var diff = now.getTime() - pdate.getTime();
      //days, hours, minutes
      var days = Math.floor( diff / (1000 * 60 * 60 * 24) );
      diff = diff - days * (1000 * 60 * 60 * 24);
      var hours = Math.floor( diff / (1000 * 60 * 60) );
      diff = diff - hours * (1000 * 60 * 60);
      var minutes = Math.floor( diff / (1000 * 60) );
      if(days > 0) {
         desc = days + (days > 1 ? " dias" : " dia");
      } else if(hours > 0) {
         desc = hours + (hours > 1 ? " horas" : " hora");
      } else {
         if(minutes <= 0) {
            minutes = 1;
         }
         desc = minutes + (minutes > 1 ? " minutos" : " minuto");
      }
      if(desc !== "") {
         desc += " atrás"
      }
      return desc;
   } else {
      return "";
   }
}

//build a string describing how much time (in day precision) has elapsed
//since pdate
module.exports.getElapsedTimeDescriptionDayPrecision = function(pdate) {
   if(pdate) {
      var now = new Date();
      now.setMilliseconds(0);
      now.setSeconds(0);
      now.setMinutes(0);
      now.setHours(0);
      var anotherDate = new Date(pdate);
      anotherDate.setMilliseconds(0);
      anotherDate.setSeconds(0);
      anotherDate.setMinutes(0);
      anotherDate.setHours(0);

      var desc = "";
      var diff = now.getTime() - anotherDate.getTime();
      //days, hours, minutes
      var days = Math.floor( diff / (1000 * 60 * 60 * 24) );

      if(days === 0) {
         desc = "hoje";
      } else if(days === 1) {
         desc = "ontem";
      } else if(days > 1) {
         desc = days + " dias atrás";
      } else {
         desc = "";
      }
      return desc;
   } else {
      return "";
   }
}

module.exports.getTodayRange = function(utcOffset) {
   var now = new Date();
   var day = _.padStart(now.getDate(), 2, '0');
   var month = _.padStart(now.getMonth() + 1, 2, '0');
   var year = _.padStart(now.getFullYear(), 4, '0');
   var utcOffsetValue = _camaraApiConfigService.getEventsCalendarUTCOffset();
   var utcOffset = _.padStart(Math.abs(utcOffsetValue), 2, '0');
   var minDateStr = year + "-" + month + "-" + day + "T00:00:00" + (utcOffsetValue >= 0 ? "+" : "-") + utcOffset + ":00";

   var minDate = new Date(minDateStr);
   var maxDate = new Date(minDate.getTime());
   maxDate.setDate(maxDate.getDate() + 1);
   return { 'minDate' : minDate,
            'maxDate' : maxDate
          }
}

module.exports.getTodayDescription = function(utcOffset) {
   var now = new Date();
   return _.padStart(now.getDate(), 2, '0') + "/" + _monthsDescription[now.getMonth()];
}

module.exports.next = function(httpStatus, err, next) {
   if(err) {
      err.status = httpStatus ? httpStatus : 500;
   }
   if(err.error) {
      next(err.error);
   } else {
      next(err);
   }
}
