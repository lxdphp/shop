'use strict';

const Service = require('egg').Service;

class PermissionService extends Service {
  
  async getModelPermission(params = []) {
    const condition = {
      retirement_status: '1',
    }
    const condition_include = {

    }
    if(params.model) {
      condition.model = params.model;
    }
    console.log('params', params)
    if(params.role_uuids) {
      condition_include.role_uuid = {[this.ctx.model.Sequelize.Op.in]: params.role_uuids }
    } else {
      return [];
    }
    const res = this.ctx.model.PermissionRulesBusiness.findAndCountAll({
      where: condition,
      include: {
        model: this.ctx.model.PermissionRules,
        required: true,
        where: condition_include
      },
      raw: true
    })

    return res;
  }
  
}

module.exports = PermissionService;