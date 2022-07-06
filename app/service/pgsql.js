'use strict';

const Service = require('egg').Service;

const { v4: uuidv4 } = require('uuid');


class PgsqlService extends Service {
  
  // 自定义字段处理
  async costomField(entity, type =  '') {
    const { ctx, app } = this;
    //获取表的字段
    const res_fields = await ctx.service.entity.getEnertyColumns(entity);
    
    const table_fields = res_fields.rows.map( item => {
      return entity+ '.' +item.code;
    })
    
    const table_fields_datatype = res_fields.rows.map( item => {
      return item.data_type;
    })
    // 对特殊字段处理 todo
    let includes = [];
    let properties = [];
    for(const item of res_fields.rows) {
      // 1 对 1
      if(item.data_type === 'entity2') {
        // 产生 uuid 和 from 2个字段
        
        const item_properties = JSON.parse(item.properties);
       
        properties = item_properties.entity;
        
        const includes = [];
        for(const item of properties) {
          const field = item.entity + '_uuid';
          const field_from = item.entity + '_from';
          const model_table_1 = app.model.models[entity];
          const model_table_2 = app.model.models[item.entity];

          model_table_1.belongsTo(model_table_2, { foreignKey: 'uuid', targetKey: field });
          const include = [{
            model: model_table_2,
            attributes: [],
          }]
          includes.push(include);
        }
        return includes;
      }
      // 1 对 1 反向 1 对 n
      if(item.data_type === 'reverse-entity') {
        //console.log('item222222222222222', item)
        const item_properties = JSON.parse(item.properties);
        console.log('item_properties reverse-entity', item_properties)
        const properties = item_properties['reverse-entity'];
        console.log('properties reverse-entity', properties)
        const model_table_1 = app.model.models[entity];
        for( const re_item of properties) {
          
          const model_table_2 = app.model.models[re_item.entity];
          console.log('properties re_item.entity + _uuid', entity + '_uuid')
      //     model_table_2.associate = function (){
      //       model_table_2.belongsTo(model_table_1, { foreignKey: 'resources_uuid', targetKey: 'uuid', });
      //   }
      //   model_table_1.associate = function (){
      //     model_table_1.hasMany(model_table_2, { foreignKey: 'resources_uuid', targetKey: 'uuid', });
      // }
      model_table_1.hasMany(model_table_2, { foreignKey: 'resources_uuid', targetKey: 'uuid', });
      //model_table_2.belongsTo(model_table_1, { foreignKey: 'resources_uuid', targetKey: 'uuid', });
       
          //model_table_1.belongsTo(model_table_2, { as: 'ProfilePicture', constraints: false })
          const include = {
            model: model_table_2,
          }
          // {
          //   model: model_table_2,
          //   as: 'ProfilePicture',
          // },
        
          includes.push(include);
        }
        //return includes;
      }
      // n对n
      if(item.data_type === 'multi-entity') {
        
        const item_properties = JSON.parse(item.properties);
        
        properties = item_properties['multi-entity'];

        const model_table_1 = app.model.models[entity];
        const model_table_2 = app.model.models[properties.entity];
        const model_table_3 = app.model.models[properties.map_entity];
        //console.log('Schedules', model_table_3 , model_table_2,  model_table_1);
        
        //model_table_2.belongsTo(model_table_1, { foreignKey: 'schedule_uuid', targetKey: 'uuid' });
        // model_table_1.belongsTo(model_table_3, { foreignKey: 'uuid', targetKey: entity + '_uuid' });
        // model_table_2.belongsTo(model_table_3, { foreignKey: 'uuid', targetKey: properties.entity + '_uuid' });
        // model_table_3.belongsTo(model_table_2, { foreignKey: properties.entity + '_uuid', targetKey: 'uuid' });

        // const include = {
        //   model: model_table_3,
        //   //attributes: [],
        //   include: [{
        //     model: model_table_2,
        //     //attributes: [],
        //   }]
        // }
        const { v4: uuidv4 } = require('uuid');
        //const qq =  uuidv4();
        model_table_1.belongsToMany(model_table_2, { through: model_table_3,   foreignKey: entity + '_uuid'})
        model_table_2.belongsToMany(model_table_1, { through: model_table_3,  foreignKey: properties.entity + '_uuid'})
        
        const include = {
          model: model_table_2,
          required: false,
          through: {
            //attributes: ['createdAt', 'startedAt', 'finishedAt'],
            //where: {completed: true}
          }
        }

        includes.push(include);
        // return includes;
        
      }
      // n对n 反向
      if(item.data_type === 'reverse-multi-entity') {
        //console.log('item222222222222222', item)
        const item_properties = JSON.parse(item.properties);
        console.log('item_properties222222222', item_properties)
        properties = item_properties['reverse-multi-entity'];

        let properties_sql_arr = '';
        console.log('properties2222222', properties)
        const model_table_1 = app.model.models[entity];
        const model_table_2 = app.model.models[properties.entity];
        const model_table_3 = app.model.models[properties.map_entity];
        // model_table_1.belongsTo(model_table_2, { foreignKey: 'uuid', targetKey: properties.entity + '_uuid' });

        // const include = {
        //   model: model_table_2,
        //   //attributes: [],
        // }
        console.log(1111111111111, model_table_1, model_table_2, model_table_3, entity + '_uuid', properties.entity + '_uuid')
        model_table_1.belongsToMany(model_table_2, { through: model_table_3,  foreignKey: entity + '_uuid'})
        model_table_2.belongsToMany(model_table_1, { through: model_table_3, foreignKey: properties.entity + '_uuid'})
        
        const include = {
          model: model_table_2,
         
          through: {
            //attributes: ['createdAt', 'startedAt', 'finishedAt'],
            //where: {completed: true}
          }
        }

        includes.push(include);
      }
      
    }
    const rest = {
      data_type: table_fields_datatype,
      includes,
    }
    return rest;
    return includes;
    // 
  }

  async getMap(entity){
    //获取表的字段
    const res_fields = await ctx.service.entity.getEnertyColumns(entity);
    for(const item of res_fields.rows){
      
    }
  }
  
}

module.exports = PgsqlService;