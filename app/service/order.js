'use strict';

const Service = require('egg').Service;

class OrderService extends Service {

  // 获取list
  async getList(params) {
    const { ctx } = this;
    const condition = {
    }
    if(params.status || params.status === 0) {
      condition.status = params.status;
    }
    const res = this.ctx.model.Order.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }

  // 获取list
  async getListDetail(params) {
    const { ctx } = this;
    const condition = {
    }
    if(params.order_id) {
      condition.order_id = params.order_id;
    }
    const res = this.ctx.model.OrderDetail.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
  
  
  //
  async create(params) {
    const res = this.ctx.model.Order.create(params);

    return res;
  }

  async createdetail(params) {
    const res = this.ctx.model.OrderDetail.create(params);

    return res;
  }

  async update(id, params) {
    console.log('params', params)
    const res = this.ctx.model.Order.update(
      params
      ,{
      where:{
        id,
      }
    })

    return res;
  }

  async destroy(id) {
    const res = this.ctx.model.Order.destroy(
    {
      where:{
        id,
      }
    })

    return res;
  }

  

  // 获取单条数据信息
  async getInfo(id) {
    const res = await this.ctx.model.Order.findOne({
      where: {
        id,
      },
      raw: true,
    })
    return res;
  }
 
}

module.exports = OrderService;