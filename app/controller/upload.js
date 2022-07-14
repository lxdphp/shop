'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async uploadImg(){
    const { ctx } = this;
    const url = await ctx.service.upload.create();

    ctx.helper.success(ctx, 1, '成功', url)
  }
}

module.exports = HomeController;
