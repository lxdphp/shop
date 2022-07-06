const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class ShotgunController extends Controller {
	async index() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.body;
    console.log(22222,ctx.request);
		const { project, schedule_uuid } = params;
		if (!project) {
			this.ctx.helper.success(ctx, 1, '成功'); return;
		}
    console.log(111111111)
		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
		const token_info = await ctx.service.bd.shotgun.getAxcessToken();

		const token = token_info;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/vnd+shotgun.api3_hash+json',
			'Accept': 'application/json',
		}
    let condition = ``;
    if(params.link_name) {
      let link_name = '"' + params.link_name+ '"'
      if(params.link_name.length > 1) {
        link_name = params.link_name.map( item => {
          return '"' + item + '"';
        }) 
      }
      condition = condition + `,
      [
        "step.Step.code",
        "in",
        [${link_name}]
      ]`;
    }
    //console.log(condition);return;
    if(params.task_assignees) {
      const task_assignees = params.task_assignees.map( item => {
        return `{
          "type": "HumanUser",
          "id": ${item},
          "name": "",
          "valid": "valid"
        }`;
      })
      condition = condition + `,
      [
        "task_assignees",
        "in",
        [
          ${task_assignees}
        ]
      ]`;
    }
    //console.log(condition);return;
    if(params.category_name) {
      let category_name = '"' + params.category_name+ '"'
      if(params.category_name.length > 1) {
        category_name = params.category_name.map( item => {
          return '"' + item + '"';
        }) 
      }
      condition = condition + `,
      [
        "entity.Shot.sg_category.CustomEntity26.code",
        "in",
        [${category_name}]
      ]`;
    }
    if(params.shot_name) {
      let shot_name = '"' + params.shot_name+ '"'
      if(params.shot_name.length > 1) {
        shot_name = params.shot_name.map( item => {
          return '"' + item + '"';
        }) 
      }
      condition = condition + `,
      [
        "entity.Shot.code",
        "in",
        [${shot_name}]
      ]`;
    }
    if(params.sequence) {
      const sequence = params.sequence.map( item => {
        return `{
          "type": "Sequence",
          "id": ${item},
          "name": "",
          "valid": "valid"
        }`;
      })
      condition = condition + `,
      [
        "entity.Shot.sg_sequence",
        "in",
        [
          ${sequence}
        ]
      ]`;
    }
  
    let sort = 'entity.Shot.code';
    switch (params.sorts) {
      case 'sequence':
        sort = 'entity.Shot.sg_sequence';
        break;
      case 'category_name':
        sort = 'entity.Shot.sg_category.CustomEntity26.code';
        break;
      case 'task_name':
        sort = 'content';
        break;
      case 'link_name':
        sort = 'step';
        break;
      case 'shot_name':
        sort = 'entity.Shot.code';
        break;
      case 'task_assignees':
        sort = 'task_assignees';
        break; 
      default:
        break;
    }
    const order = params.order && params.order === 'desc' ? '-' : ''; 
    
    const data = `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "project.Project.name",
            "is",
            "${project}"
        
          ],
          [
            "entity",
            "type_is",
            "Shot"
        
          ]
          ${condition}
        ]
      },
      
      "sort": "${order}${sort}",
      "fields": [
        "id",
        "image",
        "entity",
        "step",
        "content",
        "sg_description",
        "entity.Shot.sg_ppm_notes",
        "sg_status_list",
        "sg______tasklevel_",
        "sg_require_artist_level",
        "sg_plan_day",
        "task_assignees",
        "time_logs_sum",
        "sg_planday_suggestion",
        "start_date",
        "due_date",
        "duration",
        "sg_schedule_last_dailies_date",
        "entity.Shot.sg_shot_type",
        "entity.Shot.sg_sequence",
        "project.Project.code",
        "project.Project.name",
        "entity.Shot.sg_category.CustomEntity26.code",
        "entity.Shot.code",
        "entity.Shot.sg_deadline"
      ]
    }`
    console.log(data)
    
    const sort_query = `&sort=${order}${sort}`
    const resList = [];
    const shotgunHost = this.config.shotgunHost;
    const shotgun_list = async  function(number) {
      const page = `?page[size]=1000&page[number]=${number}`
      
      const url_entity_search = `${shotgunHost}/api/v1/entity/Task/_search${page}`;
      console.log('url',  `${shotgunHost}/api/v1/entity/Task/_search${page}${sort_query}`)
      const res2 = await ctx.curl(url_entity_search, {
        dataType: 'json',
        headers,
        method: 'POST',
        data
      });
      const list = res2.data.data;
      //console.log('error', res2.data)
      //console.log(res2.data)
      if(list) {
        list.map( item => {
          resList.push(item);
        })
        if(list.length > 0 && list.length === 1000) {
          number += 1;
          await shotgun_list(number);
        }
      } else {
        
     }
      
    }
		//await shotgun_list(1);


    //this.ctx.helper.success(ctx, 1, '成功', resList);return;

		

    // 
    const step_list = await ctx.service.bd.shotgun.getStepList();
    const setps = {}
    step_list.map( item => {
      setps[item.value] = item.color;
    })

		//分组 
		
    const lingxing = []
    
	
	
		//this.ctx.helper.success(ctx, 1, '成功', new_resource);return;
	
		let resource_child_group_id = '';
		let group_id = '';
		switch (params.resource_group_id) {
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
    const params_page = `?page[size]=${params.size}&page[number]=${params.page}`
    const url_entity_search = `${shotgunHost}/api/v1/entity/Task/_search${params_page}`;
    console.log('url_page',  `${shotgunHost}/api/v1/entity/Task/_search${params_page}`)
    const res2 = await ctx.curl(url_entity_search, {
      dataType: 'json',
      headers,
      method: 'POST',
      data
    });
    const list_page = res2.data.data;
     
    //this.ctx.helper.success(ctx, 1, '成功', list_page);return;
    const resq_page = []
    if(list_page) {

    
		list_page.map(item => {
			let category_name = '';
			if (item.attributes['entity.Shot.sg_category.CustomEntity26.code']) {
				category_name = item.attributes['entity.Shot.sg_category.CustomEntity26.code'];
			}
			if (item.attributes['entity.Asset.sg_category.CustomEntity26.code']) {
				category_name = item.attributes['entity.Asset.sg_category.CustomEntity26.code'];
			}
			const arr = {
        id: item.id,
				category_name,
        task_name: item.attributes.content,
				//shot_name: item.attributes['entity.Shot.code'] ? item.attributes['entity.Shot.code'] : item.attributes['entity.Asset.code'],
				link_name: item.relationships.step.data ? item.relationships.step.data.name : '',
				link_uuid: item.relationships.step.data ? item.relationships.step.data.id : '',
				plan_start_time: item.attributes.start_date,
				plan_end_time: item.attributes.due_date,
				//duration: item.attributes.duration,
				description: item.attributes.sg_description,
        project_name: project,
        sequence: item.attributes['entity.Shot.sg_sequence'] ? item.attributes['entity.Shot.sg_sequence'].name : '', //场次
        sequence_id: item.attributes['entity.Shot.sg_sequence'] ? item.attributes['entity.Shot.sg_sequence'].id : '',
        shot_name: item.attributes['entity.Shot.code'] ?  item.attributes['entity.Shot.code'] : '',
        //shot_id: item.attributes['entity.Shot.code'] ?  item.attributes['entity.Shot.id'] : '',
        task_assignees: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.name }).join() : '',
        task_assignees_id: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.id }).join() : '',
        finaldate: item.attributes['entity.Shot.sg_deadline'] ? item.attributes['entity.Shot.sg_deadline'] : '',
        sg_schedule_last_dailies_date: item.attributes.sg_schedule_last_dailies_date ? item.attributes.sg_schedule_last_dailies_date : '',
        duration: item.attributes.duration ? item.attributes.duration : 0,
			}
			arr.group_name = arr.shot_name;
			resq_page.push(arr);
		})
  } else {
    console.log(2222222222, res2.data)
  }
		//分组 
		let map_page = [];
    
    let jia_ids = 1;
    
		resq_page.map(item => {
      //
      
			const { group_name } = item;
			if (!map_page[group_name]) {
				map_page[group_name] = {
        id: item.id + 'shot',
        category_name: item.category_name,
				shot_name: item.shot_name,
				link_name: '',
				duration: 0,
				description: '',
        project_name: project,
        sequence: item.sequence, //场次
        task_assignees: item.task_assignees,
        task_name: '',
        children: []
				}
			}
     
			map_page[group_name].children.push(item);

      
		})
		const new_resource_page = Object.values(map_page);
		const resource = new_resource_page;

		// 获取自定义字段
		const customFormField = [];
    //console.log('customField_type', customField_type);return;
		// role
		const events = [];
		const resources = [];
		const resources_role = [];
		const events_role = [];
    const link_list_filter = [];
    const allow_resources = [];
    let shot_nums = 0
		resource.map(item => {
      
      let duration = 0;
      //const lingxing = [];
      const task_assignees = []
			item.children.map(item_event => {
        if(item_event.task_assignees) {
          task_assignees.push(item_event.task_assignees)
        }
        
        if(item_event.finaldate) {
          lingxing.push({
            id: item.id + 'lingxing',
            resourceId: item.id,
            title_oldvalue: '',
            start: item_event.finaldate,
            end: item_event.finaldate,
            department_name: '',
            editable: false,
            progress: 100,
            title: item_event.shot_name ? item_event.shot_name : '',
            color: '',
            duration: 1,
            people_num: 1,
            sg_schedule_last_dailies_date: '',
          })
        }
        if(item_event.plan_end_time && item_event.plan_start_time  !== item_event.plan_end_time) {
          item_event.plan_end_time = this.ctx.helper.getNextTime(1, item_event.plan_end_time);
        }
        let durations = 0;
        if (item_event.plan_start_time && item_event.plan_end_time) {
          durations = (ctx.helper.getDateDiff(item_event.plan_start_time, item_event.plan_end_time, 'day') + 1) * 1 * 8;
        }
        //console.log('durations',durations);
        const progress = item_event.duration ? (item_event.duration * 1 / 60 / durations * 1).toFixed(2) * 100 : 100;
        //console.log('progress',progress);
        
        const duration_real = item_event.duration ? item_event.duration * 1 / 60 / 8 : 0;
        duration += duration_real * 1;
        const arr = {
          id: item_event.id + item.shot_name,
          resourceId: item_event.id,
          title_oldvalue: item_event.description ? item_event.description : '暂无描述信息',
          start: item_event.plan_start_time ? ctx.helper.formatTime(item_event.plan_start_time) : '',
          end: item_event.plan_end_time ? ctx.helper.formatTime(item_event.plan_end_time) : '',
          department_name: '',
          editable: false,
          progress,
          title: item_event.description ? item_event.description : '暂无描述信息',
          color: setps[item_event.link_name],
          link_name: item_event.link_name,
          duration: duration_real,
          people_num: 1,
          sg_schedule_last_dailies_date: item_event.sg_schedule_last_dailies_date,
          sg_schedule_last_dailies_date_color: '#ff5200',
        }
        events.push(arr);

        item_event.duration = duration_real

        //
        // item.children.push({
        //   id: item_link.id,
        //   category_name: item_link.category_name,
        //   shot_name: item_link.shot_name,
        //   link_name: item_link.link_name,
        //   duration,
        //   description: '',
        //   project_name: project,
        //   sequence: item_link.sequence, //场次
        //   task_assignees: item_link.task_assignees,
        //   task_name:  Array.from(new Set(task_name)).join(),
        // })
			}
			)
      item.duration = duration;
      item.task_assignees = Array.from(new Set(task_assignees)).join();
			// const items = {
			// 	id: item.uuid,
			// 	category_name: item.category_name,
			// 	link_name: item.link_name || '',
			// 	member_name: item.member_name,
			// 	description: item.description || '',
			// 	duration: duration.toString(),
			// 	parent_id: item.parent_id,
			// 	init_id: item.id,
      //   shot_name: item.shot_name === '-' ? '' : item.shot_name,
      //   link_color: item.link_color,
			// }
			
			// items[params.resource_group_id] = item[group_id];
			// resources.push(items);

			return item;
		})
    
    let sort_resource = new_resource_page;
    if(params.sorts === 'duration') {
      sort_resource = ctx.helper.listSortBy(tree_resource, params.sorts, params.order);
    }

    let resourceorder = 1;
    sort_resource.map( item => {
      
      item.resourceorder = resourceorder;
      resourceorder++;
    })
		// 对events
		

    // page表获取数据
	
		
	

    // 对event 按照颜色分组
    let maps = [];
    maps['#d1ba1a'] = { color: '#d1ba1a', className: ['sign-diamond'], events: this.ctx.helper.unique(lingxing,'start').map( item=> {
      return item
    }) };
    
    events.map( item => {
      const { color } = item;
      if (!maps[color]) {
        maps[color] = {
          color: item.color,
          events: [],
          className: [],
        }
        if(item.from === 'shotgun') {
          console.log(2222222222, item.from)
          maps[color].className = ["shotGun-event"];
        }
      }
      maps[color].events.push(item);

    })
    const new_event = Object.values(maps);
    

    //ctx.helper.success(ctx, 1, '成功', sort_resource);return
    const resourceAreaColumns = [
      {
        "title": "项目",
        "description": "项目",
        "key": "f5c47237-e255-4d1d-ad09-78f43464a1a1",
        "field": "project_name",
        "headerContent": "项目",
        "width": "100px",
        "disabled": true,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "分类",
        "description": "分类",
        "key": "f5c47237-e255-4d1d-ad09-78f43464a1a3",
        "field": "category_name",
        "headerContent": "分类",
        "width": "200px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "场次",
        "description": "场次",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339ae1",
        "field": "sequence",
        "headerContent": "场次",
        "width": "100px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "镜头",
        "description": "镜头",
        "key": "5b63639f-7e61-4c88-9eec-a90b1522f31d",
        "field": "shot_name",
        "headerContent": "镜头",
        "width": "150px",
        "disabled": true,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "环节",
        "description": "环节",
        "key": "9e04dcb2-8fdc-4ce3-aa72-1241d52498bf",
        "field": "link_name",
        "headerContent": "环节",
        "width": "100px",
        "disabled": true,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "任务名",
        "description": "任务名",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339ae2",
        "field": "task_name",
        "headerContent": "任务名",
        "width": "100px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "供应商",
        "description": "供应商",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339ae3",
        "field": "task_assignees",
        "headerContent": "供应商",
        "width": "200px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      {
        "title": "时长",
        "description": "时长",
        "key": "5ecadd71-dd61-4696-914e-ada2b2c28821",
        "field": "duration",
        "headerContent": "时长",
        "width": "100px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      },
      // {
      //   "title": "备注",
      //   "description": "备注",
      //   "key": "6386fe71-f118-41b1-818c-1c1d92f55eea",
      //   "field": "description",
      //   "headerContent": "备注",
      //   "width": "100px",
      //   "disabled": false,
      //   "headerClassNames": [
      //     "resource_header_name"
      //   ],
      //   "cellClassNames": [
      //     "resource_content_name"
      //   ]
      // }
    ];
    // 过滤得表头
    const init_key = ['5ecadd71-dd61-4696-914e-ada2b2c28821','f5c47237-e255-4d1d-ad09-78f43464a1a3']
    const keys_arr = params.resourceAreaKeys ? params.resourceAreaKeys.join() : init_key;
    const new_field_list = [];
    resourceAreaColumns.map(item => {
      if (!keys_arr.includes(item.key)) {
        new_field_list.push(item);
      }
		})
    // 时间统计
    
		
		
		
		
		const results = {
			resourceGroupField: '',
			resourceAreaColumns: new_field_list.length > 0 ? new_field_list : resourceAreaColumns,
			resourceAreaKeys: params.resourceAreaKeys ? params.resourceAreaKeys : init_key,
			resourceAreaData: resourceAreaColumns,
			resourcesInitiallyExpanded: '',
			resources: sort_resource,
			eventColor: '#3BB2E3',
			eventSources: new_event,
			total: 10000,
      project
      

		}

		this.ctx.helper.success(ctx, 1, '成功', results);
	}

  async option() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.query;
    console.log(22222,ctx.request);
		const { project, schedule_uuid } = params;
		if (!project) {
			this.ctx.helper.success(ctx, 1, '成功'); return;
		}
    console.log(111111111)
		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
		const token_info = await ctx.service.bd.shotgun.getAxcessToken();

		const token = token_info;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/vnd+shotgun.api3_hash+json',
			'Accept': 'application/json',
		}
    let condition = ``;
    if(params.link_name) {
      const link_name = params.link_name.map( item => {
        return '"' + item + '"';
      })
      condition = condition + `,
      [
        "step.Step.code",
        "in",
        [${link_name}]
      ]`;
    }
    //console.log(condition);return;
    if(params.task_assignees) {
      const task_assignees = params.task_assignees.map( item => {
        return `{
          "type": "HumanUser",
          "id": ${item},
          "name": "",
          "valid": "valid"
        }`;
      })
      condition = condition + `,
      [
        "task_assignees",
        "in",
        [
          ${task_assignees}
        ]
      ]`;
    }
    //console.log(condition);return;
    if(params.category_name) {
      const category_name = params.category_name.map( item => {
        return '"' + item + '"';
      })
      condition = condition + `,
      [
        "entity.Shot.sg_category.CustomEntity26.code",
        "in",
        "${category_name}"
      ]`;
    }
    if(params.shot_name) {
      const shot_name = params.shot_name.map( item => {
        return '"' + item + '"';
      })
      condition = condition + `,
      [
        "entity.Shot.code",
        "in",
        "${shot_name}"
      ]`;
    }
    if(params.sequence) {
      const sequence = params.sequence.map( item => {
        return `{
          "type": "Sequence",
          "id": ${item},
          "name": "",
          "valid": "valid"
        }`;
      })
      condition = condition + `,
      [
        "entity.Shot.sg_sequence",
        "in",
        [
          ${sequence}
        ]
      ]`;
    }
  
    let sort = 'start_date';
    switch (params.sorts) {
      case 'sequence':
        sort = 'entity.Shot.sg_sequence';
        break;
      case 'category_name':
        sort = 'entity.Shot.sg_category.CustomEntity26.code';
        break;
      case 'task_name':
        sort = 'content';
        break;
      case 'link_name':
        sort = 'step';
        break;
      case 'shot_name':
        sort = 'entity.Shot.code';
        break;
      case 'task_assignees':
        sort = 'task_assignees';
        break; 
      default:
        break;
    }
    const order = params.order && params.order === 'desc' ? '-' : ''; 
    
    const data = `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "project.Project.name",
            "is",
            "${project}"
        
          ],
          [
            "entity",
            "type_is",
            "Shot"
        
          ]
          ${condition}
        ]
      },
      
      "sort": "${order}${sort}",
      "fields": [
        "id",
        "image",
        "entity",
        "step",
        "content",
        "sg_description",
        "entity.Shot.sg_ppm_notes",
        "sg_status_list",
        "sg______tasklevel_",
        "sg_require_artist_level",
        "sg_plan_day",
        "task_assignees",
        "time_logs_sum",
        "sg_planday_suggestion",
        "start_date",
        "due_date",
        "duration",
        "sg_schedule_last_dailies_date",
        "entity.Shot.sg_shot_type",
        "entity.Shot.sg_sequence",
        "project.Project.code",
        "project.Project.name",
        "entity.Shot.sg_category.CustomEntity26.code",
        "entity.Shot.code",
        "entity.Shot.sg_deadline"
      ]
    }`
     console.log(data)
    
    const sort_query = `&sort=${order}${sort}`
    const resList = [];
    const shotgunHost = this.config.shotgunHost;
    const shotgun_list = async  function(number) {
      const page = `?page[size]=1000&page[number]=${number}`
      
      const url_entity_search = `${shotgunHost}/api/v1/entity/Task/_search${page}`;
      console.log('url',  `${shotgunHost}/api/v1/entity/Task/_search${page}${sort_query}`)
      const res2 = await ctx.curl(url_entity_search, {
        dataType: 'json',
        headers,
        method: 'POST',
        data
      });
      const list = res2.data.data;
      //console.log('error', res2.data)
      //console.log(res2.data)
      if(list) {
        list.map( item => {
          resList.push(item);
        })
        if(list.length > 0 && list.length === 1000) {
          number += 1;
          await shotgun_list(number);
        }
     } else {
        
     }
      
    }
		await shotgun_list(1);


    //this.ctx.helper.success(ctx, 1, '成功', resList);return;

		const resq = []
		resList.map(item => {
			let category_name = '';
			if (item.attributes['entity.Shot.sg_category.CustomEntity26.code']) {
				category_name = item.attributes['entity.Shot.sg_category.CustomEntity26.code'];
			}
			if (item.attributes['entity.Asset.sg_category.CustomEntity26.code']) {
				category_name = item.attributes['entity.Asset.sg_category.CustomEntity26.code'];
			}
      //console.log(item)
			const arr = {
        id: item.id,
				category_name,
        task_name: item.attributes.content,
				//shot_name: item.attributes['entity.Shot.code'] ? item.attributes['entity.Shot.code'] : item.attributes['entity.Asset.code'],
				link_name: item.relationships.step.data ? item.relationships.step.data.name : '',
				link_uuid: item.relationships.step.data ? item.relationships.step.data.id : '',
				plan_start_time: item.attributes.start_date,
				plan_end_time: item.attributes.due_date,
				//duration: item.attributes.duration,
				description: item.attributes.sg_description,
        project_name: project,
        sequence: item.attributes['entity.Shot.sg_sequence'] ? item.attributes['entity.Shot.sg_sequence'].name : '', //场次
        sequence_id: item.attributes['entity.Shot.sg_sequence'] ? item.attributes['entity.Shot.sg_sequence'].id : '',
        shot_name: item.attributes['entity.Shot.code'] ?  item.attributes['entity.Shot.code'] : '',
        task_assignees: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.name }).join() : '',
        task_assignees_id: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.id }).join() : '',
        finaldate: item.attributes['entity.Shot.sg_deadline'] ? item.attributes['entity.Shot.sg_deadline'] : '',
        sg_schedule_last_dailies_date: item.attributes.sg_schedule_last_dailies_date ? item.attributes.sg_schedule_last_dailies_date : '',
        duration: item.attributes.duration ? item.attributes.duration : 0,
			}
			arr.group_name = arr.shot_name;
			resq.push(arr);
		})

    // 
    

		//分组 
		let map = [];
    let project_list = [];
    let category_list = [];
    let link_list = [];
    let shot_list = [];
    let task_assignees = [];
    let sequence = [];
    let jia_id = 1;
    
		resq.map(item => {
      //
      if(item.project_name) {
        project_list.push({
          id: jia_id,
          text: item.project_name,
          value: item.project_name,
        })
      }
      if(item.category_name) {
        category_list.push({
          id: jia_id,
          text: item.category_name,
          value: item.category_name,
        })
      }
      if(item.link_name) {
        link_list.push({
          id: jia_id,
          text: item.link_name,
          value: item.link_name,
        })
      }
      if(item.shot_name) {
        shot_list.push({
          id: jia_id,
          text: item.shot_name,
          value: item.shot_name,
        })
      }
      if(item.task_assignees) {
        task_assignees.push({
          id: item.task_assignees_id,
          text: item.task_assignees,
          value: item.task_assignees,
        })
      }
      if(item.sequence) {
        sequence.push({
          id: item.sequence_id,
          text: item.sequence,
          value: item.sequence,
        })
      }
    })

		
		

		
     

		
		const results = {
      category_list: this.ctx.helper.unique(category_list,'text').map( item=> {
        return item
      }),
      link_list: this.ctx.helper.unique(link_list,'text').map( item=> {
        return item
      }),
      shot_list: this.ctx.helper.unique(shot_list,'text').map( item=> {
        return item
      }),
      task_assignees: this.ctx.helper.unique(task_assignees,'text').map( item=> {
        return item
      }),
      sequence: this.ctx.helper.unique(sequence,'text').map( item=> {
        return item
      }),

		}

		this.ctx.helper.success(ctx, 1, '成功', results);
	}
}

module.exports = ShotgunController;