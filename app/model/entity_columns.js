/**
 * 用户模型
 */
 module.exports = app => {
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const DataTypes = require('sequelize').DataTypes;
    const EntityColumns = app.model.define('entity_columns', {
      uuid: {
        type: UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: STRING
      },
      name: {
        type: STRING
      },
      description: {
        type: STRING
      },
      entity_type: {
        type: STRING
      },
      data_type: {
        type: STRING
      },
      field_type: {
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
      properties: {
        type: STRING
      },
      is_display: {
        type: STRING
      },
      is_fill: {
        type: BOOLEAN
      },
      width: {
        type: STRING
      },
      disabled: {
        type: BOOLEAN
      },
      is_add: {
        type: STRING
      },
    },{
      timestamps: false,
    }
    );
   
   
    return EntityColumns;
  }