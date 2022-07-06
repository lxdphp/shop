/**
 * 用户模型
 */
 module.exports = app => {
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const Entities = app.model.define('entities', {
      uuid: {
        type: UUID,
        primaryKey: true
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
    }
    );
   
   
    return Entities;
  }