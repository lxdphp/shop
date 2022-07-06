/**
 * 用户模型
 */
 module.exports = app => {
    const DataTypes = require('sequelize').DataTypes;
    const { STRING, INTEGER, UUID, DATE, BOOLEAN, TEXT } = app.Sequelize;
    const Pages = app.model.define('pages', {
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
      },
      shared: {
        type: BOOLEAN
      },
      admin: {
        type: BOOLEAN
      },
      settings: {
        type: TEXT
      },
      model: {
        type: STRING,
      }
    },{
      timestamps: false,
    }
    );
   
   
    return Pages;
  }