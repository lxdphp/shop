
    module.exports = app => {
       const DataTypes = require('sequelize').DataTypes;
       const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
       const User = app.model.define('user', 
       {uuid: {type:UUID,primaryKey:true,defaultValue:DataTypes.UUIDV4,},schedules_uuid:{type:UUID},pages_uuid:{type:UUID
},test:{type:UUID},test3:{type:UUID},test6: {
        type: STRING
       },test7: {
        type: STRING
       },test8: {
        type: STRING
       },test9: {
        type: STRING
       },test19: {
        type: STRING
       },test20: {
        type: STRING
       },test21: {
        type: STRING
       },test23: {
        type: STRING
       },test24: {
        type: STRING
       },test25: {
        type: STRING
       },test26: {
        type: STRING
       },test27: {
        type: STRING
       },test28: {
        type: STRING
       },test29: {
        type: STRING
       },test299: {
        type: STRING
       },},{
        timestamps: false,
        freezeTableName: true,
      }
       );
       //User.sync({alter:true})
       return User;
     }