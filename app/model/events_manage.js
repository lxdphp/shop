/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const EventsManage = app.model.define('events_manage', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      schedule_uuid: {
        type: UUID
      },
      shots_uuid: {
        type: STRING
      },
      shap: {
        type: STRING
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
      from: {
        type: STRING
      },
      people_num: {
        type: INTEGER
      },
      publish: {
        type: STRING
      }
    },{
      timestamps: false,
      freezeTableName: true,
    }
    );
   
   
    return EventsManage;
  }