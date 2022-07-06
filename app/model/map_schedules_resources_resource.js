/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const MapSchedulesResourcesResource = app.model.define('map_schedules_resources_resource', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      schedules_uuid: {
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

   
    return MapSchedulesResourcesResource;
  }