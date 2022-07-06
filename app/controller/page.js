const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class PageController extends Controller {


  // 添加个人的page
  async create() {
  const { ctx, app } = this;
  const { validator } = app;
  const params = ctx.request.body;
  //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
  const user = ctx.session.user;
  const uid = user.uuid;

  const {
    settings,
    keys,
    model = 'resource',
  } = params
  // 处理数据
  const save_data = {
    keys,
    settings,
  };
  const res = await ctx.service.page.getInfoByUser(uid, model);
  if(res) {
    const page_arr = {
      settings: JSON.stringify(save_data)
    }
    await ctx.service.page.updateByUser(uid, page_arr, model);
  } else {
    const page_arr = {
      settings: JSON.stringify(save_data),
      created_user_uuid: uid,
      model,
    }
    await ctx.service.page.create(page_arr);
  }
  ctx.helper.success(ctx, 1, '成功')
  }

}

module.exports = PageController;