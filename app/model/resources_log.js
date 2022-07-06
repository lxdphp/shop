/**
 * 用户模型
 */
 module.exports = app => {
  const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const ResourcesLog = app.model.define('resources_log', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      created_user_uuid: {
        type: UUID
      },
      resource_uuid: {
        type: UUID
      },
      created_at: {
        type: DATE
      },
      request_content: {
        type: STRING
      }
    },{
      timestamps: false,
      freezeTableName: true,
    }
    );
   
   
    return ResourcesLog;
  }