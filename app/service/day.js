'use strict';

const Service = require('egg').Service;

class PageService extends Service {

  // 获取list
  async getList(params) {
    const { ctx } = this;
    const condition = {
      working: false
    }
    if(params.start) {
      condition.start_at = {[ctx.model.Sequelize.Op.between]: [params.start, params.end] }
    }
    const res = this.ctx.model.DayRules.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
  
  //
  async create(params) {
    const res = this.ctx.model.Pages.create(params);

    return res;
  }

  async update(uuid, params) {
    console.log('params', params)
    const res = this.ctx.model.Pages.update(
      params
      ,{
      where:{
        uuid,
      }
    })

    return res;
  }

  

  // 获取单条数据信息
  async getInfo(uuid) {
    const res = await this.ctx.model.Pages.findOne({
      where: {
        uuid,
      },
      raw: true,
    })
    return res;
  }
 
}

module.exports = PageService;