
    module.exports = app => {
      const DataTypes = require('sequelize').DataTypes;
      const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
      const Shots = app.model.define('shots', 
      {uuid: { type: UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4, }, schedule_bd_uuid: { type: UUID }, 
     member_uuid: { type: UUID }, 
     member_name: { type: STRING }, 
     description: { type: STRING }, 
     link_uuid: { type: INTEGER }, 
     link_name: { type: STRING, }, 
     level_arter: { type: STRING }, 
     category_name: { type: STRING }, 
     created_user_uuid: { type: UUID }, 
     edit_user_uuid: { type: UUID }, 
     created_at: { type: DATE }, 
     updated_at: { type: DATE }, 
     retirement_at: { type: DATE }, 
     retirement_status: { type: STRING, defaultValue: '1' },
     id: { type: INTEGER,autoIncrement: true, }, 
     parent_id: { type: INTEGER, },
     shot_name: { type: STRING },from: {
       type: STRING
      },link_color: {
       type: STRING
      },shot_num: {
        type: INTEGER
       }, publish: {
        type: STRING
      }, category_id: {
        type: INTEGER
      },link_sort: {
        type: INTEGER
       },event_start_time: {
        type: INTEGER
       },event_end_time: {
        type: INTEGER
       },},{
       timestamps: false,
       freezeTableName: true,
     }
      );
      //Shots.sync({alter:true})
      return Shots;
    }