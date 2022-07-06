/**
 * 用户模型
 */
 module.exports = app => {
    const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
    const PermissionRules = app.model.define('permission_rules', {
      uuid: {
        type: UUID,
        primaryKey: true
      },
      rule_type: {
        type: STRING
      },
      entity_type: {
        type: STRING
      },
      entity_uuid: {
        type: STRING
      },
      operation_type: {
        type: STRING
      },
      allow: {
        type: BOOLEAN
      },
      role_uuid: {
        type: UUID
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
    PermissionRules.associate = function (){
      PermissionRules.belongsTo(app.model.PermissionRulesBusiness, {foreignKey: 'entity_uuid', targetKey: 'uuid'} )
    }
    return PermissionRules;
  }