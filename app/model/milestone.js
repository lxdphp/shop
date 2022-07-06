/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const Milestone = app.model.define('milestone', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      event_at: {
        type: DATE
      },
      event_content: {
        type: STRING
      },
      schedule_uuid: {
        type: UUID
      },
      line_color: {
        type: STRING
      },
      line_type: {
        type: STRING
      },
      created_user_uuid: {
        type: UUID
      },
      // updated_user_uuid: {
      //   type: UUID
      // },
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
      model: {
        type: STRING
      }
    },{
      timestamps: false,
      freezeTableName: true,
    }
    );
   
   
    return Milestone;
  }