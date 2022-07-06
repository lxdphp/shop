/**
 * 用户模型
 */
 module.exports = app => {
  const DataTypes = require('sequelize').DataTypes;
  const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
  const PermissionRulesBusiness = app.model.define('permission_rules_business', {
    id: {
      type: INTEGER,
      
      autoIncrement: true,
    },
    uuid: {
      type: UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: STRING
    },
    code: {
      type: STRING
    },
    description: {
      type: STRING
    },
    // created_user_uuid: {
    //   type: UUID
    // },
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
  },{
    timestamps: false,
    freezeTableName: true,
  }
  );
  PermissionRulesBusiness.associate = function (){
    PermissionRulesBusiness.belongsTo(app.model.PermissionRules, {foreignKey: 'uuid', targetKey: 'entity_uuid'} )
  }
 
  return PermissionRulesBusiness;
}