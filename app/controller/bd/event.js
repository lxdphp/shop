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
      people_num,
    } = params
    params.schedule_uuid = params.scheduleId;
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
    if (!end) {
      end = start;
    }
    //const duration = ctx.helper.getDateDiff(start, end, 'day');
    
    // 获取所有的假期
    const res = await ctx.service.day.getList([]);
    const holiday = [];
    res.rows.map( item => {
      item.start_at = ctx.helper.formatTime(item.start_at);
      holiday.push(item.start_at)
    })
    // 获取duration 所有的日期
    const duration_res = ctx.helper.getAllDays(start, end);
    const diff_duration = [...duration_res].filter(item => [...holiday].every(i => i !== item));
    //console.log('holiday', holiday, duration_res, diff_duration);return;
    const duration = diff_duration.length;

    console.log('controller event create duration', duration);
    //插入数据
    const event_arr = {
      start_at: start,
      end_at: end,
      shots_uuid: resourceId,
      schedule_bd_uuid: scheduleId,
      content: title,
      color,
      created_user_uuid: uid,
      duration: duration * 1 === 0 ? 1 : duration,
      progress: progress ? progress : 100,
      people_num,
    }
    const res_event_arr = await ctx.service.bd.event.create(event_arr);

    //获取最大结束，最小开始时间
    const date_max_min = await ctx.service.bd.event.getDateMaxMin(scheduleId);
    const date_resource_max_min = await ctx.service.bd.event.getDateMaxMin(scheduleId, resourceId);
    const schedule_arr = {
      plan_start_at: date_max_min.start,
      plan_end_at: date_max_min.end,
    }
    await ctx.service.bd.schedulebd.update(scheduleId, schedule_arr);
    const resource_arr = {
      event_start_time: ctx.helper.formatTime(date_resource_max_min.start),
      event_end_time: ctx.helper.getUpTime(1,date_resource_max_min.end),
    }
    await ctx.service.bd.shot.update(resourceId, resource_arr);

    //获取表的字段
    const entity = 'events_bd';
    const res_fields = await ctx.service.entity.getEnertyColumns(entity);
    for (const item of res_fields.rows) {
      if (item.data_type === 'reverse-multi-entity') {
        const properties = JSON.parse(item.properties);
        const arr = properties['reverse-multi-entity'];
        console.log('arr', arr)
        const map = {};
        map[arr.entity + '_uuid'] = resourceId;
        map[entity + '_uuid'] = res_event_arr.dataValues.uuid;
        console.log('map', map)
        const model_table_1 = app.model.models[arr.map_entity];
        // map表插入数据
        await model_table_1.create(map);

      }
    }
    //
    // resources
    const entity_shots = 'shots';
    const properties = await ctx.service.pgsql.costomField(entity_shots);
    const fieldss = [];
    const resource = await ctx.service.bd.shot.getShots(fieldss, params, 10000, 1, properties.includes);
    //
    const events = [];
    const events_role = [];
    resource.rows.map(item => {
      //
      item.events_bds.map(item_event => {
        if (item_event.uuid !== 'a21ffd9a-d516-4972-a2d3-a6a52f9c619a' && item_event.from !== 'shotgun' ) {
          events_role.push(item_event.uuid);
        }

        const arr = {
          id: item_event.uuid,
          resourceId: item.uuid,
          title_oldvalue: item_event.title_oldvalue,
          start: ctx.helper.formatTime(item_event.start_at),
          end: ctx.helper.formatTime(item_event.end_at),
          department_name: item.department_name,
          editable: true,
          progress: item_event.progress * 1,
          title: item_event.content,
        }
        events.push(arr);
      })

      return item;
    })

    const rest = {
			role: {
				events_role,
			},
      uuid: res_event_arr.dataValues.uuid,
    }

    ctx.helper.success(ctx, 1, '成功', rest)
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
      title_oldvalue,
      people_num,
    } = params
    const put_params = ctx.params;
    console.log('controller event update params', params);
    console.log('controller event update put_params', put_params)
    const uuid = put_params.id;


    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)

    try {
      const arr_info = await ctx.service.bd.event.getInfo(uuid);
      console.log('controller event update arr_info', arr_info);
      if (!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }

      if (start) {
        // arr_info.duration = ctx.helper.getDateDiff(start, end, 'day');
        // 去除节假日
        // 获取节假日
        // 获取所有的假期
        const res = await ctx.service.day.getList([]);
        const holiday = [];
        res.rows.map( item => {
          item.start_at = ctx.helper.formatTime(item.start_at);
          holiday.push(item.start_at)
        })
        // 获取duration 所有的日期
        const duration_res = ctx.helper.getAllDays(start, end);
        const diff_duration = [...duration_res].filter(item => [...holiday].every(i => i !== item));
        //console.log('holiday', holiday, duration_res, diff_duration);return;
        arr_info.duration = diff_duration.length; 
        //console.log(arr_info);return;
      }
    
      if(!params.progress) {
        params.progress = arr_info.progress
      }

      //console.log('controller event create duration', duration); 
      //插入数据
      const event_arr = {
        // start_at: start,
        // end_at: end,
        content: title,
        //edit_user_uuid: uid,
        progress: params.progress,
        duration: people_num ? (arr_info.duration * params.progress * people_num / 100).toString() : arr_info.duration,
        title_oldvalue,
        people_num,
        color,
        //duration,
      }
    
      if (start) {
        event_arr.start_at = start;
      }
      if (end) {
        event_arr.end_at = end;
      }
      if (resourceId) {
        event_arr.shots_uuid = resourceId;
        // 处理map 表
        const params = {
          shots_uuid: resourceId,
        }
        await ctx.service.bd.event.updateMap(uuid, params);
      }
      console.log('controller event create event_arr', event_arr);
      // 更新数据
      await ctx.service.bd.event.update(uuid, event_arr);

      //获取最大结束，最小开始时间
      const date_max_min = await ctx.service.bd.event.getDateMaxMin(arr_info.schedule_bd_uuid);
      const end_max = date_max_min.end !== null ? date_max_min.end : '';
      const end_date = ctx.helper.getNextTime(60, end_max);
      const start_date = date_max_min.start !== null ? date_max_min.start : ctx.helper.getTimeByThree();
      console.log('controller event create date_max_min', date_max_min);
      // const page_info = await ctx.service.bd.schedulebd.getInfo(arr_info.schedule_uuid);
      // const page_arr = {
      //   settings: JSON.stringify(date_max_min)
      // }
      // await ctx.service.page.update(page_info.pages_uuid, page_arr);
      const date_resource_max_min = await ctx.service.bd.event.getDateMaxMin(arr_info.schedule_bd_uuid, );
      const resource_arr = {
        event_start_time: ctx.helper.formatTime(date_resource_max_min.start),
        event_end_time: ctx.helper.getUpTime(1,date_resource_max_min.end),
      }
      await ctx.service.bd.shot.update(arr_info.shots_uuid, resource_arr);
      const schedule_arr = {
        plan_start_at: start_date,
        plan_end_at: end_date,
      }
      await ctx.service.bd.schedulebd.update(arr_info.schedule_bd_uuid, schedule_arr);



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

    const put_params = ctx.params;
    console.log('controller event destroy put_params', put_params)
    const uuid = put_params.id;
    // user
    // const user = ctx.session.user;
    // const { uid, name } = user;

    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)

    try {
      const arr_info = await ctx.service.bd.event.getInfo(uuid);
      console.log('controller event destroy arr_info', arr_info);
      if (!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      // 更新数据
      const update_time = ctx.helper.getTime();
      const status = 3;

      const update_arr = {
        retirement_at: update_time,
        retirement_status: status
      }

      await ctx.service.bd.event.update(uuid, update_arr);

      //获取最大结束，最小开始时间
      const date_max_min = await ctx.service.event.getDateMaxMin(arr_info.schedule_bd_uuid);
      console.log('controller event create date_max_min', date_max_min);
      const end = date_max_min.end !== null ? date_max_min.end : '';
      const end_date = ctx.helper.getNextTime(60, end);
      const start_date = date_max_min.start !== null ? date_max_min.start : ctx.helper.getTimeByThree();
      // const page_info = await ctx.service.bd.schedulebd.getInfo(arr_info.schedule_uuid);
      // const page_arr = {
      //   settings: JSON.stringify(date_max_min)
      // }
      // await ctx.service.page.update(page_info.pages_uuid, page_arr);
      const date_resource_max_min = await ctx.service.bd.event.getDateMaxMin(arr_info.schedule_bd_uuid, arr_info.shots_uuid);
      const resource_arr = {
        event_start_time: ctx.helper.formatTime(date_resource_max_min.start),
        event_end_time: ctx.helper.getUpTime(1,date_resource_max_min.end),
      }
      await ctx.service.bd.shot.update(arr_info.shots_uuid, resource_arr);
      const schedule_arr = {
        plan_start_at: start_date,
        plan_end_at: end_date,
      }
      console.log(schedule_arr);
      await ctx.service.bd.schedulebd.update(arr_info.schedule_bd_uuid, schedule_arr);
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
    const { scheduleId, group, link_name, category_name, publish } = ctx.request.query;
    const option = {
      link_name,
      category_name
    }
    const res = await ctx.service.bd.event.getDaySummary(scheduleId, group, option, publish);

    ctx.helper.success(ctx, 1, '成功', res)
  }
}

module.exports = EventController;