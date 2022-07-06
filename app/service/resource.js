'use strict';

const Service = require('egg').Service;

class ResourceService extends Service {
   

  async getResources(fields, params = [], limit = 100, offset = 0, properties = '') {
    const { ctx } = this;
    const include = properties;
    console.log('include getResources', include)
    
    const condition = {
      schedule_uuid: params.schedule_uuid,
      retirement_status: {[ctx.model.Sequelize.Op.ne]: '3' },
    };
    if(params.created_users) {
      
      condition.member_name = params.created_users;
    }
    if(params.artists) {
     
      condition.member_name = params.artists
    }
    if(params.projects) {
      
      condition.project_name = params.projects;
    }
    if(params.departments) {
      
      condition.department_uuid = params.departments;
    }
    if(params.level_arter) {
      condition.level_arter = params.level_arter;
    }
    include[1].where = [
      {
        retirement_status: {[ctx.model.Sequelize.Op.ne]: '3' },
      }
    ];
    include[1].required = false;

    if(params.start) {
      
      //condition['$events.start_at$'] = {[ctx.model.Sequelize.Op.gte]: params.start }
      include[1].where.push({
        start_at: {[ctx.model.Sequelize.Op.gte]: params.start },
      })
    }
    if(params.end) {
      include[1].where.push({
        end_at: {[ctx.model.Sequelize.Op.lte]: params.end },
      })
      //condition['$events.end_at$'] = {[ctx.model.Sequelize.Op.lte]: params.end }
    }

    //condition.uuid = '860aba76-de35-425b-a6e0-3f95883945a6';
    
    const res = await this.ctx.model.Resources.findAndCountAll({
      where: condition,
      include,
      limit,
      offset: (offset - 1) * limit,
      raw:false,
      //group: ['uuid','project_name']
      order: [
        ['created_at', 'desc'],
        ['project_name', 'asc']
      ]
    })
  

    // const query_count = `SELECT count(DISTINCT(schedules.uuid)) as count FROM schedules AS schedules ${properties_sql} WHERE
    // schedules.uuid IS NOT NULL ${condition_join} LIMIT 1`
    // const res_count = await this.app.model.query(query_count, {type:'SELECT'});
    
    return res;
  }

  //
  async create(params) {
    const res = this.ctx.model.Resources.create(params);

    return res;
  }

  async update(uuid, params) {
    console.log('params', params)
    const res = this.ctx.model.Resources.update(
      params
      ,{
      where:{
        uuid,
      }
    })

    return res;
  }

  // 获取总表的筛选列表
  async getScheduleOptions() {
    const res = await this.ctx.model.Resources.findAndCountAll({

    });
    return res;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
  }

  // 获取单条数据信息
  async getInfo(uuid) {
    const res = await this.ctx.model.Resources.findOne({
      where: {
        uuid,
      },
      raw: true,
    })
    return res;
  }


  async resource_fields() {
    const entity = 'resources'
    const params = {
      is_display: 'true',
    }
    const res_fields = await this.ctx.service.entity.getEnertyColumns(entity, params);

    const fields = [];
    let i = 1;
    res_fields.rows.map( item => {
      //if(!item.data_type.includes('reverse-multi-entity') && item.data_type.includes('reverse-multi-entity')) {
        const arr = {
          title: item.name,
          description: item.name,
          key: item.uuid,
          field: item.code,
          headerContent: item.name,
          width: item.width,
          disabled: item.disabled
        }

        fields.push(arr);
        i++
      //}
    })
    return fields;
  }

  async getMembers() {
    const { ctx } = this;
    const res = await ctx.model.Resources.findAndCountAll({
      where: {
        retirement_status: '1',
        
      },
      raw: true,
    })

    return res;
  }
 
}

module.exports = ResourceService;