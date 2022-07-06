const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class ResourceController extends Controller {

	// 获取排期详情
	async index() {
		const { ctx } = this;
		const params = ctx.request.query;
		const { limit, offect, schedule_uuid, resource_group_id = 'group_project', link_name, publish } = params;
		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
		
    if( publish && publish * 1  === 1) {
      // page表获取数据
      const page = await ctx.service.page.getInfoByUser(uid, 'bd');
      let page_settings = [];
      if(page) {
        page_settings = JSON.parse(page.settings);
      }
      // resourceGroupField
      const resourceGroupField = '';
      // resourceFieldList
      let fields = [];
      let resourceAreaKeys = [];
      let resourceAreaData = [];
      if (page) {
        const arr = [];
        resourceAreaKeys = JSON.parse(page_settings.keys);
        const keys_arr = resourceAreaKeys.join();

        const settings = JSON.parse(page_settings.settings);
        //console.log('fields 整理前得', settings, keys_arr)
        settings.map(item => {
          if (!keys_arr.includes(item.key)) {
            arr.push(item);
          }
        })
        fields = arr;
        //console.log('fields 整理前得 11111111111111')
        resourceAreaData = settings;
      } else {
        console.log('fields 整理前得 22222222222')
        fields = await ctx.service.bd.shot.resource_fields();
        fields.map(item => {
          resourceAreaData.push(item);
        })
        const res = await ctx.service.bd.shot.resource_fields('is_add');
        const keys = [];
        res.map(item => {
          resourceAreaData.push(item);
          keys.push(item.key);
        })
        resourceAreaKeys = keys;
      }
      //console.log('fields 整理后得 99', resourceAreaData)
      //console.log('fields 整理后得', fields)

      fields.map(item => {
        item.headerClassNames = ["resource_header_name"];
        item.cellClassNames = ["resource_content_name"];
        return item;
      })
      fields.unshift({
        "title": "项目",
        "description": "项目",
        "key": "project_key",
        "field": "project_name",
        "headerContent": "项目",
        "width": "100px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      })

      const resourceAreaColumns = fields;
      const entity = 'shots';
      const properties = await ctx.service.pgsql.costomField(entity);
      // 获取已发布得项目列表
      const project_list = await ctx.service.bd.schedulebd.getPublishProjects(params);
      // 获取自定义字段
      const customFormField = await ctx.service.entity.getCustomForm(entity, 'bd');
      const customField_type = {}
      const customField = customFormField.map(item => {
        //resource_arr[item.code] = params[item.code];
        customField_type[item.code] = item.type;
        return item.code;
        
      })
      // 获取shots
      const events = [];
      const resources_count = [];
      const link_list_filter = [];
      const allow_resources = [];
      const project_tree_list = []
      let order = 1;
      for( const item_project of project_list) {
        params.schedule_uuid = item_project.uuid;
        const project_tree = {
          ids: item_project.uuid,
          project_name: item_project.project_name,
          category_name: '',
          link_name: '',
          member_name: '',
          description: '',
          duration: 0,
          parent_id: 0,
          init_id: 0,
          shot_name: '',
          link_color: '',
          children: [],
          resourceorder: order,
        }
        order++;
        // resources
        const fieldss = [];
        params.from = '';
        const resource = await ctx.service.bd.shot.getShots(fieldss, params, limit, offect, properties.includes);
        const resources = [];
        
        resources_count.push(item_project.uuid);
        resource.rows.map(item => {
          //职级对应
          switch (item.level_arter) {
            case '低级':
              item.level_arter = 1;
              break;
            case '中级':
              item.level_arter = 2;
              break;
            case '高级':
              item.level_arter = 3;
              break;
            default:
              break;
          }
          //获取
          let duration = 0;
          item.events_bds.map(item_event => {
            duration += item_event.duration * 1;
            const arr = {
              id: item_event.uuid,
              resourceId: item.uuid,
              title_oldvalue: item_event.title_oldvalue,
              start: ctx.helper.formatTime(item_event.start_at),
              end: ctx.helper.formatTime(item_event.end_at),
              department_name: item.department_name,
              editable: false,
              progress: item_event.progress ? item_event.progress * 1 : 100,
              title: item_event.content,
              color: item_event.color,
              from: item_event.from,
              people_num: item_event.people_num,
            }
            events.push(arr);
          }
          )
          const items = {
            id: item.uuid,
            project_name: item_project.project_name,
            category_name: item.category_name,
            link_name: item.link_name || '',
            member_name: item.member_name,
            description: item.description || '',
            duration: duration.toString(),
            parent_id: item.parent_id,
            init_id: item.id,
            shot_name: item.shot_name === '-' ? '' : item.shot_name,
            link_color: item.link_color,
          }
          customField.map(it => {
            items[it] = item[it] || '';
            project_tree[it] = item[it] || '';
            if(customField_type[it] === 'date_time') {
              items[it] = item[it] ? ctx.helper.formatTime(item[it]) : '';
            }
          })
          
          resources.push(items);

          // 对link_name 处理
          if(link_name && link_name === item.link_name ) {
            link_list_filter.push(item.parent_id);
          }

          return item;
        })
        
        const link_list_filter_arr = link_list_filter.join();
        console.log(link_list_filter_arr);
        const resources_filter = [];
        resources.map( item => {
          if(link_list_filter_arr.includes(item.init_id) || link_list_filter_arr.includes(item.parent_id)) {
            resources_filter.push(item);
          }
        })
        // tree
        const tree_resource_yuan = resources_filter.length > 0 ? resources_filter : resources;
        let tree_resource = [];
        if(resources.length > 0) {
          
          tree_resource = await ctx.service.menu.recursionDataTree(tree_resource_yuan, 0, 'init_');
        } 
        //ctx.helper.success(ctx, 1, '发布成功', project_tree);return;

        let sort_resource = tree_resource;
        if(params.sorts === 'duration' || params.sorts === 'shot_num' || params.sorts === 'level_arter') {
          sort_resource = ctx.helper.listSortBy(tree_resource, params.sorts, params.order);
        }

       
        tree_resource.map( item => {
          //职级对应
          switch (item.level_arter) {
            case 1:
              item.level_arter = '低级';
              break;
            case 2:
              item.level_arter = '中级';
              break;
            case 3:
              item.level_arter = '高级';
              break;
            default:
              break;
          }
        
          
        })
        
        project_tree.children = sort_resource;
        project_tree_list.push(project_tree)
        //ctx.helper.success(ctx, 1, '成功', project_tree);return; 
      }
      //ctx.helper.success(ctx, 1, '成功', project_tree_list);return; 
      // 对event 按照颜色分组
      let map = [];
      map['#3BB2E3'] = { color: '#3BB2E3', className: ['editNew-Event'], events: [] };  
      events.map( item => {
        const { color } = item;
        if (!map[color]) {
          map[color] = {
            color: item.color,
            events: [],
            className: ['editNew-Event'],
          }
          if(item.from === 'shotgun') {
            console.log(2222222222, item.from)
            map[color].className = ["shotGun-event"];
          }
        }
        map[color].events.push(item);

      })
      const new_event = Object.values(map);
      const results = {
        
        resourceGroupField,
        resourceAreaColumns,
        resourceAreaKeys,
        resourceAreaData,
        resourcesInitiallyExpanded: '',
        resources: project_tree_list,
        allow_resources,
        eventColor: '#3BB2E3',
        eventSources: new_event,
        total: resources_count.length,
        role: {
          resources_role: [],
          events_role: [],
        },
        project:'',
      }

      ctx.helper.success(ctx, 1, '成功', results); return;
    }
    let resource_child_group_id = '';
		let group_id = '';
		switch (resource_group_id) {
			case 'group_project':
				group_id = 'project_name';
				resource_child_group_id = 'department_name';
				break;
			case 'group_department':
				group_id = 'department_name';
				resource_child_group_id = 'project_name';
				break;
			case 'group_member':
				group_id = 'member_name';
				break;
			default:
				break;
		}

		// resources
		const entity = 'shots';
		const properties = await ctx.service.pgsql.costomField(entity);
		const fieldss = [];
    params.parent_ids = [0];
		const resource = await ctx.service.bd.shot.getShots(fieldss, params, limit, offect, properties.includes);
    const params_parent_uuids = resource.rows.map( item => {
      return item.id;
    })
    console.log('uuuids', params_parent_uuids);
    //params.from = 'shotgun';
    params.parent_ids = params_parent_uuids;
		const resource_shotgun = await ctx.service.bd.shot.getShots(fieldss, params, 10000, 1, properties.includes);
    resource_shotgun.rows.map( item=>{
      resource.rows.push(item);
      return item;
    })
		
		// 获取自定义字段
		const customFormField = await ctx.service.entity.getCustomForm(entity, 'bd');
    const customField_type = {}
		const customField = customFormField.map(item => {
			//resource_arr[item.code] = params[item.code];
			customField_type[item.code] = item.type;
      return item.code;
      
		})
    //console.log('customField_type', customField_type);return;
		// role
		const department_uuid = '8d8c507b-9ad9-11ec-a44e-0cc47a49e143';
		const events = [];
		const resources = [];
		const resources_role = [];
		const events_role = [];
    const link_list_filter = [];
    const allow_resources = [];
    let shot_nums = 0
		resource.rows.map(item => {
      //职级对应
      switch (item.level_arter) {
        case '低级':
          item.level_arter = 1;
          break;
        case '中级':
          item.level_arter = 2;
          break;
        case '高级':
          item.level_arter = 3;
          break;
        default:
          break;
      }
      
			// role 
			if (item.uuid !== '1bf90b94-61ca-49f5-abd8-9f4d122ad949' && item.from !== 'shotgun') {
				resources_role.push(item.uuid)
			}
      
			if(item.parent_id * 1 === 0) {
        shot_nums += item.shot_num * 1;
      }
			let duration = 0;
			item.events_bds.map(item_event => {
				duration += item_event.duration * 1;
				const arr = {
					id: item_event.uuid,
					resourceId: item.uuid,
					title_oldvalue: item_event.title_oldvalue,
					start: ctx.helper.formatTime(item_event.start_at),
					end: ctx.helper.formatTime(item_event.end_at),
					department_name: item.department_name,
					editable: item_event.from !== 'shotgun' ? true : false,
					progress: item_event.progress ? item_event.progress * 1 : 100,
					title: item_event.content,
          color: item_event.color,
          from: item_event.from,
          people_num: item_event.people_num,
				}
        if (item_event.uuid !== 'a21ffd9a-d516-4972-a2d3-a6a52f9c619a'  && item_event.from !== 'shotgun' ) {
					events_role.push(item_event.uuid);
				}
        
				// if(item.department_uuid !== department_uuid) {
				//   arr.editable = false;
				// }
        // if(item_event.from === 'shotgun') {
        //   arr.eventColor = '#db591b'
        // }
				events.push(arr);
			}
			)
			const items = {
				id: item.uuid,
				category_name: item.category_name,
				link_name: item.link_name || '',
				member_name: item.member_name,
				description: item.description || '',
				duration: duration.toString(),
				parent_id: item.parent_id,
				init_id: item.id,
        shot_name: item.shot_name === '-' ? '' : item.shot_name,
        link_color: item.link_color,
        sortCheckbox:item.uuid,
			}
			customField.map(it => {
				items[it] = item[it];
        if(customField_type[it] === 'date_time') {
          items[it] = item[it] ? ctx.helper.formatTime(item[it]) : '';
        }
			})
			items[resource_group_id] = item[group_id];
			resources.push(items);

      // 对link_name 处理
      if(link_name && link_name === item.link_name ) {
        link_list_filter.push(item.parent_id);
      }

			return item;
		})
    const link_list_filter_arr = link_list_filter.join();
    console.log(link_list_filter_arr);
    const resources_filter = [];
    resources.map( item => {
      if(link_list_filter_arr.includes(item.init_id) || link_list_filter_arr.includes(item.parent_id)) {
        resources_filter.push(item);
      }
    })
    // console.log('resource', resources_filter);
    // ctx.helper.success(ctx, 1, '成功', resources_filter)
    // return;
		// tree
		const tree_resource_yuan = resources_filter.length > 0 ? resources_filter : resources;
		let tree_resource = [];
    if(resources.length > 0) {
      
		  tree_resource = await ctx.service.menu.recursionDataTree(tree_resource_yuan, 0, 'init_');
    }
    let sort_resource = tree_resource;
    if(params.sorts === 'duration' || params.sorts === 'shot_num' || params.sorts === 'level_arter') {
      sort_resource = ctx.helper.listSortBy(tree_resource, params.sorts, params.order);
    }

    let resourceorder = 1;
    sort_resource.map( item => {
      //职级对应
      switch (item.level_arter) {
        case 1:
          item.level_arter = '低级';
          break;
        case 2:
          item.level_arter = '中级';
          break;
        case 3:
          item.level_arter = '高级';
          break;
        default:
          break;
      }
      item.resourceorder = resourceorder;
      resourceorder++;
    })
		// 对events
		const all_days = []
		events.map(item => {
			const arr = ctx.helper.getAllDays(item.start, item.end);
			//console.log('arr', arr);
			arr.map(item => {
				all_days.push(item)
			})

		})
		
		const day_summary = all_days.reduce(function (prev, next) {
			prev[next] = (prev[next] + 1) || 1;
			return prev;
		}, {});

    // page表获取数据
		const page = await ctx.service.page.getInfoByUser(uid, 'bd');
		let page_settings = [];
		if(page) {
			page_settings = JSON.parse(page.settings);
		}
		// resourceGroupField
		const resourceGroupField = '';
		// resourceFieldList
		let fields = [];
		let resourceAreaKeys = [];
		let resourceAreaData = [];
		if (page) {
			const arr = [];
			resourceAreaKeys = JSON.parse(page_settings.keys);
			const keys_arr = resourceAreaKeys.join();

			const settings = JSON.parse(page_settings.settings);
			console.log('fields 整理前得', settings, keys_arr)
			settings.map(item => {
				if (!keys_arr.includes(item.key)) {
					arr.push(item);
				}
			})
			fields = arr;
      console.log('fields 整理前得 11111111111111')
			resourceAreaData = settings;
		} else {
      console.log('fields 整理前得 22222222222')
			fields = await ctx.service.bd.shot.resource_fields();
      fields.map(item => {
        resourceAreaData.push(item);
      })
			const res = await ctx.service.bd.shot.resource_fields('is_add');
      const keys = [];
      res.map(item => {
        resourceAreaData.push(item);
        keys.push(item.key);
      })
      resourceAreaKeys = keys;
		}
    console.log('fields 整理后得 99', resourceAreaData)
		console.log('fields 整理后得', fields)

		let first_field = {}
		let i = 1;
		fields.map(item => {
			item.headerClassNames = ["resource_header_name"];
			item.cellClassNames = ["resource_content_name"];
			if (item.field === group_id) {
				first_field = item;
			}

      if(item.field === 'shot_num') {
        item.headerContent = {
          html: `<div style='display:flex; flex-direction:column'><div style='position:relative;top:16px'>镜头数量</div><div style='position:relative;top:12px;line-height:32px; font-size:12px; font-weight:normal'>总计:${shot_nums}</div></div>`,
        }
      }

			//item.key = i;
			i++;
			return item;
		})
		console.log('fields', first_field);
		let new_fields = fields
    // 调整顺序
		// if (first_field.length > 0) {
		// 	new_fields = Object.values(Array.from(new Set([...[first_field], ...fields])));
		// }

    // fields.unshift({
    //   "title": "选择",
    //   "description": "选择",
    //   "key": "sortCheckBox_key",
    //   // "field": "sortCheckBox",
    //   "headerContent": "选择",
    //   "width": "100px",
    //   "disabled": false,
    //   "headerClassNames": [
    //     "resource_header_name"
    //   ],
    //   "cellClassNames": [
    //     "resource_content_name"
    //   ],
    //   cellContent: { html: '<input type="checkbox" />' }
    // })

		const resourceAreaColumns = fields;


    // 获取项目
    const schedule = await ctx.service.bd.schedulebd.getInfo(params.schedule_uuid);

    // 对event 按照颜色分组
    let map = [];
    map['#3BB2E3'] = { color: '#3BB2E3', className: ['editNew-Event'], events: [] };
    events.map( item => {
      const { color } = item;
      if (!map[color]) {
        map[color] = {
          color: item.color,
          events: [],
          className: ['editNew-Event'],
        }
        if(item.from === 'shotgun') {
          console.log(2222222222, item.from)
          map[color].className = ["shotGun-event"];
        }
      }
      map[color].events.push(item);

    })
    const new_event = Object.values(map);
    

    //ctx.helper.success(ctx, 1, '成功', sort_resource);return
		const results = {
			//views,
			//aa: resource.rows,shot_num
			resourceGroupField,
			resourceAreaColumns,
			resourceAreaKeys,
			resourceAreaData,
			resourcesInitiallyExpanded: '',
			resources: sort_resource,
      allow_resources,
			eventColor: '#3BB2E3',
			eventSources: new_event,
			total: resource.count,
			//holiday,
			day_summary,
			role: {
				resources_role,
				events_role,
			},
      project: schedule.project_name,
		}
		// events
		ctx.helper.success(ctx, 1, '成功', results)
	}

	// 添加资源
	async create() {
		const { ctx, app } = this;
		const { validator } = app;
		const params = ctx.request.body;
		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;

		const {
			category_name,
			//department_name,
			member_name,
			member_uuid,
			schedule_uuid,
			link_uuid,
			link_name,
			resources_uuid,
		} = params
    const schedule_bd_uuid = schedule_uuid;
		// 数据校验
		// const res = validator.validate({userName: 'userName'}, ctx.request.body);

		// 获取自定义字段
		const entitys = 'shots';
		const customFormField = await ctx.service.entity.getCustomForm(entitys, 'bd');
		console.log('customFormField', customFormField);
		// 获取 分类的id
		const params_shot = {
			category_name,
			parent_id: 0,
      schedule_uuid
		}
		const params_shot_info = await ctx.service.bd.shot.getInfoByParams(params_shot);

		if (resources_uuid) {

      // 获取setp 信息
      const step_list = await ctx.service.bd.shotgun.getStepList();
      const setps = {}
      step_list.map( item => {
        setps[item.value] = item.color;
      })

			const resource_arr = {
				category_name,
				//member_name,
				//member_uuid,
				edit_user_uuid: uid,
				//link_uuid,
				//link_name,
				updated_at: ctx.helper.getTime(),
				//parent_id: params_shot_info.parent_id === 0 ? 0 : params_shot_info.id,
        //link_color: link_name ? setps[link_name] : '',
			}
			const customField = customFormField.map(item => {
				if (item.type === 'list') {
					const select = item.select.join();
					if (!select.includes(params[item.code])) {
						ctx.helper.success(ctx, -1, '非法参数！')
						return
					}
				}
				if(params[item.code]) {
          resource_arr[item.code] = params[item.code];
        }
				return item.code;
			})
			//console.log(11111111, resource_arr);return;
			try {
				const arr_info = await ctx.service.bd.shot.getInfo(resources_uuid);
				console.log('controller resource update arr_info', arr_info);
				if (!arr_info) {
					ctx.helper.success(ctx, -1, '非法参数！')
					return
				}
				// 更新数据
				await ctx.service.bd.shot.update(resources_uuid, resource_arr);
        const update_arr = {
          category_name,
        }
        // 更新数据
        await ctx.service.bd.shot.updateByParentid(arr_info.id, update_arr);
        

			} catch (error) {
				console.log('controller resource update getInfo error', error);
				ctx.helper.success(ctx, -1, '非法参数！')
			}
			console.log('controller resource update end 成功');
			ctx.helper.success(ctx, 1, '成功')
		} else {
			

			// bd.shots 插入数据
      let parent_id = '';
      if(!params_shot_info) {
        const shot_arr = {
          category_name,
          schedule_bd_uuid,
          member_name,
          member_uuid,
          created_user_uuid: uid,
          link_uuid: 0,
          link_name: '',
          parent_id: 0,
        }
        const customField = customFormField.map(item => {
          //shot_arr[item.code] = params[item.code];
          if(params[item.code]) {
            shot_arr[item.code] = params[item.code];
          }
          return item.code;
        })
        const res_arr = await ctx.service.bd.shot.create(shot_arr);
        parent_id = res_arr.id;
      } else {
        parent_id = params_shot_info.id;
      }

      // 获取setp 信息
      const step_list = await ctx.service.bd.shotgun.getStepList();
      const setps = {}
      step_list.map( item => {
        setps[item.value] = item.color;
      })
      
      if(link_name) {
        for( const item of link_name) {
          const shot_arr = {
            category_name,
            schedule_bd_uuid,
            member_name,
            member_uuid,
            created_user_uuid: uid,
            link_uuid,
            link_name: item,
            parent_id,
            link_color: setps[item],
          }
          
          
          const customField = customFormField.map(item => {
            shot_arr[item.code] = params[item.code];
            return item.code;
          })
          console.log('customField', customField)
          console.log('shot_arr', shot_arr)
    
          const res_shot_arr = await ctx.service.bd.shot.create(shot_arr);
    
          // 查询所有字段，是否需要 insert map
          // const fields =  await ctx.service.pgsql.getMap();
          //获取表的字段
          const entity = 'shots';
          const res_fields = await ctx.service.entity.getEnertyColumns(entity);
          for (const item of res_fields.rows) {
            if (item.data_type === 'reverse-multi-entity') {
              const properties = JSON.parse(item.properties);
              const arr = properties['reverse-multi-entity'];
              console.log('arr', arr)
              const map = {};
              map[arr.entity + '_uuid'] = schedule_bd_uuid;
              map[entity + '_uuid'] = res_shot_arr.dataValues.uuid;
              console.log('map', map)
              const model_table_1 = app.model.models[arr.map_entity];
              console.log('model_table_1', model_table_1)
              // map表插入数据
              await model_table_1.create(map);
    
            }
          }
        }
      }
      

      
			ctx.helper.success(ctx, 1, '成功')
		}



	}

	// 更新资源数据
	async update() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.body;
		const put_params = ctx.params;
		console.log('controller resource update params', params);
		console.log('controller resource update put_params', put_params)
		const uuid = put_params.id;
		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
		// 数据校验
		// const res = validator.validate({userName: 'userName'}, ctx.request.body);
		// console.log('res11111111', res)

		if (params.department_name) {
			const params_department = {
				name: params.department_name
			}
			const department_info = await ctx.service.core.getDepartmentByParams(params_department);
			console.log('department_info', department_info)
			params.department_uuid = department_info.uuid;
			console.log('controller resource update  department_name params', params);
		}

		// // 获取自定义字段
		// const entitys = 'resources';
		// const customFormField = await ctx.service.entity.getCustomForm(entitys);

		// const customField = customFormField.map( item => {
		//   resource_arr[item.code] = params[item.code];
		//   return item.code; 
		// })
		// console.log('customField', customField)
		// console.log('resource_arr', resource_arr)

		params.edit_user_uuid = uid;
		params.updated_at = await ctx.helper.getTime();
		try {
			const arr_info = await ctx.service.resource.getInfo(uuid);
			console.log('controller resource update arr_info', arr_info);
			if (!arr_info) {
				ctx.helper.success(ctx, -1, '非法参数！')
				return
			}
			// 更新数据
			await ctx.service.resource.update(uuid, params);

			//更新操作日志表
			const log = {
				resource_uuid: uuid,
				created_user_uuid: uid,
				request_content: JSON.stringify(params),
			}
			ctx.service.log.create_resource(log);

		} catch (error) {
			console.log('controller resource update getInfo error', error);
			ctx.helper.success(ctx, -1, '非法参数！')
		}
		console.log('controller resource update end 成功');
		ctx.helper.success(ctx, 1, '成功')
	}

	// 删除资源数据
	async destroy() {
		const { ctx, app } = this;
		let { validator } = app;

		const put_params = ctx.params;
		console.log('controller resource destroy put_params', put_params)
		const uuid = put_params.id;
		const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
		// 数据校验
		// const res = validator.validate({userName: 'userName'}, ctx.request.body);
		// console.log('res11111111', res)

		try {
			const arr_info = await ctx.service.bd.shot.getInfo(uuid);
			console.log('controller resource destroy arr_info', arr_info);
			if (!arr_info) {
				ctx.helper.success(ctx, -1, '非法参数！')
				return
			}
      
 			// 更新数据
			const update_time = ctx.helper.getTime();
			const status = 3;

			const update_arr = {
				retirement_at: update_time,
				retirement_status: status
			}

			await ctx.service.bd.shot.update(uuid, update_arr);

      if(arr_info.parent_id * 1 === 0) {
        await ctx.service.bd.shot.updateByParentid(arr_info.id, update_arr);
      }

		} catch (error) {
			console.log('controller resource destroy getInfo error', error);
			ctx.helper.success(ctx, -1, '非法参数！')
		}
		console.log('controller resource destroy end 成功');
		ctx.helper.success(ctx, 1, '成功')
	}

  // 批量删除资源数据
	async batch_del() {
		const { ctx, app } = this;
		let { validator } = app;

		const put_params = ctx.request.body;
		const uuids = put_params.uuids;
		// 数据校验
		// const res = validator.validate({userName: 'userName'}, ctx.request.body);
		// console.log('res11111111', res)

		try {
      const params = {
        uuids,
      }
			const arr_info = await ctx.service.bd.shot.getInfoByParams(params, 'list');
			console.log('controller resource destroy arr_info', arr_info);
			if (arr_info.count !== uuids.length) {
				ctx.helper.success(ctx, -1, '非法参数！')
				return
			}
      
 			// 更新数据
			const update_time = ctx.helper.getTime();
			const status = 3;

			const update_arr = {
				retirement_at: update_time,
				retirement_status: status
			}

			await ctx.service.bd.shot.updateByUuids(uuids, update_arr);
      for(const item of arr_info.rows) {
        if(item.parent_id * 1 === 0) {
          await ctx.service.bd.shot.updateByParentid(item.id, update_arr);
        }
      }
      

		} catch (error) {
			console.log('controller resource destroy getInfo error', error);
			ctx.helper.success(ctx, -1, '非法参数！')
		}
		console.log('controller resource destroy end 成功');
		ctx.helper.success(ctx, 1, '成功')
	}

	// 筛选列表
	async options() {
		const { ctx } = this;

		const params = ctx.request.body;

    //
    const stepList = await ctx.service.bd.shotgun.getStepList();
    const publish_projects = await ctx.service.bd.schedulebd.getPublishProjects();
    
		const list = await ctx.service.bd.shot.getScheduleOptions();
		//  
		const category = [];
		let i = 1;
		list.rows.map(item => {
			const item_category = {
				id: i,
				value: item.category_name,
				text: item.category_name,
			}
			if (item.category_name) {
				category.push(item_category);
			}

			i++;

		})
    const project = [];
    publish_projects.map( item => {
      project.push({
        id: i*1000,
				value: item.project_name,
				text: item.project_name,
      })
      i++;
      return item.project_name;
    })
		const category_buchong = ctx.helper.unique(category, 'value').map(item => {
			return item
		});
		const res = {
			category: category_buchong,
			category_name: category_buchong.map(item => {
				return item.value;
			}),
      step: this.ctx.helper.unique(stepList,'label').map( item=> {
        return item
      }),
      project_name: project
		}

		ctx.helper.success(ctx, 1, '成功', res)
	}

	// 获取部门下的所有人员
	async getDepartmentUsers() {
		const { ctx } = this;
		const { department_uuid } = ctx.request.query
		const res = await ctx.service.core.getDepartmentUsers(department_uuid);

		ctx.helper.success(ctx, 1, '成功', res)

	}

  // 获取默认的环节列表
  async getdefaultlink() {
    const { ctx } = this;
    const stepList = await ctx.service.bd.shotgun.getStepList('group');
    
    const list = 
    {
      Shot: [
        "Layout",
        "Animation",
        "Effects",
        "Compositing",
        "Lighting",
        "Mattpainting",
        "Setup",
      ],
      Asset: [
        
      ]
    }

    const res = {
      default: list,
      list: stepList
    }

    ctx.helper.success(ctx, 1, '成功', res)
  }

  // 发布
  async publish() {
    const { ctx } = this;

    const params = ctx.request.query;

    const res = await ctx.service.bd.shot.publish(params);

    if( res === false ) {
      ctx.helper.success(ctx, -1, '发布失败') 
    } else {
      ctx.helper.success(ctx, 1, '发布成功') 
    }
  }

  // 获取已发布得项目
  async getShotgunIndex() {
    const { ctx } = this;

    const params = ctx.request.query;
    const { limit, offect, link_name } = params;
    const user = ctx.session.user;
    const uid = user.uuid;

    // page表获取数据
    const page = await ctx.service.page.getInfoByUser(uid, 'bd');
    let page_settings = [];
    if(page) {
      page_settings = JSON.parse(page.settings);
    }
    // resourceGroupField
    const resourceGroupField = '';
    // resourceFieldList
    let fields = [];
    let resourceAreaKeys = [];
    let resourceAreaData = [];
    if (page) {
      const arr = [];
      resourceAreaKeys = JSON.parse(page_settings.keys);
      const keys_arr = resourceAreaKeys.join();

      const settings = JSON.parse(page_settings.settings);
      //console.log('fields 整理前得', settings, keys_arr)
      settings.map(item => {
        if (!keys_arr.includes(item.key)) {
          arr.push(item);
        }
      })
      fields = arr;
      //console.log('fields 整理前得 11111111111111')
      resourceAreaData = settings;
    } else {
      console.log('fields 整理前得 22222222222')
      fields = await ctx.service.bd.shot.resource_fields();
      fields.map(item => {
        resourceAreaData.push(item);
      })
      const res = await ctx.service.bd.shot.resource_fields('is_add');
      const keys = [];
      res.map(item => {
        resourceAreaData.push(item);
        keys.push(item.key);
      })
      resourceAreaKeys = keys;
    }
    //console.log('fields 整理后得 99', resourceAreaData)
    //console.log('fields 整理后得', fields)

    fields.map(item => {
      item.headerClassNames = ["resource_header_name"];
      item.cellClassNames = ["resource_content_name"];
      return item;
    })
    fields.unshift({
      "title": "项目",
      "description": "项目",
      "key": "project_key",
      "field": "project",
      "headerContent": "项目",
      "width": "100px",
      "disabled": false,
      "headerClassNames": [
        "resource_header_name"
      ],
      "cellClassNames": [
        "resource_content_name"
      ]
    })

    const resourceAreaColumns = fields;
    const entity = 'shots';
    const properties = await ctx.service.pgsql.costomField(entity);
    // 获取已发布得项目列表
    const project_list = await ctx.service.bd.schedulebd.getPublishProjects();
    // 获取自定义字段
    const customFormField = await ctx.service.entity.getCustomForm(entity, 'bd');
    const customField = customFormField.map(item => {
      //resource_arr[item.code] = params[item.code];
      return item.code;
    })
    // 获取shots
    const events = [];
    const resources = [];
    const link_list_filter = [];
    const allow_resources = [];
    const project_tree_list = []
    for( const item_project of project_list) {
      params.schedule_uuid = item_project.uuid;
      const project_tree = {
        ids: item_project.uuid,
        project_name: item_project.project_name,
        category_name: '',
        link_name: '',
        member_name: '',
        description: '',
        duration: 0,
        parent_id: 0,
        init_id: 0,
        shot_name: '',
        link_color: '',
        children: [],
      }
      // resources
      const fieldss = [];
      params.from = '';
      const resource = await ctx.service.bd.shot.getShots(fieldss, params, limit, offect, properties.includes);
      
      resource.rows.map(item => {
        //获取
        let duration = 0;
        item.events_bds.map(item_event => {
          duration += item_event.duration * 1;
          const arr = {
            id: item_event.uuid,
            resourceId: item.uuid,
            title_oldvalue: item_event.title_oldvalue,
            start: ctx.helper.formatTime(item_event.start_at),
            end: ctx.helper.formatTime(item_event.end_at),
            department_name: item.department_name,
            editable: false,
            progress: item_event.progress ? item_event.progress * 1 : 100,
            title: item_event.content,
            color: item_event.color,
            from: item_event.from,
            people_num: item_event.people_num,
          }
          events.push(arr);
        }
        )
        const items = {
          id: item.uuid,
          category_name: item.category_name,
          link_name: item.link_name || '',
          member_name: item.member_name,
          description: item.description || '',
          duration: duration.toString(),
          parent_id: item.parent_id,
          init_id: item.id,
          shot_name: item.shot_name === '-' ? '' : item.shot_name,
          link_color: item.link_color,
        }
        customField.map(it => {
          items[it] = item[it] || '';
          project_tree[it] = item[it] || '';
        })
        
        resources.push(items);

        // 对link_name 处理
        if(link_name && link_name === item.link_name ) {
          link_list_filter.push(item.parent_id);
        }

        return item;
      })
      
      const link_list_filter_arr = link_list_filter.join();
      console.log(link_list_filter_arr);
      const resources_filter = [];
      resources.map( item => {
        if(link_list_filter_arr.includes(item.init_id) || link_list_filter_arr.includes(item.parent_id)) {
          resources_filter.push(item);
        }
      })
      // tree
      const tree_resource_yuan = resources_filter.length > 0 ? resources_filter : resources;
      let tree_resource = [];
      if(resources.length > 0) {
        
        tree_resource = await ctx.service.menu.recursionDataTree(tree_resource_yuan, tree_resource_yuan[0].parent_id, 'init_');
      } 
      //ctx.helper.success(ctx, 1, '发布成功', project_tree);return;
      console.log(tree_resource);
      project_tree.children = tree_resource;
      project_tree_list.push(project_tree)
      //ctx.helper.success(ctx, 1, '发布成功', project_tree);return; 
    }

    // 对event 按照颜色分组
    let map = [];
    map['#3BB2E3'] = { color: '#3BB2E3', className: ['editNew-Event'], events: [] };  
    events.map( item => {
      const { color } = item;
      if (!map[color]) {
        map[color] = {
          color: item.color,
          events: [],
          className: ['editNew-Event'],
        }
        if(item.from === 'shotgun') {
          console.log(2222222222, item.from)
          map[color].className = ["shotGun-event"];
        }
      }
      map[color].events.push(item);

    })
    const new_event = Object.values(map);
    const results = {
      
      resourceGroupField,
      resourceAreaColumns,
      resourceAreaKeys,
      resourceAreaData,
      resourcesInitiallyExpanded: '',
      resources: project_tree_list,
      allow_resources,
      eventColor: '#3BB2E3',
      eventSources: new_event,
      total: resources.length,
      role: {
        resources_role: [],
        events_role: [],
      },
      project:'',
    }

    ctx.helper.success(ctx, 1, '成功', results);
  }

}

module.exports = ResourceController;