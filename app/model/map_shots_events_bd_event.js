/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const MapShotsEventsBdEvent = app.model.define('map_shots_events_bd_event', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      events_bd_uuid: {
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
   
   
    return MapShotsEventsBdEvent;
  }