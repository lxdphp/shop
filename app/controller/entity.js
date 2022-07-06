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

}

module.exports = EntityController;