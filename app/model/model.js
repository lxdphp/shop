/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const Model = app.model.define('model', {
      id: {
        type: INTEGER,
        autoIncrement: true,
      },
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      model: {
        type: STRING
      },
      setting: {
        type: STRING
      },
      created_user_uuid: {
        type: UUID
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
      }
    },{
      timestamps: false,
      freezeTableName: true,
    }
    );
   
   
    return Model;
  }