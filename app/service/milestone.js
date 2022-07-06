'use strict';

const Service = require('egg').Service;

class MilestoneService extends Service {

  // 获取list
  async getList(params) {
    const { ctx } = this;
    if(!params.model) {
      params.model = 'schedule';
    }
    const condition = {
     
      retirement_status: '1',
      model: params.model,
    }
    if(params.publish) {
      const publish_projects = await ctx.service.bd.schedulebd.getPublishProjects();
      const schedule_uuids = publish_projects.map( item => {
        return item.uuid;
      })
      condition.schedule_uuid = {[ctx.model.Sequelize.Op.in]: schedule_uuids }
    } else {
      condition.schedule_uuid = params.schedule_uuid;
    }
    if(params.start) {
      condition.event_at = {[ctx.model.Sequelize.Op.between]: [params.start, params.end] }
    }
    const res = this.ctx.model.Milestone.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
  
  //
  async create(params) {
    const res = this.ctx.model.Milestone.create(params);

    return res;
  }

  async update(uuid, params) {
    console.log('params', params)
    const res = this.ctx.model.Milestone.update(
      params
      ,{
      where:{
        uuid,
      }
    })

    return res;
  }

  

  // 获取单条数据信息
  async getInfo(uuid, model= 'resource') {
    const res = await this.ctx.model.Milestone.findOne({
      where: {
        uuid,
        model,
      },
      raw: true,
    })
    return res;
  }
 
}

module.exports = MilestoneService;