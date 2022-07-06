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
      shap,
      uuid,
      title_oldvalue,
    } = params
    params.schedule_uuid = params.scheduleId;
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
    if (!end) {
      end = start;
    }
    // if(shap === 'sign_rectangle') {
    //   shap = ''
    // }
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
    
    let res_event_arr = {}
    if(uuid) {
      //插入数据
      const event_arr = {
        // start_at: start,
        // end_at: end,
        content: title,
        //edit_user_uuid: uid,
        //title_oldvalue,
        people_num,
        color,
        shap
        //duration,
      }
    
      if (start) {
        event_arr.start_at = start;
      }
      if (end) {
        event_arr.end_at = end;
      }
      
      console.log('controller event create event_arr', event_arr);
      // 更新数据
      await ctx.service.plan.event.update(uuid, event_arr);
    } else {
      const event_arr = {
        start_at: start,
        end_at: end,
        shots_uuid: resourceId,
        schedule_uuid: scheduleId,
        content: title,
        color,
        created_user_uuid: uid,
        duration: duration * 1 === 0 ? 1 : duration,
        progress: progress ? progress : 100,
        people_num,
        shap
      }
      res_event_arr = await ctx.service.plan.event.create(event_arr);
    }

    const event_sql_list = await ctx.service.plan.event.getList();
    const events_role = event_sql_list.rows.map( item => {
      return item.uuid;
    })
    const rest = {
			role: {
				events_role,
			},
      uuid: uuid ? uuid : res_event_arr.dataValues.uuid,
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
      shap
    } = params
    const put_params = ctx.params;
    console.log('controller event update params', params);
    console.log('controller event update put_params', put_params)
    const uuid = put_params.id;

    // if(shap === 'sign_rectangle') {
    //   shap = ''
    // }

    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)

    try {
      const arr_info = await ctx.service.plan.event.getInfo(uuid);
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
        shap
        //duration,
      }
    
      if (start) {
        event_arr.start_at = start;
      }
      if (end) {
        event_arr.end_at = end;
      }
      
      console.log('controller event create event_arr', event_arr);
      // 更新数据
      await ctx.service.plan.event.update(uuid, event_arr);

      //获取最大结束，最小开始时间
    



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
      const arr_info = await ctx.service.plan.event.getInfo(uuid);
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

      await ctx.service.plan.event.update(uuid, update_arr);

      //获取最大结束，最小开始时间
      const date_max_min = await ctx.service.event.getDateMaxMin(arr_info.schedule_uuid);
      console.log('controller event create date_max_min', date_max_min);
      const end = date_max_min.end !== null ? date_max_min.end : '';
      const end_date = ctx.helper.getNextTime(60, end);
      const start_date = date_max_min.start !== null ? date_max_min.start : ctx.helper.getTimeByThree();
      // const page_info = await ctx.service.bd.schedulebd.getInfo(arr_info.schedule_uuid);
      // const page_arr = {
      //   settings: JSON.stringify(date_max_min)
      // }
      // await ctx.service.page.update(page_info.pages_uuid, page_arr);
      const date_resource_max_min = await ctx.service.plan.event.getDateMaxMin(arr_info.schedule_uuid, arr_info.shots_uuid);
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
      await ctx.service.bd.schedulebd.update(arr_info.schedule_uuid, schedule_arr);
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
    const res = await ctx.service.plan.event.getDaySummary(scheduleId, group, option, publish);

    ctx.helper.success(ctx, 1, '成功', res)
  }
}

module.exports = EventController;