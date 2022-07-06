'use strict';

const Service = require('egg').Service;

class ScheduleService extends Service {

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
    const res = ctx.model.SchedulesManage.create(params)
    return res;
  }

  // 更新
  async update(uuid, params) {
    const { ctx } = this;
    const res = ctx.model.SchedulesManage.update(params, {
      where: {
        uuid,
      }
    })
    return res;
  }

  // 获取单条数据信息
  async getInfo(uuid) {
    const res = await this.ctx.model.SchedulesManage.findOne({
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
    const res = await this.ctx.model.SchedulesManage.findOne({
      where: condition,
      raw: true,
    })
    return res;
  }

  // 获取筛选条件
  async getScheduleOptionsByCreatedUsers() {
    const { ctx } = this;
    const res = await ctx.model.SchedulesManage.findAndCountAll({

    });
    return res;                               
  }

  // 批量 获取数据信息
  async getInfoByUuids(uuids) {
    const { ctx } = this;
    console.log('uuids', uuids);
    const res = await this.ctx.model.SchedulesManage.findAndCountAll({
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
    const res = ctx.model.SchedulesManage.update(params, {
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

    const res = await this.ctx.model.SchedulesManage.findAll({
      where: condition,
      order,
      raw: true,
    })
    return res;
  }

  async list(params = {}) {
    const { ctx } = this;
    const condition = {
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

    const res = await this.ctx.model.SchedulesManage.findAndCountAll({
      where: condition,
      //order,
      raw: true,
    })
    return res;
  }
 
}

module.exports = ScheduleService;