const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class EventController extends Controller {
  async index() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.query;
    if(params.parent_id * 1 === -1) {
      params.pid = 0;
    }
    
    const res = await ctx.service.category.getList(params);
    
    if(params.index * 1 === 1) {
      const list_xiang = [];
      for(const item of res.rows) {
        const search = {
          category_id: item.id
        }
        const goods = await ctx.service.goods.getList(search);
        for(const item of goods.rows) {
          const category_info = await ctx.service.category.getInfo(item.category_id);
          item.category_name = category_info.name || '';
          item.imgPath = item.img;
          item.title = item.title
          console.log(item)
          list_xiang.push(item);
        }
      }

      let map = [];
      list_xiang.map( item => {
        const { category_name } = item;
        if (!map[category_name]) {
          map[category_name] = {
            title: category_name,
            list: [],
          }
        }
        map[category_name].list.push(item);
  
      })
      const new_list_xiang = Object.values(map);
      this.ctx.helper.success(ctx, 1, '成功', {aside: new_list_xiang });return;
    }

    //转成树形结构
    // const tree_data = await ctx.service.menu.recursionDataTree(menu_list.rows, 0);
    this.ctx.helper.success(ctx, 1, '成功', res);
  }

  // 添加时间事件
  async create() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';

    let {
      name,
      pid,
    } = params

    //插入数据
    const event_arr = {
      name,
      pid,
    }
    const res_event_arr = await ctx.service.category.create(event_arr);
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
      name,
      pid,
      id,
    } = params


    try {
      const arr_info = await ctx.service.category.getInfo(id);
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
        name,
        pid,
      }
      // 更新数据
      await ctx.service.category.update(id, event_arr);


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
      const arr_info = await ctx.service.category.getInfo(id);
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

      await ctx.service.category.destroy(id);

    
    } catch (error) {
      console.log('controller event destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }
}

module.exports = EventController;