
    module.exports = app => {
       const DataTypes = require('sequelize').DataTypes;
       const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
       const Resources = app.model.define('resources', 
       {uuid: {  type: UUID,  primaryKey: true,  defaultValue: DataTypes.UUIDV4,},schedule_uuid: {  type: UUID},member_uuid: {  type: UUID},member_name: {  type: STRING},description: {  type: STRING},department_uuid: {  type: UUID},department_name: {  type: STRING,},member_level: {  type: STRING},project_name: {  type: STRING},project_uuid: {  type: UUID},created_user_uuid: {  type: UUID},edit_user_uuid: {  type: UUID},created_at: {  type: DATE},updated_at: {  type: DATE},retirement_at: {  type: DATE},retirement_status: {  type: STRING, defaultValue: '1'},new_select_test: {
        type: STRING
       },test_select: {
        type: STRING
       },level_arter: {
        type: STRING
       },},{
        timestamps: false,
        freezeTableName: true,
      }
       );
       //Resources.sync({alter:true})
       return Resources;
     }
