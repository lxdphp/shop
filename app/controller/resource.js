const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class ResourceController extends Controller {

  // 获取排期详情
  async index() {
    const { ctx } = this;
    const params = ctx.request.query;
    const { limit, offect, schedule_uuid, resource_group_id = 'group_project' } = params;
    const result = {};
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
    let resource_child_group_id = '';
    let group_id = '';
    switch (resource_group_id) {
      case 'group_project':
        group_id = 'project_name';
        resource_child_group_id = 'department_name';
        break;
      case 'group_department':
        group_id = 'department_name';
        resource_child_group_id = 'project_name';
        break;
      case 'group_member':
          group_id = 'member_name';
          break;
      default:
        break;
    }
    // console.log(group_id, resource_child_group_id); return;
    // 视图规则，开始时间，结束时间
    // page表获取数据
    // const schedule_info = await ctx.service.schedule.getInfo(schedule_uuid);
    // const page = await ctx.service.page.getInfo(schedule_info.pages_uuid);
    
    // let page_settings = {
    //   start: ctx.helper.getTimeByThree(),
    //   end: ctx.helper.getNextTime(60),
    // }
    // console.log('controller resource index page_settings init', page_settings, page);
    // if(page && page.settings) {
    //   page_settings = JSON.parse(page.settings);
    //   page_settings.start = ctx.helper.formatTime(page_settings.start);
    //   page_settings.end = ctx.helper.formatTime(page_settings.end);
    // }
    // page表获取数据
    const page = await ctx.service.page.getInfoByUser(uid);
    if(page) {
      const page_settings = JSON.parse(page.settings);
      console.log('page_settings', page_settings)
    }
    
    // const views = {
    //   resourCustomView: {
    //     type: "resourceTimeline",
    //     visibleRange: page_settings
    //   }
    // }
    // resourceGroupField
    const resourceGroupField = '';
    // resourceFieldList
    let fields = [];
    let resourceAreaKeys = [];
    let resourceAreaData = [];
    if(page) {
      const arr = [];
      resourceAreaKeys = JSON.parse(page_settings.keys);
      const keys_arr = resourceAreaKeys.join();
      
      const settings = JSON.parse(page_settings.settings);
      console.log('fields 整理前得', settings)
      settings.map( item=> {
        if(!keys_arr.includes(item.key)){
          arr.push(item);
        }
      })
      fields = arr;

      resourceAreaData = await ctx.service.resource.resource_fields();
    } else {
      fields = await ctx.service.resource.resource_fields();
      resourceAreaData = fields;
    }
    console.log('fields 整理后得', fields)

    let first_field = {}
    let i = 1;
    fields.map( item => {
      item.headerClassNames = ["resource_header_name"];
      item.cellClassNames = ["resource_content_name"];
      if(item.field === group_id) {
        first_field =  item;
      }
      
      //item.key = i;
      i++;
      return item;
    })
    console.log('fields', first_field);
    const new_fields = Object.values(Array.from(new Set([...[first_field],...fields])));
    //

    const resourceAreaColumns = new_fields;
    // resources
    const entity = 'resources';
    const properties = await ctx.service.pgsql.costomField(entity);
    const fieldss = [];
    const resource = await ctx.service.resource.getResources(fieldss, params, limit, offect, properties.includes);
    //
    // 获取自定义字段
    const entitys = 'resources';
    const customFormField = await ctx.service.entity.getCustomForm(entitys);
    const customField = customFormField.map( item => {
      //resource_arr[item.code] = params[item.code];
      return item.code; 
    })
    // role
    const department_uuid = '8d8c507b-9ad9-11ec-a44e-0cc47a49e143';
    const events = [];
    const resources = [];
    const resources_role = [];
    const events_role = [];
    resource.rows.map(item => {
      // role 
      if(item.uuid !== '1bf90b94-61ca-49f5-abd8-9f4d122ad949') {
        resources_role.push(item.uuid)
      }
      
      //console.log(item);return;
      let duration = 0;
      item.events.map(item_event => {
        duration += item_event.duration * 1;
        if(item_event.uuid !== 'a21ffd9a-d516-4972-a2d3-a6a52f9c619a') {
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
        // if(item.department_uuid !== department_uuid) {
        //   arr.editable = false;
        // }
        events.push(arr);
      }
    )

    const items = {
        id: item.uuid,
        project_name: item.project_name,
        department_name: item.department_name || '',
        department_uuid: item.department_uuid,
        member_name: item.member_name,
        description: item.description || '',
        duration: duration.toString(),
    }
    customField.map( it => {
      items[it] = item[it];
    })
    items[resource_group_id] = item[group_id];
    resources.push(items);

    return item;
    })
    // 对events
    const all_days = []
    events.map( item => {
      const arr = ctx.helper.getAllDays(item.start, item.end);
      //console.log('arr', arr);
      arr.map( item => {
        all_days.push(item)
      })
      
    })
    console.log('arr', all_days);
    const day_summary =  all_days.reduce(function(prev,next){ 
      prev[next] = (prev[next] + 1) || 1; 
      return prev; 
    },{});
  
    // 获取所有的假期
    const holiday_params = {
      start: params.start,
      end: params.end,
    }
    const res = await ctx.service.day.getList(holiday_params);
    const holiday = [];
    res.rows.map( item => {
      item.start_at = ctx.helper.formatTime(item.start_at);
      //item.end_at = ctx.helper.formatTime(item.end_at);
      holiday.push(item.start_at)
    })

    const results = {
      //views,
      //aa: resource.rows,
      resourceGroupField,
      resourceAreaColumns,
      resourceAreaKeys,
      resourceAreaData,
      resourcesInitiallyExpanded: '',
      resources,
      eventColor: '#3BB2E3',
      eventSources: [
        { events } ],
      total: resource.count,
      holiday,
      day_summary,
      role: {
        resources_role,
        events_role,
      }
    }
    // events
    ctx.helper.success(ctx, 1, '成功', results)
  }

  // 添加资源
  async create() {
    const { ctx, app } = this;
    const { validator } = app;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
    const {
      project_name,
      //department_name,
      member_name,
      member_uuid,
      schedule_uuid,
      department_uuid,
      department_name,
      resources_uuid,
    } = params
  
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
  
    // 获取自定义字段
    const entitys = 'resources';
    const customFormField = await ctx.service.entity.getCustomForm(entitys);
  
    if(resources_uuid) {
      const resource_arr = {
        project_name,
        member_name,
        member_uuid,
        edit_user_uuid: uid,
        department_uuid,
        department_name,
        updated_at: ctx.helper.getTime()
      }
      const customField = customFormField.map( item => {
        resource_arr[item.code] = params[item.code];
        return item.code; 
      })
  
      try {
        const arr_info = await ctx.service.resource.getInfo(resources_uuid);
        console.log('controller resource update arr_info', arr_info);
        if (!arr_info) {
          ctx.helper.success(ctx, -1, '非法参数！')
          return
        }
        // 更新数据
        await ctx.service.resource.update(resources_uuid, resource_arr);
  
        //更新操作日志表
        const log = {
          resource_uuid: resources_uuid,
          created_user_uuid: uid,
          request_content: JSON.stringify(params),
        }
        ctx.service.log.create_resource(log);
  
      } catch (error) {
        console.log('controller resource update getInfo error', error);
        ctx.helper.success(ctx, -1, '非法参数！')
      }
      console.log('controller resource update end 成功');
      ctx.helper.success(ctx, 1, '成功')
    } else {
  
      // const schedule_uuid = 'e09359f9-1eea-4d33-893b-7d174beb9123';
  
      // resources 插入数据
      const resource_arr = {
        project_name,
        schedule_uuid,
        member_name,
        member_uuid,
        created_user_uuid: uid,
        department_uuid,
        department_name,
      }
  
      const customField = customFormField.map( item => {
        resource_arr[item.code] = params[item.code];
        return item.code; 
      })
      console.log('customField', customField)
      console.log('resource_arr', resource_arr)
  
      const res_resource_arr = await ctx.service.resource.create(resource_arr);
  
      // 查询所有字段，是否需要 insert map
      // const fields =  await ctx.service.pgsql.getMap();
      //获取表的字段
      const entity = 'resources';
      const res_fields = await ctx.service.entity.getEnertyColumns(entity);
      for (const item of res_fields.rows) {
        if (item.data_type === 'reverse-multi-entity') {
          const properties = JSON.parse(item.properties);
          const arr = properties['reverse-multi-entity'];
          console.log('arr', arr)
          const map = {};
          map[arr.entity + '_uuid'] = schedule_uuid;
          map[entity + '_uuid'] = res_resource_arr.dataValues.uuid;
          console.log('map', map)
          const model_table_1 = app.model.models[arr.map_entity];
          console.log('model_table_1', model_table_1)
          // map表插入数据
          await model_table_1.create(map);
  
        }
      }
      ctx.helper.success(ctx, 1, '成功', { uuid: res_resource_arr.dataValues.uuid })
    }
    
  
    
    }

  // 更新资源数据
  async update() {
  const { ctx, app } = this;
  let { validator } = app;
  const params = ctx.request.body;
  const put_params = ctx.params;
  console.log('controller resource update params', params);
  console.log('controller resource update put_params', put_params)
  const uuid = put_params.id;
  //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
  const user = ctx.session.user;
  const uid = user.uuid;
  // 数据校验
  // const res = validator.validate({userName: 'userName'}, ctx.request.body);
  // console.log('res11111111', res)

  if(params.department_name) {
    const params_department = {
      name: params.department_name
    }
    const department_info = await ctx.service.core.getDepartmentByParams(params_department);
    console.log('department_info', department_info)
    params.department_uuid = department_info.uuid;
    console.log('controller resource update  department_name params', params);
  }

  // // 获取自定义字段
  // const entitys = 'resources';
  // const customFormField = await ctx.service.entity.getCustomForm(entitys);

  // const customField = customFormField.map( item => {
  //   resource_arr[item.code] = params[item.code];
  //   return item.code; 
  // })
  // console.log('customField', customField)
  // console.log('resource_arr', resource_arr)

  params.edit_user_uuid = uid;
  params.updated_at = await ctx.helper.getTime();
  try {
    const arr_info = await ctx.service.resource.getInfo(uuid);
    console.log('controller resource update arr_info', arr_info);
    if (!arr_info) {
      ctx.helper.success(ctx, -1, '非法参数！')
      return
    }
    // 更新数据
    await ctx.service.resource.update(uuid, params);

    //更新操作日志表
    const log = {
      resource_uuid: uuid,
      created_user_uuid: uid,
      request_content: JSON.stringify(params),
    }
    ctx.service.log.create_resource(log);

  } catch (error) {
    console.log('controller resource update getInfo error', error);
    ctx.helper.success(ctx, -1, '非法参数！')
  }
  console.log('controller resource update end 成功');
  ctx.helper.success(ctx, 1, '成功')
  }

  // 删除资源数据
  async destroy() {
  const { ctx, app } = this;
  let { validator } = app;

  const put_params = ctx.params;
  console.log('controller resource destroy put_params', put_params)
  const uuid = put_params.id;
  //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
  const user = ctx.session.user;
  const uid = user.uuid;
  // 数据校验
  // const res = validator.validate({userName: 'userName'}, ctx.request.body);
  // console.log('res11111111', res)

  try {
    const arr_info = await ctx.service.resource.getInfo(uuid);
    console.log('controller resource destroy arr_info', arr_info);
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

    await ctx.service.resource.update(uuid, update_arr);


    //更新操作日志表
    const log = {
      resource_uuid: uuid,
      created_user_uuid: uid,
      request_content: JSON.stringify(params),
    }
    ctx.service.log.create_resource(log);

  } catch (error) {
    console.log('controller resource destroy getInfo error', error);
    ctx.helper.success(ctx, -1, '非法参数！')
  }
  console.log('controller resource destroy end 成功');
  ctx.helper.success(ctx, 1, '成功')
  }

  // 筛选列表
  async options() {
    const { ctx } = this;
  
    const params = ctx.request.body;
    const entity = 'resources'
    const list = await ctx.service.resource.getScheduleOptions();
  
    // 制作人 2种结构
    //const artists = await ctx.service.core.getUsers();
    const artists  = [];
    const artists_name =  artists.map(item => {
      return item.value;
    });
    // 获取手动添加的制作人
    //const member_names = await ctx.service.resource.getMembers();
    const member_names = [];
    // const member_name_list = member_names.rows.map( item=> {
    //   if(item.member_name) {
    //     artists_name.push(item.member_name);
    //   }
    //   return item.member_name;
    // })
    // const commit_artists_name = artists_name.push(...member_name_list)
    //console.log(11111,artists_name, Array.from(new Set(artists_name)));
    //return;
    //const artists_name = 
    //const departments = await ctx.service.core.getDepartments();
    const departments = [];
    // 项目 2种结构
    const projects = [];
    let i = 1;
    list.rows.map(item => {
      const item_projects = {
        id: i,
        value: item.project_name,
        text: item.project_name,
      }
      if (item.project_name) {
        projects.push(item_projects);
      }
  
      i++;
  
    })
    const projects_buchong = ctx.helper.unique(projects, 'value').map(item => {
      return item
    });
    const res = {
      artists,
      artists_name: Array.from(new Set(artists_name)),
      departments,
      projects: projects_buchong,
      projects_name: projects_buchong.map(item => {
        return item.value;
      }),
    }
  
    ctx.helper.success(ctx, 1, '成功', res)
    }

  // 获取部门下的所有人员
  async getDepartmentUsers() {
    const { ctx } = this;
    const { department_uuid } = ctx.request.query
    const res = await ctx.service.core.getDepartmentUsers(department_uuid);

    ctx.helper.success(ctx, 1, '成功', res)
    
  }
}

module.exports = ResourceController;