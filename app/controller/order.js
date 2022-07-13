const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class EventController extends Controller {
  async index() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.query;
   
    params.status = 1;
    
    // 获取所有的假期
    const res = await ctx.service.gouwuche.getList(params);
    
    //转成树形结构
    // const tree_data = await ctx.service.menu.recursionDataTree(menu_list.rows, 0);
    this.ctx.helper.success(ctx, 1, '成功', res);
  }

  // 添
  async create() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';

    //插入订单
    const order_add = {
      phone: params.phone
    }
    const order_info = await ctx.service.order.create(order_add);

    for(const item of params) {
      //插入数据
        const event_arr = {
          good_id: item.good_id,
          num: item.num,
          phone: item.phone,
          order_id: order_info.id
        }
        await ctx.service.order.createdetail(event_arr);

        // 去除购物车的商品
        // const status = {
        //   status: 4
        // }
        // await ctx.service.gouwuche.update(item.id, status);
    }

    ctx.helper.success(ctx, 1, '成功')
  }

  // 更新时间事件
  async update() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    // user
    // const user = ctx.session.user;
    // const { uid, name } = user;
    const {
      num,
      id,
    } = params


    try {
      const arr_info = await ctx.service.gouwuche.getInfo(id);
      console.log('controller event update arr_info', arr_info);
      if(!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      
      if(start) {
        arr_info.duration = ctx.helper.getDateDiff(start, end, 'day');
      }
      
      //console.log('controller event create duration', duration); 
      //插入数据
      const event_arr = {
        num
      }
      // 更新数据
      await ctx.service.gouwuche.update(id, event_arr);


    } catch (error) {
      console.log('controller event update getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event update end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }

  // 删除时间事件
  async destroy() {
    const { ctx, app } = this;
    let { validator } = app;
  
    const params = ctx.request.body;
    const id = params.id;
    // user
    // const user = ctx.session.user;
    // const { uid, name } = user;

    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
   
    try {
      const arr_info = await ctx.service.gouwuche.getInfo(id);
      console.log('controller event destroy arr_info', arr_info);
      if(!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      // 更新数据
      const status =  3;

      const update_arr = {
        status:status
      }

      await ctx.service.gouwuche.update(id, update_arr);

    
    } catch (error) {
      console.log('controller event destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }
}

module.exports = EventController;