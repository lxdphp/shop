const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class EventController extends Controller {
  async index() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.query;

    // 获取所有的假期
    const res = await ctx.service.goods.getList(params);
  
    for(const item of res.rows) {
       const category_name = await ctx.service.category.getInfo(item.category_id);
       item.category_name = category_name.name
    }

    this.ctx.helper.success(ctx, 1, '成功', res);
  }

  async info() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.query;
    const id = params.id
    const arr_info = await ctx.service.goods.getInfo(id);
    const category_name = await ctx.service.category.getInfo(arr_info.category_id);
    arr_info.category_name = category_name.name

    if(params.index * 1 === 1) {
      const info = {
        view: {
          title: arr_info.title,
          id: arr_info.id,
          price: arr_info.price,
          chose: [{
            "col": arr_info.title,
            "size": arr_info.price
          },]
        },
        swiper: [
          {
            imgSrc: arr_info.img,
            id: 1,
          }
        ],
        contentImgSrc: [
          {
            imgSrc: arr_info.img,
          },
        ]
      }

      this.ctx.helper.success(ctx, 1, '成功', info);return;
    }

    this.ctx.helper.success(ctx, 1, '成功', arr_info);
  }

  // 添加时间事件
  async create() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';

    let {
      title,
      img,
      category_id,
      des,
      price,
    } = params

    //插入数据
    const event_arr = {
      title,
      img,
      category_id,
      des,
      price,
    }
    const res_event_arr = await ctx.service.goods.create(event_arr);
    ctx.helper.success(ctx, 1, '成功', { uuid: res_event_arr.dataValues.uuid})
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
      title,
      img,
      category_id,
      des,
      price,
      id,
    } = params


    try {
      const arr_info = await ctx.service.goods.getInfo(id);
      console.log('controller event update arr_info', arr_info);
      if(!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      
      
      //console.log('controller event create duration', duration); 
      //插入数据
      const event_arr = {
        title,
      img,
      category_id,
      des,
      price,
      }
      // 更新数据
      await ctx.service.goods.update(id, event_arr);


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
      const arr_info = await ctx.service.goods.getInfo(id);
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

      await ctx.service.goods.update(id, update_arr);

    
    } catch (error) {
      console.log('controller event destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }
}

module.exports = EventController;