'use strict';

const Service = require('egg').Service;

class GoodsService extends Service {

  // 获取list
  async getList(params) {
    const { ctx } = this;
    const condition = {
    }
    if(params.pid || params.pid === 0) {
      condition.pid = params.pid;
    }

    if(params.category_id) {
      condition.category_id = params.category_id;
    }

    const res = this.ctx.model.Goods.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
  
  //
  async create(params) {
    const res = this.ctx.model.Goods.create(params);

    return res;
  }

  async update(id, params) {
    console.log('params', params)
    const res = this.ctx.model.Goods.update(
      params
      ,{
      where:{
        id,
      }
    })

    return res;
  }

  async destroy(id) {
    const res = this.ctx.model.Goods.destroy(
    {
      where:{
        id,
      }
    })

    return res;
  }

  

  // 获取单条数据信息
  async getInfo(id) {
    const res = await this.ctx.model.Goods.findOne({
      where: {
        id,
      },
      raw: true,
    })
    return res;
  }
 
}

module.exports = GoodsService;