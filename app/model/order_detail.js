/**
 * 用户模型
 */
 module.exports = app => {
  const DataTypes = require('sequelize').DataTypes;
  const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
  const OrderDetail = app.model.define('order_detail', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    good_id: {
      type: STRING
    },
    phone: {
      type: STRING
    },
    order_id: {
      type: STRING
    },
    num: {
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
  // OrderDetail.associate = function (){
  //   OrderDetail.belongsTo(app.model.PermissionRules, {foreignKey: 'uuid', targetKey: 'entity_uuid'} )
  // }
 
  return OrderDetail;
}