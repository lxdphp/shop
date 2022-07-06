/**
 * 用户模型
 */
 module.exports = app => {
  const DataTypes = require('sequelize').DataTypes;
  const { STRING, INTEGER, UUID, DATE, BOOLEAN } = app.Sequelize;
  const Gouwuche = app.model.define('gouwuche', {
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
    created_time: {
      type: DATE
    }
  },{
    timestamps: false,
    freezeTableName: true,
  }
  );
  // Gouwuche.associate = function (){
  //   Gouwuche.belongsTo(app.model.PermissionRules, {foreignKey: 'uuid', targetKey: 'entity_uuid'} )
  // }
 
  return Gouwuche;
}