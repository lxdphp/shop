'use strict';

const Service = require('egg').Service;

class CategoryService extends Service {

  // 获取list
  async getList(params) {
    const { ctx } = this;
    const condition = {
    }
    if(params.pid || params.pid === 0) {
      condition.pid = params.pid;
    }
    const res = this.ctx.model.Category.findAndCountAll({
      where: condition,
      raw: true,
    })
    return res;
  }
  
  //
  async create(params) {
    const res = this.ctx.model.Category.create(params);

    return res;
  }

  async update(id, params) {
    console.log('params', params)
    const res = this.ctx.model.Category.update(
      params
      ,{
      where:{
        id,
      }
    })

    return res;
  }

  async destroy(id) {
    console.log('params', params)
    const res = this.ctx.model.Category.destroy(
    {
      where:{
        id,
      }
    })

    return res;
  }

  

  // 获取单条数据信息
  async getInfo(id) {
    const res = await this.ctx.model.Category.findOne({
      where: {
        id,
      },
      raw: true,
    })
    return res;
  }
 
}

module.exports = CategoryService;