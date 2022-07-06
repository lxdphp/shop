'use strict';

const Service = require('egg').Service;

class PageService extends Service {

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

  async updateByUser(uid, params, model = 'resource') {
    console.log('params', params)
    const res = this.ctx.model.Pages.update(
      params
      ,{
      where:{
        created_user_uuid:uid,
        model,
      }
    })

    return res;
  }

  async updateByUuid(uuid, params) {
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

  // 获取单条数据信息
  async getInfoByUser(uid, model = 'resource') {
    const res = await this.ctx.model.Pages.findOne({
      where: {
        created_user_uuid:uid,
        model,
      },
      raw: true,
    })
    return res;
  }

  // 获取数据信息
  async getList(params) {
    const condition = {

    }
    if(params.model) {
      condition.model = params.model;
    }
    const res = await this.ctx.model.Pages.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
 
}

module.exports = PageService;