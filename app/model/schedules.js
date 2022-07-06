/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const Schedules = app.model.define('schedules', {
      id: {
        type: INTEGER,
        
        autoIncrement: true,
      },
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: STRING
      },
      plan_start_at: {
        type: DATE
      },
      plan_end_at: {
        type: DATE
      },
      description: {
        type: STRING
      },
      status: {
        type: STRING
      },
      created_user_uuid: {
        type: UUID
      },
      created_user_name: {
        type: STRING
      },
      updated_user_uuid: {
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
      pages_uuid: {
        type: UUID,
      },
      pages_from: {
        type: STRING,
        defaultValue: 'pages',
      }
    },{
      timestamps: false,
    }
    );
    
    return Schedules;
  }