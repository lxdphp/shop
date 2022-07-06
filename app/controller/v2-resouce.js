const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class ResourceController extends Controller {

  // 获取排期详情
  async index() {
    const { ctx } = this;
    const params = ctx.request.query;
    const { limit, offect, schedule_uuid, resource_group_id = 'group_project' } = params;
    const uid = '';
    const result = {};
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
    
    
    // const views = {
    //   resourCustomView: {
    //     type: "resourceTimeline",
    //     visibleRange: page_settings
    //   }
    // }
    // resourceGroupField
    const resourceGroupField = '';
    // resourceFieldList
    const fields = await ctx.service.resource.resource_fields();
    const resourceAreaColumns = fields;
    // resources
    const entity = 'resources';
    const properties = await ctx.service.pgsql.costomField(entity);
    const fieldss = [];
    const resource = await ctx.service.resource.getResources(fieldss, params, limit, offect, properties.includes);

    const events = [];
    const resources = [];
    resource.rows.map(item => {
      //console.log(item);return;
      let duration = 0;
      item.events.map(item_event => {
        duration += item_event.duration * 1;

        const arr = {
          id: item_event.uuid,
          resourceId: item.uuid,
          title: item_event.content,
          start: ctx.helper.formatTime(item_event.start_at),
          end: ctx.helper.formatTime(item_event.end_at),
        }
        events.push(arr);
      }
    )

    const items = {
        id: item.uuid,
        project_name: item.project_name,
        department_name: item.department_name || '',
        member_name: item.member_name,
        description: item.description || '',
        duration: duration,
    }
    resources.push(items);

    return item;
    })
    // 对resource
    let map = [];
    resources.map( item => {
      //const { group_field } = item;
      const group_field = item[group_id];
      console.log('map', group_field);
      if (!map[group_field]) {
        map[group_field] = {
          id: item.id + 'id',
          project_name: '-',
          member_name: '-',
          department_name: '-',
          resource_group_id,
          //description:  '-',
          children: [],
          //count: 0,
          duration: 0,
        }
      }
      //console.log('resource_group_id', resource_group_id);
      map[group_field][group_id] = group_field;
      //console.log('map', map);
      map[group_field].children.push(item);
      //map[group_field].count = map[group_field].children.length;
      map[group_field].duration = map[group_field].children.reduce((c, item) => c + item.duration * 1, 0)
    })
    const new_resource = Object.values(map);
    console.log('new_resource', new_resource);
    if(resource_child_group_id) {
      new_resource.map( item => {
        let child_map = [];
        item.children.map( child_item => {
          const child_group_field = child_item[resource_child_group_id];
          if (!child_map[child_group_field]) {
            child_map[child_group_field] = {
              id: item.id + 'child',
              project_name: '-',
              member_name: '-',
              department_name: '-',
              description:  '-',
              children: [],
              //count: 0,
              duration: 0,
            }
          }
          child_map[child_group_field][resource_child_group_id] = child_group_field;
          child_map[child_group_field].children.push(child_item);
          child_map[child_group_field].duration = child_map[child_group_field].children.reduce((c, item) => c + item.duration * 1, 0)
        })
        item.children = Object.values(child_map);
      })
    }
  
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
      resourcesInitiallyExpanded: '',
      resources: new_resource,
      eventColor: '#3BB2E3',
      eventSources: [
        { events } ],
      total: resource.count,
      holiday,
    }
    // events
    ctx.helper.success(ctx, 1, '成功', results)
  }

  // 添加资源
  async create() {
  const { ctx, app } = this;
  const { validator } = app;
  const params = ctx.request.body;
  // const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    // user
    const user = ctx.session.user;
    const { uid, name } = user;  const {
    project_name,
    //department_name,
    member_name,
    member_uuid,
    schedule_uuid,
    department_uuid,
    department_name,
  } = params

  // 数据校验
  // const res = validator.validate({userName: 'userName'}, ctx.request.body);

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

  // 更新资源数据
  async update() {
  const { ctx, app } = this;
  let { validator } = app;
  const params = ctx.request.body;
  const put_params = ctx.params;
  console.log('controller resource update params', params);
  console.log('controller resource update put_params', put_params)
  const uuid = put_params.id;
  // const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    // user
    const user = ctx.session.user;
    const { uid, name } = user;
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
  // const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    // user
    const user = ctx.session.user;
    const { uid, name } = user;
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
  const artists = await ctx.service.core.getUsers();
  //const artists_name = 
  const departments = await ctx.service.core.getDepartments();
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
    artists_name: artists.map(item => {
      return item.value;
    }),
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