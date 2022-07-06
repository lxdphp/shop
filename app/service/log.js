'use strict';

const Service = require('egg').Service;

class ResourceService extends Service {
  
  //
  async create_resource(params) {
    const res = this.ctx.model.ResourcesLog.create(params);

    return res;
  }


  async create_event(params) {
    const res = this.ctx.model.EventsLog.create(params);

    return res;
  }

  async update(uuid, params) {
    const res = this.ctx.model.Resources.update(
      params
      ,{
      where:{
        event_uuid: uuid,
      }
    })

    return res;
  }
 
}

module.exports = ResourceService;