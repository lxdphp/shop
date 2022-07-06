/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const MapResourcesEventsEvent = app.model.define('map_resources_events_event', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      events_uuid: {
        type: UUID
      },
      resources_uuid: {
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
   
   
    return MapResourcesEventsEvent;
  }