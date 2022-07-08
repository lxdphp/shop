const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class UserController extends Controller {
  async index() {
    const { ctx, app } = this;
    let { validator } = app;
    const userToken = ctx.get('token');
    console.log('res11111111', userToken)
    // 获取所有的假期
    const res = await ctx.service.user.getUser(userToken);
    if( res === false ) {
      this.ctx.helper.success(ctx, -1, '请求错误！');
    }
    //console.log(333333333, tree_data);
    this.ctx.helper.success(ctx, 1, '成功', res);
  }

  async logout() {
    const { ctx } = this;
    const userToken = ctx.get('Authorization');
    const token = Buffer.from(userToken.replace('Bearer ', ' '), 'base64').toString();
    const mark = '&';
    const token_list = token.split(mark);
    console.log('token_list', token_list);
    const user = await ctx.service.redis.get(token_list[1]);
    if(user) {
      // 删除redis 数据
      await ctx.service.redis.del(token_list[1]);
    }

    // http://account.morevfx.com/login?redirect=
    const res = {
      url: this.config.logoutUrl
    }

    this.ctx.helper.success(ctx, 1, '成功', res);
  }

  // 添加时间事件
  async login() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';

    let {
      phone,
    } = params

    const info = await ctx.service.user.getInfo(phone);
    if(!info) {
      //插入数据
      const event_arr = {
        phone,
      }
      const res_event_arr = await ctx.service.user.create(event_arr);
    }
    
    ctx.helper.success(ctx, 1, '成功')
  }

}

module.exports = UserController;