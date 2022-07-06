const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class EventController extends Controller {
  async index() {
    const { ctx } = this;
    const { aa } = this.request.query;
    

  }

  // 添加时间事件
  async create() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;

    let {
      title,
      start,
      end,
      color,
      scheduleId,
      resourceId,
      progress,
    } = params

    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
    if(!end) {
      end = start;
    }
    const duration = ctx.helper.getDateDiff(start, end, 'day');
    console.log('controller event create duration', duration); 
    //插入数据
    const event_arr = {
      start_at: start,
      end_at: end,
      resources_uuid: resourceId,
      schedule_uuid: scheduleId,
      content: title,
      color: '',
      created_user_uuid: uid,
      duration: duration * 1 === 0 ? 1 : duration,
      progress,
    }
    const res_event_arr = await ctx.service.event.create(event_arr);

    //获取最大结束，最小开始时间
    const date_max_min = await ctx.service.event.getDateMaxMin(scheduleId);
    console.log('controller event create date_max_min', date_max_min);
    const schedule_arr = {
      plan_start_at: date_max_min.start,
      plan_end_at: date_max_min.end,
    }
    await ctx.service.schedule.update(scheduleId, schedule_arr);

    //获取表的字段
    const entity = 'events';
    const res_fields = await ctx.service.entity.getEnertyColumns(entity);
    for(const item of res_fields.rows){
      if(item.data_type === 'reverse-multi-entity') {
        const properties = JSON.parse(item.properties);
        const arr = properties['reverse-multi-entity'];
        console.log('arr', arr)
        const map = {};
        map[arr.entity + '_uuid'] = resourceId;
        map[entity + '_uuid'] =  res_event_arr.dataValues.uuid;
        console.log('map', map)
        const model_table_1 = app.model.models[arr.map_entity];
        // map表插入数据
        await model_table_1.create(map);

      }
    }
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
      start,
      end,
      color,
      scheduleId,
      resourceId,
      progress,
      title_oldvalue,
    } = params

    if(!end) {
      end = start;
    }
    const put_params =  ctx.params;
    console.log('controller event update params', params);
    console.log('controller event update put_params', put_params)
    const uuid = put_params.id;
    

    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)

    try {
      const arr_info = await ctx.service.event.getInfo(uuid);
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
        // start_at: start,
        // end_at: end,
        content: title,
        //edit_user_uuid: uid,
        progress,
        duration: progress ? (arr_info.duration * progress / 100).toString() : arr_info.duration,
        title_oldvalue,
        //duration,
      }
      if(start) {
        event_arr.start_at = start;
      }
      if(end) {
        event_arr.end_at = end;
      }
      if(resourceId) {
        event_arr.resources_uuid = resourceId;
        // 处理map 表
        const params = {
          resources_uuid: resourceId,
        }
        await ctx.service.event.updateMap(uuid, params);
      }
      console.log('controller event create event_arr', event_arr);
      // 更新数据
      await ctx.service.event.update(uuid, event_arr);

      //获取最大结束，最小开始时间
      const date_max_min = await ctx.service.event.getDateMaxMin(arr_info.schedule_uuid);
      console.log('controller event create date_max_min', date_max_min);
      const page_info = await ctx.service.schedule.getInfo(arr_info.schedule_uuid);
      const page_arr = {
        settings: JSON.stringify(date_max_min)
      }
      await ctx.service.page.update(page_info.pages_uuid, page_arr);
      const schedule_arr = {
        plan_start_at: date_max_min.start,
        plan_end_at: date_max_min.end,
      }
      await ctx.service.schedule.update(arr_info.schedule_uuid, schedule_arr);

      //更新操作日志表
      const log = {
        envent_uuid: uuid,
        created_user_uuid: uid,
        request_content: JSON.stringify(params),
      }
      ctx.service.log.create_event(log);

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
  
    const put_params =  ctx.params;
    console.log('controller event destroy put_params', put_params)
    const uuid = put_params.id;
    // user
    // const user = ctx.session.user;
    // const { uid, name } = user;

    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
   
    try {
      const arr_info = await ctx.service.event.getInfo(uuid);
      console.log('controller event destroy arr_info', arr_info);
      if(!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      // 更新数据
      const update_time = ctx.helper.getTime();
      const status =  3;

      const update_arr = {
        retirement_at: update_time,
        retirement_status:status
      }

      await ctx.service.event.update(uuid, update_arr);

      //获取最大结束，最小开始时间
      const date_max_min = await ctx.service.event.getDateMaxMin(arr_info.schedule_uuid);
      console.log('controller event create date_max_min', date_max_min);
      const page_info = await ctx.service.schedule.getInfo(arr_info.schedule_uuid);
      const page_arr = {
        settings: JSON.stringify(date_max_min)
      }
      await ctx.service.page.update(page_info.pages_uuid, page_arr);
      const schedule_arr = {
        plan_start_at: date_max_min.start,
        plan_end_at: date_max_min.end,
      }
      await ctx.service.schedule.update(arr_info.schedule_uuid, schedule_arr);
     

      //更新操作日志表
      const log = {
        event_uuid: uuid,
        //created_user_uuid: uid,
        request_content: JSON.stringify(put_params),
      }
      ctx.service.log.create_event(log);

    } catch (error) {
      console.log('controller event destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller event destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }

  // 获取一段时间内的事件数量汇总
  async day_summary() {
    const { ctx } = this;
    const { scheduleId } = ctx.request.query;
    const res = await ctx.service.event.getDaySummary(scheduleId);
    
    ctx.helper.success(ctx, 1, '成功', res)
  }
}

module.exports = EventController;