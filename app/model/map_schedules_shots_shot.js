/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const MapSchedulesBdShotsShot = app.model.define('map_schedules_bd_shots_shot', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      schedules_bd_uuid: {
        type: UUID
      },
      shots_uuid: {
        type: UUID
      },
      created_at: {
        type: DATE
      }
    },{
      timestamps: false,
      freezeTableName: true,
    }
    );

   
    return MapSchedulesBdShotsShot;
  }