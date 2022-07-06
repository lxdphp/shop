/**
 * 用户模型
 */
 module.exports = app => {
  const DataTypes = require('sequelize').DataTypes;
  const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
  const Category = app.model.define('category', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING
    },
    pid: {
      type: STRING
    },
    created_time: {
      type: DATE
    }
  },{
    timestamps: false,
    freezeTableName: true,
  }
  );
  // Category.associate = function (){
  //   Category.belongsTo(app.model.PermissionRules, {foreignKey: 'uuid', targetKey: 'entity_uuid'} )
  // }
 
  return Category;
}