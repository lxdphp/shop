const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class ScheduleBdController extends Controller {
  async index() {
    const { ctx } = this;
    // const user = ctx.session.user;
    // const user_uuid = user.uuid;
    const params = ctx.request.query;
    const { limit, offect } = params;
    const entity = 'schedules_bd';
    const properties = await ctx.service.pgsql.costomField(entity);
    const fields = [];
    //params.created_user_uuid = user_uuid;
    console.log('index params', params);
    //根据
    const list = await ctx.service.bd.schedulebd.getList2(fields, params, limit, offect, properties.includes);
 
    console.log('index list', list);
    // this.ctx.helper.success(ctx, 1, '成功', list)
    // return;
    let field_data = [];
    for(const item of properties.data_type) {
      if(item === 'list-entity') {
       field_data.push(item);
      }
    }
    console.log('index field_data', field_data);
    //对数据处理
    const list_arg = [];
    for(const item of list.rows) {
      // 获取每个项目的成员
      //console.log('item', item);return;
      
      let project_info = [];

      item.dataValues.schedule_number = item.id;
      item.dataValues.id = item.uuid;
      item.dataValues.schedule_rec= item.name;
      item.dataValues.schedule_state= item.status;
      item.dataValues.plan_start_at= item.plan_start_at ? this.ctx.helper.formatTime(item.plan_start_at) : '';
      item.dataValues.plan_end_at= item.plan_end_at ? this.ctx.helper.formatTime(item.plan_end_at) : '';
      item.dataValues.schedule_time= item.updated_at ? this.ctx.helper.formatTime(item.updated_at) : '';
      item.dataValues.schedule_created= this.ctx.helper.formatTime(item.created_at);
      
      item.dataValues.schedule_name= item.created_user_name;
      
    
      item.dataValues.schedule_log=item.description;

      //list_arg.push(arr);
    }
    const columns = [
      {
        key: 1,
        title: "编号",
        dataIndex: "schedule_number",
      },
      {
        key: 2,
        title: "排期记录",
        dataIndex: "schedule_rec",
      },
      {
        key: 3,
        title: "状态",
        dataIndex: "schedule_state",
      },
      {
        key: 4,
        title: "项目",
        dataIndex: "project_name",
      },
      {
        key: 5,
        title: "创建时间",
        dataIndex: "schedule_created",
      },
      {
        key: 6,
        title: "更新时间",
        dataIndex: "schedule_time",
      },
      // {
      //   key: 6,
      //   title: "制作人员",
      //   dataIndex: "schedule_name",
      // },
      // {
      //   key: 7,
      //   title: "包含项目",
      //   dataIndex: "schedule_project",
      //   scopedSlots: { customRender: "schedule_project" },
      // },
      // {
      //   key: 8,
      //   title: "艺术家数量",
      //   dataIndex: "schedule_person",
      // },
      // {
      //   key: 9,
      //   title: "更新日志",
      //   dataIndex: "schedule_log",
      // },
      {
        key: 10,
        title: "操作",
        dataIndex: "action",
        fixid: "right",
        scopedSlots: { customRender: "action" },
      },
    ]
    list.columns = columns;
    ctx.helper.success(ctx, 1, '成功', list)
  }

  async create() {
    const { ctx, app } = this;
    const params = ctx.request.body;
    // user
    //const user = ctx.session.user;
    //const { uid, name } = user;
    // 计划时间
    let page_settings = {
      start: ctx.helper.getTimeByThree(),
      end: ctx.helper.getNextTime(60),
    }
    // schedule 创建
    const schedeule_arr = {
      name: params.name,
      project_name: params.project_name,
      plan_start_at: page_settings.start,
      plan_end_at: page_settings.end,
      retirement_status: '1',
      //created_user_uuid: uid,
      //created_user_name: name,
    }
    console.log(schedeule_arr)
    const res = await ctx.service.bd.schedulebd.create(schedeule_arr);

    ctx.helper.success(ctx, 1, '成功', { uuid: res.dataValues.uuid, plan_start_at: page_settings.start,
      plan_end_at: page_settings.end})
  }

  async info() {
    const { ctx } = this;

    const params = ctx.request.query;

    const res = await ctx.service.bd.schedulebd.getInfo(params.uuid);
    const info = {
      start: ctx.helper.formatTime(res.plan_start_at),
      end: ctx.helper.formatTime(res.plan_end_at),
    }
    ctx.helper.success(ctx, 1, '成功', info)

  }

  async edit() {
    const { ctx } = this;

    const params = ctx.request.body;

    const schedule_arr = {
      plan_start_at: params.start,
      plan_end_at: params.end,
    }
    await ctx.service.bd.schedulebd.update(params.schedule_uuid, schedule_arr);

    const info = {
      start: params.start,
      end: params.end,
    }
    ctx.helper.success(ctx, 1, '成功', info)
  }

  // 获取资源字段列表 
  async resource_fields() {
    const { ctx } = this;
    const entity = 'resources'
    const params = {
      is_display: 'true',
    }
    const res_fields = await this.ctx.service.entity.getEnertyColumns(entity, params);

    const fields = [];
    let i = 1;
    res_fields.rows.map( item => {
      //if(!item.data_type.includes('reverse-multi-entity') && item.data_type.includes('reverse-multi-entity')) {
        const arr = {
          key: i,
          title: item.name,
          description: item.description,
          disabled: item.is_fill,
          width: item.width,
        }

        fields.push(arr);
        i++
      //}
    })

    ctx.helper.success(ctx, 1, '成功', fields)

  }

  // 筛选列表
  async options() {
    const { ctx } = this;

    const params = ctx.request.body;
    const entity = 'resources'
    const list = await ctx.service.resource.getScheduleOptions();

    const list_users = await ctx.service.schedule.getScheduleOptionsByCreatedUsers();

    const artists = [];
    const created_users = [];
    const projects = [];
    let i = 1;
    list.rows.map( item => {
      const item_artists = {
        id: i,
        value: item.member_name,
        text: item.member_name,

      }
      if(item.member_name) {
        artists.push(item_artists);
      }
      
      const item_projects = {
        id: i,
        value: item.project_name,
        text: item.project_name,
      }
      if(item.project_name) {
        projects.push(item_projects);
      }

      i++;
      
    })

    list_users.rows.map( item => {
      console.log('item list_users', item)
      const item_created_users = {
        id: i,
        value: item.created_user_name,
        text: item.created_user_name,
      }
      if(item.created_user_name) {
        created_users.push(item_created_users);
      }

      i++;
      
    })
    
    const res = {
      artists: ctx.helper.unique(artists, 'value').map( item=> {
        return item
      }),
      created_users: ctx.helper.unique(created_users, 'value').map( item=> {
        return item
      }),
      projects: ctx.helper.unique(projects,'value').map( item=> {
        return item
      }),
    }

    ctx.helper.success(ctx, 1, '成功', res)
  }

  // add field demo
  async up() {
    const queryInterface = this.app.model.models['schedules'];
    const Sequelize = this.app.Sequelize;
    
    const { ctx } = this;
    const fs = require('fs')
    const file = 'app/model/user.js';
    const data = `
    module.exports = app => {
       const DataTypes = require('sequelize').DataTypes;
       const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
       const User = app.model.define('user', {
         uuid: {
           type: UUID,
           primaryKey: true,
           defaultValue: DataTypes.UUIDV4,
         },
         schedules_uuid: {
           type: UUID
         },
         pages_uuid: {
           type: UUID
         },
         test: {
           type: UUID
         },
         created_at: {
           type: DATE
         }
       },{
         timestamps: false,
         freezeTableName: true,
       }
       );
      
      
       return User;
     }`;
//fs.writeFileSync(file, data)
     
  await queryInterface.sync({ alter: true });
    // queryInterface.create({

    //   firstName: 'John',
      
    //   lastName: 'Hancock'
      
    //   });
      
console.log("The table for the User model was just (re)created!");
		ctx.body = '这里是restful-update';
  }

  // 删除排期
  async del() {
    const { ctx, app } = this;
    let { validator } = app;
  
    const params = ctx.request.body;
    console.log('controller schedule destroy params', params)
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid; 
    const uuids = params.uuids;
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
  
    try {
      const arr_info = await ctx.service.bd.schedulebd.getInfoByUuids(uuids);
      console.log('controller resource destroy arr_info', arr_info);
      if (!arr_info) {
        ctx.helper.success(ctx, -1, '非法参数！')
        return
      }
      // 更新数据
      const update_time = ctx.helper.getTime();
      const status = '3';
  
      const update_arr = {
        retirement_at: update_time,
        retirement_status: status
      }
  
      await ctx.service.bd.schedulebd.updateByUuids(uuids, update_arr);

     
  
    } catch (error) {
     // console.log('controller resource destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller resource destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }

}

module.exports = ScheduleBdController;