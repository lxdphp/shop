/**
 * 用户模型
 */
 module.exports = app => {
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const DayRules = app.model.define('day_rules', 
    {
      uuid: {
        type: UUID,
        primaryKey: true
      },
      description: {
        type: STRING
      },
      start_at: {
        type: DATE
      },
      end_at: {
        type: DATE
      },
      font_size: {
        type: STRING
      },
      font_color: {
        type: STRING
      },
      working: {
        type: BOOLEAN
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
    },
    {
      timestamps: false,
    }
    );
   
   
    return DayRules;
  }