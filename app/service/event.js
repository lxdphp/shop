'use strict';

const Service = require('egg').Service;

class EventService extends Service {
  
  async getList(fields, params = [], limit = 100, offset = 0, properties = []) {
    const condition = [];
    if(params.created_user_name) {
      condition.push(` AND created_user_name = ${params.created_user_name} `);
    }
    if(params.member_name) {
      condition.push(` AND member_name = ${params.member_name} `);
    }
    if(params.project_name) {
      condition.push(` AND project_name = ${params.project_name} `);
    }
    const condition_join = condition.join(" ");
    let properties_sql_arr = [];
    console.log('properties', properties)
    if(properties.length > 0) {
      for(const item of properties) {
        const sql = ` LEFT JOIN ${item.entity} AS ${item.entity} ON schedules.uuid = ${item.entity}.${item.reverse_field} `;
        properties_sql_arr.push(sql);
      }
    }
    const properties_sql = properties_sql_arr.join(" ");
    console.log('properties_sql', properties_sql)
   
    const query = `SELECT array_to_string( ARRAY_AGG ( member_name ), ',' ) AS member_names,array_to_string( ARRAY_AGG ( project_name ), ',' ) AS project_names,schedules.* FROM schedules AS schedules ${properties_sql} WHERE schedules.uuid IS NOT NULL ${condition_join} GROUP BY schedules.uuid LIMIT ${limit} OFFSET ${offset}`;
    console.log('query', query)
    const res = await this.app.model.query(query, {type:'SELECT'});
    
    // 获取总数
    const query_count = `SELECT count(DISTINCT(schedules.uuid)) as count FROM schedules AS schedules ${properties_sql} WHERE
    schedules.uuid IS NOT NULL LIMIT 1`
    const res_count = await this.app.model.query(query_count, {type:'SELECT'});
    const rest = {
      rows: res,
      count: res_count[0].count,
    }
    return rest;
  } 

  async getList2(fields, params = [], limit = 100, offset = 0, properties = '') {
    const condition = [];
    if(params.created_user_name) {
      //condition.push(` AND created_user_name = ${params.created_user_name} `);
      condition.created_user_name = params.created_user_name;
    }
    if(params.member_name) {
      //condition.push(` AND member_name = ${params.member_name} `);
      condition.member_name = params.member_name
    }
    if(params.project_name) {
      //condition.push(` AND project_name = ${params.project_name} `);
      condition.project_name = params.project_name;
    }
    const condition_join = condition.join(" ");
    
    const include = properties;
    console.log('include', include)
    const res = await this.ctx.model.Schedules.findAll({
      where: condition,
      include,
      limit,
      offset,
      group: 'schedules.uuid'
    })
    // const query = `SELECT array_to_string( ARRAY_AGG ( project_name ), ',' ) AS project_name,schedules.* FROM schedules AS schedules ${properties_sql} WHERE schedules.uuid IS NOT NULL ${condition_join} GROUP BY schedules.uuid LIMIT ${limit} OFFSET ${offset}`;
    // console.log('query', query)
    // const res = await this.app.model.query(query, {type:'SELECT'});
    
    // 获取总数
    const res_count = await this.ctx.model.Schedules.count({
      where: condition,
      include,
      distinct:true,
      col: 'uuid'
    })

    // const query_count = `SELECT count(DISTINCT(schedules.uuid)) as count FROM schedules AS schedules ${properties_sql} WHERE
    // schedules.uuid IS NOT NULL ${condition_join} LIMIT 1`
    // const res_count = await this.app.model.query(query_count, {type:'SELECT'});
    const rest = {
      rows: res,
      count: res_count,
    }
    return rest;
  }

  //
  async create(params) {
    const res = this.ctx.model.Events.create(params);

    return res;
  }

  async update(uuid, params) {
    const res = this.ctx.model.Events.update(
      params
      ,{
      where:{
        uuid,
      }
    })

    return res;
  }

  async updateMap(uuid, params) {
    const res = this.ctx.model.MapResourcesEventsEvent.update(
      params
      ,{
      where:{
        events_uuid: uuid,
      }
    })

    return res;
  }

  // 获取单条数据信息
  async getInfo(uuid) {
    const res = await this.ctx.model.Events.findOne({
      where: {
        uuid,
      },
      raw: true,
    })
    return res;
  }
  
  // max min
  async getDateMaxMin(schedule_uuid) {
    const res = await this.ctx.model.Events.findOne({
      attributes: [ [this.ctx.model.Events.sequelize.fn('MAX', this.ctx.model.Events.sequelize.col('end_at')), 'end'], [this.ctx.model.Events.sequelize.fn('MIN', this.ctx.model.Events.sequelize.col('start_at')), 'start'] ],
      raw: true,
      where: {
        schedule_uuid,
        retirement_status: {[this.ctx.model.Sequelize.Op.ne]: '3' },
      },
    })
    return res;
  }

  async getDaySummary(schedule_uuid) {
    const { ctx } = this;
    const params = {
      schedule_uuid,
    }
    const limit = 10000;
    const offect = 1;
    const entity = 'resources';
    const properties = await ctx.service.pgsql.costomField(entity);
    const fieldss = [];
    const resource = await ctx.service.resource.getResources(fieldss, params, limit, offect, properties.includes);

    const events = [];
    resource.rows.map(item => {
      //console.log(item);return;
      let duration = 0;
      item.events.map(item_event => {
        duration += item_event.duration * 1;

        const arr = {
          id: item_event.uuid,
          resourceId: item.uuid,
          title: item_event.content,
          start: ctx.helper.formatTime(item_event.start_at),
          end: ctx.helper.formatTime(item_event.end_at),
          progress: item_event.progress,
        }
        events.push(arr);
      }
    )
    return item;
    })
    //对events
    const all_days = []
    events.map( item => {
      const arr = ctx.helper.getAllDays(item.start, item.end);
      //console.log('arr', arr);
      arr.map( it => {
        all_days.push({
          date: it,
          progress: item.progress * 1 / 100,
        })
      })
      
    })
    console.log('arr', all_days);
    // const day_summary =  all_days.reduce(function(prev,next){ 
    //   prev[next] = (prev[next] + 1) || 1; 
    //   return prev; 
    // },{});
    let result = {}; 
    all_days.forEach(item => { 
      if (result[item.date]) { 
        result[item.date] += item.progress.toFixed(2)  * 100 / 100; 
        
      } else { 
        result[item.date] = item.progress * 1;
       } 
    })
    console.log('result', result);
  
    let s = {}; 
    for (let k in result) { 
      s[k] = result[k].toFixed(2) * 1
    }
    console.log('s', s);
    return s;
  }
}

module.exports = EventService;