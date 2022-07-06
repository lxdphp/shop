/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const SchedulesManage = app.model.define('schedules_manage', {
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
      project_name: {
        type: STRING
      },
      setting: {
        type: STRING,
      }
    },{
      timestamps: false,
      freezeTableName: true,
    }
    );
    // Schedules.associate = function (){
    // Schedules.belongsToMany(app.model.Resources, { through: app.model.MapSchedulesResourcesResource,  foreignKey: 'schedules_uuid'})
    // }
    return SchedulesManage;
  }