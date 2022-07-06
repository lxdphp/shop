const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');
const fs = require('fs')

class EntityController extends Controller {
  async create() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.body;
    console.log('res11111111', params)
    // app.validator.validate({ userName: 'string' }, ctx.request.body);
    const res = validator.validate({userName: 'userName'}, ctx.request.body);
    console.log('res11111111', res)
    //添加字段
    //const res = ctx.service.entity.addField(params);
  
    //console.log(333333333, tree_data);
    this.ctx.helper.success(ctx, 1, '成功')
  }

  // add field demo
  async up() {
    const { ctx } = this;
    const params = ctx.request.body;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    params.code = params.code.toLowerCase();
    const user = ctx.session.user;
    const uid = user.uuid;
    let entity = 'resources';
    let model = 'resource';
    if(params.model && params.model === 'bd') {
      entity = 'shots';
      model = 'bd';
    }
    if(params.uuid) {
      let field_arrge = [];
      if(params.data_type === 'list') {
        params.entity_type = 'resources';
        field_arrge  = await ctx.service.entity.getFieldData(params.data_type, '', params.entity_type, '', params.select);
      }
      //对字段的处理
      

      const field_arr = {
        name: params.name,
        description: params.description,
        data_type: params.data_type,
        properties: JSON.stringify(field_arrge),
        updated_user_uuid: uid,
        updated_at: ctx.helper.getTime(),
        is_display: params.is_display,
      }
      
      const res = await ctx.service.entity.editUp(params.uuid, field_arr);

      // 同步对page 进行更新
      const condition = {
        model,
      }
      const pages = await ctx.service.page.getList(condition);
      pages.rows.map( item => {
        if(item.settings) {
          const sett = JSON.parse(item.settings);
          console.log('sett', sett);
          const setting = JSON.parse(sett.settings);
          const keys = JSON.parse(sett.keys);
          setting.map( it => {
            if(it.key === params.uuid) {
              it.title = params.name;
              it.description = params.description;
              it.headerContent = params.name;
            }
          })
          const save_data = {
            keys: JSON.stringify(keys),
            settings: JSON.stringify(setting)
          }
          const page_arr = {
            settings: JSON.stringify(save_data)
          }
          console.log('page_arr', page_arr);
          ctx.service.page.updateByUuid(item.uuid, page_arr);
        }
      })

      this.ctx.helper.success(ctx, 1, '成功')
    } else {
    const params_model = {
      model: entity,
    }
    const res = await ctx.service.entity.getModelInfo(params_model);
    console.log('res', res);
    
    const queryInterface = this.app.model.models[entity];
    //await queryInterface.sync({ alter: true });
    //const aa = `{uuid: {  type: UUID,  primaryKey: true,  defaultValue: DataTypes.UUIDV4,},schedule_uuid: {  type: UUID},member_uuid: {  type: UUID},member_name: {  type: STRING},description: {  type: STRING},department_uuid: {  type: UUID},department_name: {  type: STRING,},member_level: {  type: STRING},project_name: {  type: STRING},project_uuid: {  type: UUID},created_user_uuid: {  type: UUID},edit_user_uuid: {  type: UUID},created_at: {  type: DATE},updated_at: {  type: DATE},retirement_at: {  type: DATE},retirement_status: {  type: STRING},`
    //const file = 'app/model/user.js';
    const fields = res.setting;
    console.log(fields);

    let add_field = '';
    if(!params.data_type.includes('entity')) {
      params.entity_type = entity;
      let data_type = 'STRING';
      switch (params.data_type) {
        case 'varchar':
          data_type = 'STRING';
          params.field_type = 'varchar(50)';
          break;
        case 'int':
          data_type = 'INTEGER';
          params.field_type = 'int4';
          break;
        case 'numeric':
          data_type = 'STRING';
          params.field_type = 'numeric(19,2)';
          break;
        case 'list':
          data_type = 'STRING';
          params.field_type = 'varchar(50)';
          break;
        default:
          break;
      }
      add_field = `${params.code}: {
        type: ${data_type}
       },`
    }
    
    const new_field = fields + add_field;
    console.log('new_field', new_field);
    // 将新的setting保存
    const field_data = {
      setting: new_field,
    }
    const edit_setting = await ctx.service.entity.update(res.uuid, field_data);
    
    //await ctx.service
    const table_name = ctx.helper.InitialsChange(entity);
    const file = `app/model/${entity}.js`;
    const data = `
    module.exports = app => {
       const DataTypes = require('sequelize').DataTypes;
       const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
       const ${table_name} = app.model.define('${entity}', 
       ${new_field}},{
        timestamps: false,
        freezeTableName: true,
      }
       );
       //${table_name}.sync({alter:true})
       return ${table_name};
     }`;
     console.log('data', data);
    fs.writeFileSync(file, data)
    //await queryInterface.sync({ alter: true });
    
    // 从数据库插入字段
    // 插入 user 表 COLUMN
    const column = params.code;
    const column_type = params.field_type;
    await ctx.service.entity.sql_create_field(entity, column, column_type );
    //console.log('user_add_columm',user_add_columm);
    const user_uuid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    //对字段的处理
    const field_arrge = await ctx.service.entity.getFieldData(params.data_type, params.code, params.entity_type, entity, params.select);
    console.log('field_arrge', field_arrge);
    const params_field = {
      code: params.code,
      name: params.name,
      description: params.description,
      entity_type: params.entity_type,
      data_type: params.data_type,
      field_type: params.field_type,
      created_user_uuid: user_uuid,
      properties: JSON.stringify(field_arrge),
      is_display: params.is_display,
      is_add: "true",
    }
    console.log(params_field);
    //return;
    const user_add_columm = await ctx.service.entity.create(params_field);

    // 自定义视图 增加新字段
    const page = await ctx.service.page.getInfoByUser(uid, model);
    const page_settings = JSON.parse(page.settings);
    console.log('page_settings entity', page_settings)
    const settings = JSON.parse(page_settings.settings);
    const keys = JSON.parse(page_settings.keys);

    const new_fields = {
      field: params.code,
      headerContent: params.name,
      width: "100px",
      disabled: false,
      headerClassNames: [
        "resource_header_name"
      ],
      cellClassNames: [
        "resource_content_name"
      ],
      key: user_add_columm.dataValues.uuid,
      title: params.name,
      description: params.name,
    }
    settings.push(new_fields);
    console.log(keys);
    if(params.is_display === 'false') {
      keys.push(user_add_columm.dataValues.uuid)
    } 
    console.log(settings);
    const save_data = {
      keys: JSON.stringify(keys),
      settings: JSON.stringify(settings)
    }
    const page_arr = {
      settings: JSON.stringify(save_data)
    }
    console.log('page_arr', page_arr);
    await ctx.service.page.updateByUser(uid, page_arr, model);

		this.ctx.helper.success(ctx, 1, '成功', save_data)
  }
  }

  // edit field
  async editUp() {
    const { ctx } = this;
    const params = ctx.request.body;
    // const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    // user
    const user = ctx.session.user;
    const { uid, name } = user;    
    let field_arrge = [];
    if(params.data_type === 'list') {
      params.entity_type = 'resources';
      field_arrge  = await ctx.service.entity.getFieldData(params.data_type, '', params.entity_type, '', params.select);
    }
    //对字段的处理
    

    const field_arr = {
      name: params.name,
      description: params.description,
      //data_type: params.data_type,
      properties: JSON.stringify(field_arrge),
      updated_user_uuid: uid,
      updated_at: ctx.helper.getTime(),
    }
    
    const res = await ctx.service.entity.editUp(params.uuid, field_arr);

    this.ctx.helper.success(ctx, 1, '成功')
  }

  // get field info 
  async getUp() {
    const { ctx } = this;
    const params = ctx.request.query;
    const user = ctx.session.user;
    console.log(' session user', user);
    const res =  await ctx.service.entity.getInfo(params.uuid);
    console.log('res', res)
    if(res.data_type === 'list') {
      const properties = JSON.parse(res.properties);

      res.select =  properties.list[0].values;
    }

    this.ctx.helper.success(ctx, 1, '成功', res)
  }

  // get field
  async getCustomForm() {
    const { ctx } = this;
    const params = ctx.request.query;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
    let entity = 'resources';
    let type = 'resource'
    if(params.model && params.model === 'bd') {
      entity = 'shots';
      type = 'bd';
    }
    // 获取自定义字段表单
    const res = await ctx.service.entity.getCustomForm(entity, type);
    

    this.ctx.helper.success(ctx, 1, '成功', res)
  }


}

module.exports = EntityController;