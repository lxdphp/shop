/**
 * 用户模型
 */
 module.exports = app => {
    const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
    const Entities = app.model.define('routers', {
      id: {
        type: INTEGER,
        primaryKey: true
      },
      uuid: {
        type: UUID,
      },
      name: {
        type: STRING
      },
      path: {
        type: STRING
      },
      parent_id: {
        type: INTEGER
      },
      component: {
        type: STRING
      },
      redirect: {
        type: STRING
      },
      meta: {
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