/**
 * 用户模型
 */
 module.exports = app => {
  const DataTypes = require('sequelize').DataTypes;
  const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
  const Order = app.model.define('order', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
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
  // Order.associate = function (){
  //   Order.belongsTo(app.model.PermissionRules, {foreignKey: 'uuid', targetKey: 'entity_uuid'} )
  // }
 
  return Order;
}