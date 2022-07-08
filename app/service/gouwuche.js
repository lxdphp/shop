'use strict';

const Service = require('egg').Service;

class GouwucheService extends Service {

  // 获取list
  async getList(params) {
    const { ctx } = this;
    const condition = {
    }
    if(params.status || params.status === 0) {
      condition.status = params.status;
    }
    const res = this.ctx.model.Gouwuche.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
  
  //
  async create(params) {
    const res = this.ctx.model.Gouwuche.create(params);

    return res;
  }

  async update(id, params) {
    console.log('params', params)
    const res = this.ctx.model.Gouwuche.update(
      params
      ,{
      where:{
        id,
      }
    })

    return res;
  }

  async destroy(id) {
    const res = this.ctx.model.Gouwuche.destroy(
    {
      where:{
        id,
      }
    })

    return res;
  }

  

  // 获取单条数据信息
  async getInfo(id) {
    const res = await this.ctx.model.Gouwuche.findOne({
      where: {
        id,
      },
      raw: true,
    })
    return res;
  }
 
}

module.exports = GouwucheService;