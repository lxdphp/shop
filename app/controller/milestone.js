const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class MilestoneController extends Controller {
  
  // 
  async index() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.query;
    console.log('res11111111', params)
    // app.validator.validate({ userName: 'string' }, ctx.request.body);
    //const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // 获取所有的假期
    const res = await ctx.service.milestone.getList(params);
    const list = [];
    const role = [];
    let i = 1
    res.rows.map( item => {
      item.date = ctx.helper.formatTime(item.event_at);
      const arr = {
        id: item.uuid,
        date: item.date,
        line: item.line_type,
        color: item.line_color,
        title: item.event_content,
      }
      list.push(arr);
      if(item.uuid !== '1c84c407-798c-470b-932c-a9610b26e0e7'){
        role.push(item.uuid);
      }
      
      i++;
    })
    list.unshift(
      {
        id: ctx.helper.formatTime() + 0,
        date: ctx.helper.formatTime(),
        line: 'dashed',
        color: '#e2534d',
        title: '当天',
      }
    )
    //console.log(333333333, tree_data);
    const result = {
      list,
      role,
    }
    this.ctx.helper.success(ctx, 1, '成功', result);
  }

  // 创建数据 + 编辑
  async create() {
    const { ctx, app } = this;
    const params =  ctx.request.body;
    const {
      event_at,
      event_content,
      line_color,
      line_type,
      schedule_uuid,
      milestone_uuid,
      model = 'schedule',
    } = params;

    if(milestone_uuid) {
      const milestone_arr = {
        event_at,
        event_content,
        line_color,
        line_type,
      }
      const res = await ctx.service.milestone.update(milestone_uuid,milestone_arr);
    } else {
      const milestone_arr = {
        event_at,
        event_content,
        line_color,
        line_type,
        schedule_uuid,
        model
      }
      const res = await ctx.service.milestone.create(milestone_arr);
    }
    

    this.ctx.helper.success(ctx, 1, '成功');
  }

  // 删除
  async destroy() {
    const { ctx, app } = this;
    let { validator } = app;
  
    const put_params =  ctx.params;
    console.log('controller event destroy put_params', put_params)
    const uuid = put_params.id;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
    const params =  ctx.request.query;
    console.log('controller event destroy params', params)
    const model = params.model ? params.model : 'resource';
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
   
    try {
      const arr_info = await ctx.service.milestone.getInfo(uuid, model);
      console.log('controller event destroy arr_info', arr_info);
      if(!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      // 更新数据
      const update_time = ctx.helper.getTime();
      const status =  '3';

      const update_arr = {
        retirement_at: update_time,
        retirement_status:status
      }
      
      await ctx.service.milestone.update(uuid, update_arr);

    

    } catch (error) {
      console.log('controller event destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }

  // 删除
  async del() {
    const { ctx, app } = this;
    let { validator } = app;
  
    const put_params =  ctx.request.body;
    console.log('controller event destroy put_params', put_params)
    const uuid = put_params.uuid;
    const model = put_params.model ? put_params.model : 'rescourc';
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
    
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
   
    try {
      const arr_info = await ctx.service.milestone.getInfo(uuid, model);
      console.log('controller event destroy arr_info', arr_info);
      if(!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      // 更新数据
      const update_time = ctx.helper.getTime();
      const status =  '3';

      const update_arr = {
        retirement_at: update_time,
        retirement_status:status
      }
      
      await ctx.service.milestone.update(uuid, update_arr);

    

    } catch (error) {
      console.log('controller event destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }
}

module.exports = MilestoneController;