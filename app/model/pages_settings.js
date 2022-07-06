/**
 * 用户模型
 */
 module.exports = app => {
    const { STRING, INTEGER, UUID, DATE, BOOLEAN, TEXT } = app.Sequelize;
    const PagesSettings = app.model.define('page_settings', {
      uuid: {
        type: UUID,
        primaryKey: true
      },
      page_uuid: {
        type: UUID
      },
      settings: {
        type: TEXT
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
   
   
    return PagesSettings;
  }