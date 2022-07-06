/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const Events = app.model.define('events', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      schedule_uuid: {
        type: UUID
      },
      resources_uuid: {
        type: UUID
      },
      content: {
        type: STRING
      },
      start_at: {
        type: STRING
      },
      end_at: {
        type: STRING
      },
      color: {
        type: STRING
      },
      created_user_uuid: {
        type: UUID
      },
      edit_user_uuid: {
        type: UUID
      },
      created_at: {
        type: DATE
      },
      updated_at: {
        type: DATE
      },
      retirement_at: {
        type: DATE
      },
      retirement_status: {
        type: STRING
      },
      duration: {
        type: STRING
      },
      progress: {
        type: STRING
      },
      title_oldvalue: {
        type: STRING
      },
    },{
      timestamps: false,
    }
    );
   
   
    return Events;
  }