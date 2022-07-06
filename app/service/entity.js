'use strict';

const Service = require('egg').Service;

const { v4: uuidv4 } = require('uuid');
const fs = require('fs')


class EntityService extends Service {

	// 添加自定义字段
	async addField(fields) {
		const user_uuid = uuidv4();

		//对字段的处理
		const field_arrge = await this.getFieldData(data_type, code, entity_type);

		//字段名称，字段类型, 
		const field_arr = {
			code: fields.code,
			name: fields.name,
			description: fields.description,
			entity_type: fields.entity_type,
			data_type: fields.data_type,
			field__type: fields.field__type,
			created_user_uuid: user_uuid,
			properties: field_arrge
		}
		// add enerty_column
		const res = await this.sql_create_field(field.entity_type, field);
		return res;
		// 
	}

	// 自定义字段
	async getFieldData(data_type, code, entity_type, entity, select_list) {
		const { ctx } = this;
		let properties = {};
		switch (data_type) {
			case 'entity':
				const entitys = {
					entity: entity_type,
					reverse_field: entity_type + '_' + code
				}
				properties.entity = [];
				properties.entity.push(entitys);

				// 增加2个字段 ${code}_by_type ${code}_by_uuid
				const column = `${code}_by_type`;
				const column_type = 'varchar(20)';
				const add_columm = await ctx.service.entity.sql_create_field(entity_type, column, column_type);
				console.log('add_column', add_columm)
				const column_uuid = `${code}_by_uuid`;
				const column_type_uuid = 'varchar(20)';
				const add_columm_uuid = await ctx.service.entity.sql_create_field(entity_type, column_uuid, column_type_uuid);
				console.log('add_columm_uuid', add_columm_uuid)
				break;
			case 'reverse-entity':
				const reverse_entity = {
					entity: entity_type,
					reverse_field: entity_type + '_' + code,
				}
				properties['reverse-entity'] = []
				properties['reverse-entity'].push(reverse_entity);
				// 增加2个字段 ${code}_by_type ${code}_by_uuid
				const column_2 = `${code}_by_type`;
				const column_type_2 = 'varchar(20)';
				const add_columm_2 = await ctx.service.entity.sql_create_field(entity_type, column_2, column_type_2);
				console.log('add_columm_2', add_columm_2)
				const column_uuid_2 = `${code}_by_uuid`;
				const column_type_uuid_2 = 'varchar(20)';
				const add_columm_uuid_2 = await ctx.service.entity.sql_create_field(entity_type, column_uuid_2, column_type_uuid_2);
				console.log('add_columm_uuid_2', add_columm_uuid_2)
				break;
			case 'multi-entity':
				const multi_entity = {
					entity: entity_type,
					reverse_field: entity_type + '_' + code,
					map_entity: `map_${entity}_${entity_type}_${code}`,
				}
				properties['multi-entity'] = []
				properties['multi-entity'].push(multi_entity);

				// 增加一个map 表
				const entity_da = ctx.helper.InitialsChange(entity);
				console.log('entity_da', entity);
				const entity_type_da = ctx.helper.InitialsChange(entity_type);
				console.log('entity_type_da', entity_type);
				const code_da = ctx.helper.InitialsChange(code);
				console.log('code_da', code);
				const table_name = `Map${entity_da}${entity_type_da}${code_da}`;
				const file = `app/model/map_${entity}_${entity_type}_${code}.js`;
				const new_field = `
        {
          uuid: {
          type: UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        ${entity}_uuid: {
          type: UUID
        },
        ${entity_type}_uuid: {
          type: UUID
        },
        created_at: {
          type: DATE
        }`
				const data = `
        module.exports = app => {
           const DataTypes = require('sequelize').DataTypes;
           const { STRING, INTEGER, UUID, DATE } = app.Sequelize;
           const ${table_name} = app.model.define('map_${entity}_${entity_type}_${code}', 
           ${new_field}},{
            timestamps: false,
            freezeTableName: true,
          }
           );
    
           ${table_name}.sync({alter:true})
           return ${table_name};  
         }`;
				fs.writeFileSync(file, data)
				break;
			case 'list-entity':
				const list_entity = {
					entity: entity_type,
					values: '',
					default: '',
				}
				properties['list-entity'] = []
				properties['list-entity'].push(list_entity);
				break;
			case 'list':
				const list = {
					entity,
					values: select_list,
					default: '',
				}
				properties['list'] = []
				properties['list'].push(list);
				break;
			default:
				break;
		}

		return properties;
	}

	//  """创建字段"""
	async sql_create_field(entity, column, type) {
		const query = `ALTER TABLE "${entity}" ADD COLUMN ${column} ${type}`;
		const res = await this.app.model.query(query, { type: 'SELECT' });
		return res;
	}

	// 获取字段
	async getEnertyColumns(entity, params = []) {
		console.log('data_type', params)
		const condition = {
			entity_type: entity,
		};
		if (params.data_type) {
			condition.data_type = params.data_type
		}
		if (params.is_display) {
			condition.is_display = params.is_display
		}
		if (params.is_add) {
			condition.is_add = params.is_add
		}
		console.log(1111111111, this.ctx.model.EntityColumns)
		const res = this.ctx.model.EntityColumns.findAndCountAll({
			where: condition,
			order: [
				['created_at', 'ASC']
			]
		})

		return res;
	}


	// 增加 column 字段数据
	async create(params) {
		const res = this.ctx.model.EntityColumns.create(params);

		return res;
	}

	// 获取model 的配置信息
	async getModelInfo(params) {
		const { ctx } = this;
		const condition = {

		}
		if (params.model) {
			condition.model = params.model;
		}
		const res = await ctx.model.Model.findOne({
			where: condition,
			raw: true,
		})

		return res;
	}

	// 保持model 得配置信息
	async update(uuid, params) {
		const { ctx } = this;
		const res = ctx.model.Model.update(params, {
			where: {
				uuid
			}
		});

		return res;
	}

	// 获取自定义表单字段
	async getCustomForm(entity, model = 'resource') {
		const { ctx } = this;
		const params = {
			is_add: 'true',
		}
		const res_fields = await ctx.service.entity.getEnertyColumns(entity, params);
		//console.log('res_fields', res_fields)

		// 获取登陆者的page setting
		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;   
		const page = await ctx.service.page.getInfoByUser(uid, model);
    console.log('page', page);
		let page_settings = [];
		let fields = '';
    let quchu = '';
		if (page) {
			page_settings = JSON.parse(page.settings);
			const settings = JSON.parse(page_settings.settings);
			const arr = [];
			const resourceAreaKeys = JSON.parse(page_settings.keys);
			const keys_arr = resourceAreaKeys.join();
			console.log('fields 整理前得', settings)
			const new_fields = [];
			settings.map(item => {
				if (keys_arr.includes(item.key)) {
					new_fields.push(item);
				}
			})


			fields = new_fields.map(item => {
				return item.key
			}).join();
		} else {
      const res = await ctx.service.bd.shot.resource_fields('is_add');
      const keys = [];
      res.map(item => {
        keys.push(item.key);
      })
      fields = keys.join();
    }
    console.log('fields', fields)
		const list = [];
    const list_filter = [];
		res_fields.rows.map(item => {
			let select = [];
			if (item.data_type === 'list') {
				const properties = JSON.parse(item.properties);
				select = properties.list[0].values;
			}

			if (fields !== '' && !fields.includes(item.uuid)) {
				const arr = {
					code: item.code,
					name: item.name,
					select,
					type: item.data_type,
				}
				list_filter.push(arr);
			} else {
      
          const arr = {
            code: item.code,
            name: item.name,
            select,
            type: item.data_type,
          }
          list.push(arr);
        
      }

		})
		return list_filter.length > 0 ? list_filter : list;
		
	}

	// get field info
	async getInfo(uuid) {
		const { ctx } = this;

		const res = ctx.model.EntityColumns.findOne({
			where: {
				uuid,
			},
			raw: true,
		})

		return res;
	}

	// update field info
	async editUp(uuid, params) {
		const { ctx } = this;
		const res = await ctx.model.EntityColumns.update(params,
			{
				where: {
					uuid,
				}
			}
		)

		return res;

	}

}

module.exports = EntityService;