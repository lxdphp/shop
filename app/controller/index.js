const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index() {
    const { ctx } = this;
    const { v4: uuidv4 } = require('uuid');

    const a = {
      uuid: uuidv4(),
      code: '表名',
      name: '表名',
      description: '123',
      created_user_uuid: uuidv4(),
    }
    console.log(111111, a );
    await ctx.model.Entities.create(a);
    this.ctx.helper.success(ctx, 1, '成功', {aa: 1})
  }
}

module.exports = IndexController;