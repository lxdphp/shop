'use strict';

const Service = require('egg').Service;

class ResourceService extends Service {


  async getShots(fields, params = [], limit = 100, offset = 0, properties = '') {
    const { ctx } = this;
    const include = properties;
    console.log('include getShots', include, params)
    //const aa = JSON.parse(params);
    const condition = [{
      retirement_status: { [ctx.model.Sequelize.Op.ne]: '3' },
      
    }];
    if (params.schedule_uuid) {
      condition.push({
        schedule_bd_uuid:params.schedule_uuid
      },
      )
    }
    if(params.from || params.from === '') {
      condition.push({
        from: params.from,
      },
      )
    }
    if(params.parent_ids) {
      condition.push({
        parent_id: { [ctx.model.Sequelize.Op.in]: params.parent_ids },
      },
      )
    }

    if(params.schedule_uuids) {
      condition.push({
        schedule_bd_uuid: { [ctx.model.Sequelize.Op.in]: params.schedule_uuids },
      },
      )
    }

    if(params.parent_id && params.parent_id * 1 === -1) {
      condition.push({
        parent_id: { [ctx.model.Sequelize.Op.ne]: 0 },
      },
      )
    }
    if (params.category_name) {

      //condition.category_name = params.category_name;
      condition.push({
        category_name:params.category_name
      },
      )
    }
    if (params.link_name) {

      //condition.link_name = params.link_name;

      condition.push({
        [ctx.model.Sequelize.Op.or]: [
          { link_name: params.link_name },
          { parent_id: 0 },
        ]
      },
      )
    }
    if (params.link_name_not_parent) {

      //condition.link_name = params.link_name;

      condition.push({
        link_name:params.link_name_not_parent
      },
      )
    }
    include[1].where = [
      {
        retirement_status: { [ctx.model.Sequelize.Op.ne]: '3' },
      }
    ];
    include[1].required = false;

    if (params.start) {

      //condition['$events.start_at$'] = {[ctx.model.Sequelize.Op.gte]: params.start }
      include[1].where.push({
        [ctx.model.Sequelize.Op.or]: [{ end_at: { [ctx.model.Sequelize.Op.between]: [params.start, params.end] } },
        { start_at: { [ctx.model.Sequelize.Op.between]: [params.start, params.end] } },
        ]
      },
      )
    }
    if (params.from || params.from === '') {

      //condition.category_name = params.category_name;
      include[1].where.push({
        from:params.from
      },
      )
    }

    let order = [
      ['category_name', 'asc']
    ] 
    if(params.sorts && params.order && params.sorts !== 'duration' && params.sorts !== 'project_name') {
      order = [
        [params.sorts, params.order],
      ]
    }
    order.push(['link_sort', 'asc'])

    //condition.uuid = '860aba76-de35-425b-a6e0-3f95883945a6';
    const res = await this.ctx.model.Shots.findAndCountAll({
      where: condition,
      include,
      limit,
      offset: (offset - 1) * limit,
      raw: false,
      //group: ['uuid','project_name']
      order
    })


    // const query_count = `SELECT count(DISTINCT(schedules.uuid)) as count FROM schedules AS schedules ${properties_sql} WHERE
    // schedules.uuid IS NOT NULL ${condition_join} LIMIT 1`
    // const res_count = await this.app.model.query(query_count, {type:'SELECT'});

    return res;
  }

  //
  async create(params) {
    const res = this.ctx.model.Shots.create(params);

    return res;
  }

  async update(uuid, params) {
    console.log('params', params)
    const res = this.ctx.model.Shots.update(
      params
      , {
        where: {
          uuid,
        }
      })

    return res;
  }

  async updateByUuids(uuids, params) {
    console.log('params', params)
    const res = this.ctx.model.Shots.update(
      params
      , {
        where: {
          uuid: { [this.ctx.model.Sequelize.Op.in]: uuids }
        }
      })

    return res;
  }

  async updateByParentid(parent_id, params) {
    console.log('params', params)
    const res = this.ctx.model.Shots.update(
      params
      , {
        where: {
          parent_id,
        }
      })

    return res;
  }

  // 获取总表的筛选列表
  async getScheduleOptions(params = {}) {
    const condition = {};
    if(params.schedule_bd_uuid) {
      condition.schedule_bd_uuid = params.schedule_bd_uuid;
    }
    const res = await this.ctx.model.Shots.findAndCountAll({
      where: condition,
    });
    return res;
  }

  // 获取单条数据信息
  async getInfo(uuid) {
    const res = await this.ctx.model.Shots.findOne({
      where: {
        uuid,
      },
      raw: true,
    })
    return res;
  }


  async resource_fields(type = 'is_display') {
    const entity = 'shots'
    const params = {
      
    }
    if(type === 'is_display') {
      params.is_display = 'true';
    }
    if(type === 'is_add') {
      params.is_add = true
      params.is_display = 'false';
    }
    const res_fields = await this.ctx.service.entity.getEnertyColumns(entity, params);

    const fields = [];
    let i = 1;
    res_fields.rows.map(item => {
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
    const res = await ctx.model.Shots.findAndCountAll({
      where: {
        retirement_status: '1',

      },
      raw: true,
    })

    return res;
  }
  async getInfoByParams(params, type = 'info') {
    const { ctx } = this;
    const condition = {
      retirement_status: '1',
    }
    if (params.category_name || params.category_name === '') {
      condition.category_name = params.category_name;
    }
    if (params.link_name) {
      condition.link_name = params.link_name;
    }
    if (params.shot_name) {
      condition.shot_name = params.shot_name;
    }
    if (params.parent_id || params.parent_id === 0) {
      condition.parent_id = params.parent_id;
    }
    if (params.schedule_uuid) {
      condition.schedule_bd_uuid = params.schedule_uuid;
    }
    if (params.uuids) {
      condition.uuid = { [ctx.model.Sequelize.Op.in]: params.uuids }
    }
    if (type === 'info') {
      const res = await ctx.model.Shots.findOne({
        where: condition,
        raw: true,
      })

      return res;
    }

    if (type === 'list') {
      const res = await ctx.model.Shots.findAndCountAll({
        where: condition,
        raw: true,
      })

      return res;
    }

  }

  // 删除shots map events_bd
  async delByUuids(shot_uuids) {
    //
    const { ctx } = this;
    await ctx.model.Shots.destroy({
      where: {
        uuid: { [ctx.model.Sequelize.Op.in]: shot_uuids },
      },
      raw: true,
    })
    await ctx.model.MapShotsEventsBdEvent.destroy({
      where: {
        shots_uuid: { [ctx.model.Sequelize.Op.in]: shot_uuids },
      },
      raw: true,
    })
    const res = await ctx.model.EventsBd.destroy({
      where: {
        shots_uuid: { [ctx.model.Sequelize.Op.in]: shot_uuids },
      },
      raw: true,
    })

    return res;
  }

  // 发布
  async publish(params) {
    const { ctx } = this;
    const { schedule_uuid } = params;
    const schedule_bd_uuid = schedule_uuid;
    const update_arr = {
      status: '已发布',
      publish: '已发布'
    }
    const publish_arr = {
      publish: '已发布'
    }
    let transaction = null
    try {
      transaction = await this.ctx.model.transaction();
      // 相同项目发布，仅允许发布一次
      const schedule_info = await this.ctx.service.bd.schedulebd.getInfo(schedule_uuid);
      const params = {
        publish: '已发布',
        project_name: schedule_info.project_name,
        retirement_status: { [ctx.model.Sequelize.Op.ne]: '3' },
      }
      const schedule_info_exit = await this.ctx.service.bd.schedulebd.geinfoByParams(params);
      if(schedule_info_exit) {
        return false;
      }

      await this.ctx.model.SchedulesBd.update(
        update_arr
        , {
          where: {
            uuid: schedule_bd_uuid,
          }
        },{ transaction })
      await this.ctx.model.Shots.update(
        publish_arr
        , {
          where: {
            schedule_bd_uuid,
          }
        },{ transaction })
      await this.ctx.model.EventsBd.update(
        publish_arr
        , {
          where: {
            schedule_bd_uuid,
          }
        },{ transaction })
      await transaction.commit();
      // throw new Error();  // 即使数据库操作成功 , 此条语句依然会回滚
      return true;
    } catch (error) {
      await transaction.rollback();
      console.log('error ', error)
      return false;
    }
  }

}

module.exports = ResourceService;