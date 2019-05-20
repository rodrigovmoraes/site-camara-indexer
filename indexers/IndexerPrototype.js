/*****************************************************************************
*************************** DEPENDENCIES SECTION *****************************
******************************* (LIBS MODULES) *******************************
/*****************************************************************************/
// ...

/*****************************************************************************
********************************** Private ***********************************
/*****************************************************************************/
var indexerPrototype = {
   init: function() {
      throw new Error("init: this method must be implemented!");
   },
   getTotal: function() {
      throw new Error("getTotal: this method must be implemented!");
   },
   hasMoreElements: function() {
      throw new Error("hasMoreElements: this method must be implemented!");
   },
   next: function() {
      throw new Error("next: this method must be implemented!");
   },
   getData: function() {
      throw new Error("getData: this method must be implemented!");
      /*
      must return an JSON object with 3 properties: type, id and properties
      Ex:

      { type: 'materia_legislativa',
        id: 122,
        properties: {
            type: 'materia_legislativa',
            typeDescription: 'Materia Legislativa',
            subtypeDescription: 'Moção',
            id: 122,
            date: '2019-03-19 19:44Z', //ISO 8601
            description: 'Lorem Ipsum',
            text: 'Lorem ipsum dolor sit amet, consectetur ...'
        }
      }
      */
   }
}

/*****************************************************************************
************************** Module functions **********************************
/*****************************************************************************/
module.exports = function() {

}
