/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/

/*****************************************************************************
******************************* PRIVATE **************************************
/*****************************************************************************/
var _connection;
var _mongoose;
var _model;
var _modelInitialized = false;
var _modelName = 'IndexerExecutionLog';

var _createModelSchema = function(mongoose) {
   //banner schema definition
   var indexerExecutionLogSchema = new mongoose.Schema({
     startDate: {
        type: Date,
        required: true,
        unique: false
     },
     endDate: {
        type: Date,
        required: true,
        unique: false
     },
     totalItems : {
        type: Number,
        required: true,
        unique: false,
        default: 0
     },
     amountOfNewItems : {
        type: Number,
        required: true,
        unique: false,
        default: 0
     },
     amountOfProcessedItems : {
        type: Number,
        required: true,
        unique: false,
        default: 0
     },
     amountOfUpdatedItems : {
        type: Number,
        required: true,
        unique: false,
        default: 0
     },
     amountOfRemovedItems : {
        type: Number,
        required: true,
        unique: false,
        default: 0
     },
     amountOfItemsWithError: {
        type: Number,
        required: true,
        unique: false,
        default: 0
     },
     error: {
        type: String,
        required: false,
        unique: false,
        default: null
     }
   });

   return indexerExecutionLogSchema;
}

/*****************************************************************************
******************************* PUBLIC ***************************************
/*****************************************************************************/
module.exports.setConnection = function(connection) {
   _connection = connection;
}

module.exports.setMongoose = function(mongoose) {
   _mongoose = mongoose;
}

module.exports.getMongoose = function() {
   return _mongoose;
}

module.exports.getModel = function() {
   //if the model hasn´t been initialized, we should create the schema
   if(!_modelInitialized) {
      var schema = _createModelSchema(_mongoose);
      var model = _connection.model(_modelName, schema);
      var deepPopulate = require('mongoose-deep-populate')(_mongoose);
      schema.plugin(deepPopulate, {});
      _modelInitialized = true;
      return model;
   } else {
      return _connection.model(_modelName);
   }
}
