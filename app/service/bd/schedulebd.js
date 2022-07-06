'use strict';

const Service = require('egg').Service;

class ScheduleService extends Service {

  async getList2(fields, params = [], limit = 100, offset = 0, properties = '') {
    const include = properties;
    console.log('include', include)

    const condition = {
      retirement_status: '1',
    };
    if(params.created_users) {
      //condition.push(` AND created_user_name = ${params.created_user_name} `);
      //condition.created_user_name = params.created_user_name;
      condition.created_user_name = params.created_users;
    }
    // include[0].where = [];
    // if(params.artists) {
    //   include[0].where.push({
    //     member_name: params.artists,
    //   })
    // }
    // if(params.projects) {
    //   include[0].where.push({
    //     project_name: params.projects,
    //   })
    // }
    //const condition_join = condition.join(" ");
    console.log('condition2222222222123', condition);
    
    const res = await this.ctx.model.SchedulesBd.findAll({
      where: condition,
      include,
      limit,
      offset: (offset - 1)*limit,
      required: false,
      //distinct:true,
      // col: 'id',
      // //group: 'schedules.id',
      // raw: false,
      order: [
        ['id', 'desc']
      ]
    })
    // const query = `SELECT array_to_string( ARRAY_AGG ( project_name ), ',' ) AS project_name,schedules.* FROM schedules AS schedules ${properties_sql} WHERE schedules.uuid IS NOT NULL ${condition_join} GROUP BY schedules.uuid LIMIT ${limit} OFFSET ${offset}`;
    // console.log('query', query)
    // const res = await this.app.model.query(query, {type:'SELECT'});
    
    // 获取总数
    const res_count = await this.ctx.model.SchedulesBd.count({
      where: condition,
      include,
      distinct:true,
      col: 'id'
    })

    // const query_count = `SELECT count(DISTINCT(schedules.uuid)) as count FROM schedules AS schedules ${properties_sql} WHERE
    // schedules.uuid IS NOT NULL ${condition_join} LIMIT 1`
    // const res_count = await this.app.model.query(query_count, {type:'SELECT'});
    const rest = {
      rows: res,
      count: res_count,
    }
    return rest;
  }

  async getProjectInfo(entity, params, data_type) {
    //查找下表字段
    const entity_params = {
      data_type,
    }
    const res_fields = await this.ctx.service.entity.getEnertyColumns(entity, entity_params);

    let properties = [];
    let code = '';
    for(const item of res_fields.rows) {
      //console.log('item222222222222222', item)
      const item_properties = JSON.parse(item.properties);
      console.log('item_properties222222222', item_properties)
      properties = item_properties['list-entity'];
      code = item.code;
    }

    const condition = {}
    if(params.schedule_uuid) {
      condition.schedule_uuid = params.schedule_uuid;
      condition.retirement_status = '1';
    }
    console.log('res999999999999999')
    if(entity === 'schedules') {
      const field = code.split('_');
      const field1 = field[0] + '_name';
      const field2 = field[1] + '_name';
      const table_model = this.app.model.models[properties.entity];
      console.log('condition', condition)
      const res = await table_model.aggregate(field2, 'count',
        {
          //@ts-ignore
          attributes: [field1],
          // 这个字段设置了则为 返回聚合
          plain: false,
          where: condition,
          group: field1,
        });
      console.log('res222222222222222', res)
      return res;
    }
    
    return res;
  }

  // 创建
  async create(params) {
    const { ctx } = this;
    const res = ctx.model.SchedulesBd.create(params)
    return res;
  }

  // 更新
  async update(uuid, params) {
    const { ctx } = this;
    const res = ctx.model.SchedulesBd.update(params, {
      where: {
        uuid,
      }
    })
    return res;
  }

  // 获取单条数据信息
  async getInfo(uuid) {
    const res = await this.ctx.model.SchedulesBd.findOne({
      where: {
        uuid,
      },
      raw: true,
    })
    return res;
  }

  async geinfoByParams(params) {
    const condition = {};
    if(params.publish) {
      condition.publish = params.publish
    }
    if(params.project_name) {
      condition.project_name = params.project_name
    }
    const res = await this.ctx.model.SchedulesBd.findOne({
      where: condition,
      raw: true,
    })
    return res;
  }

  // 获取筛选条件
  async getScheduleOptionsByCreatedUsers() {
    const { ctx } = this;
    const res = await ctx.model.SchedulesBd.findAndCountAll({

    });
    return res;                               
  }

  // 批量 获取数据信息
  async getInfoByUuids(uuids) {
    const { ctx } = this;
    console.log('uuids', uuids);
    const res = await this.ctx.model.SchedulesBd.findAndCountAll({
      where: {
        uuid: {[ctx.model.Sequelize.Op.in]: uuids },
      },
      raw: true,
    })
    return res;
  }

  // 批量 更新
  async updateByUuids(uuids, params) {
    const { ctx } = this;
    const res = ctx.model.SchedulesBd.update(params, {
      where: {
        uuid: {[ctx.model.Sequelize.Op.in]: uuids },
      }
    })
    return res;
  }

  async getPublishProjects(params = {}) {
    const { ctx } = this;
    const condition = {
      publish: '已发布',
      retirement_status: '1',
    }
    if(params.project_name) {
      condition.project_name = params.project_name;
    }
    let order = [
    ] 
    if(params.sorts && params.order && params.sorts === 'project_name') {
      order = [
        [params.sorts, params.order],
      ]
    }

    const res = await this.ctx.model.SchedulesBd.findAll({
      where: condition,
      order,
      raw: true,
    })
    return res;
  }
 
}

module.exports = ScheduleService;