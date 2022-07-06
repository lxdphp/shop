const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class EntityController extends Controller {
  async create() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    console.log('res11111111', params)
    // app.validator.validate({ userName: 'string' }, ctx.request.body);
    const res = validator.validate({userName: 'userName'}, ctx.request.body);
    console.log('res11111111', res)
    //添加字段
    //const res = ctx.service.entity.addField(params);
  
    //console.log(333333333, tree_data);
    this.ctx.helper.success(ctx, 1, '成功')
  }

  // add field demo
  async up() {
    const { ctx } = this;
    const params = ctx.request.body;
    const res = await ctx.model.Model.findOne({
      raw: true,
    })
    console.log('res', res); 
    const queryInterface = this.app.model.models['user'];

  
    const fs = require('fs')
    const file = 'app/model/user.js';
    const fields = res.setting;
    
    
    console.log(fields)
    
    const add_field = `test3: {
      type: UUID
     },`
    const new_field = fields + add_field;
    
    const data = `
    module.exports = app => {
       const DataTypes = require('sequelize').DataTypes;
       const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
       const User = app.model.define('user', 
       ${new_field}},{
        timestamps: false,
        freezeTableName: true,
      }
       );

      
       return User;
     }`;

fs.writeFileSync(file, data)
  await queryInterface.sync({ alter: true });
   
      
console.log("The table for the User model was just (re)created!");
		ctx.body = '这里是restful-update';
  }

}

module.exports = EntityController;