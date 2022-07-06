const Controller = require('egg').Controller;


const e = require('express');
const { v4: uuidv4 } = require('uuid');
const { runInThisContext } = require('vm');

class ShotgunController extends Controller {
	async index() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.body;
    
		let { schedule_uuid, resource_group_id = 'group_category', model = 'shot' } = params;
		
    //const schedule_uuid = 'f9d339a9-70d6-404b-b734-fac5025e3d66';
    const schedeule_info = await ctx.service.plan.schedulemanage.getInfo(schedule_uuid);
    console.log(schedeule_info)
    
    let project = JSON.parse(schedeule_info.project_name);
    console.log(project)
    if (!project) {
			this.ctx.helper.success(ctx, 1, '成功1'); return;
		}
    
    // this.ctx.helper.success(ctx, 1, '成功', project);return;
    // 分组 group 
    let fields = ``
    if(model === 'shot') {
      fields = `"id",
      "entity.Shot.sg_sequence",
      "project.Project.name",
      "entity.Shot.code",
      "entity.Shot.sg_deadline",
      "image",
      "entity",
      "step",
      "content",
      "sg_description",
      "sg_status_list",
      "task_assignees",
      "start_date",
      "due_date",
      "entity.Shot.code",
      "entity.Shot.sg_status_list",
      "entity.Shot.id",
      "entity.Shot.image",
      "entity.Shot.sg_category.CustomEntity26.code",
      "entity.Shot.sg_category.CustomEntity26.sg_parent_code_2",
      "entity.Shot.sg_category.CustomEntity26.sg_parent_code_1",
      "sg_task_progress"`
    }
    if(model === 'asset') {
      if(resource_group_id === 'group_sequence') {
        resource_group_id = 'group_asset_type'
      }
      if(resource_group_id === 'group_shot') {
        resource_group_id = 'group_asset'
      }
      fields = `"id",
      "project.Project.name",
      "image",
      "entity",
      "step",
      "content",
      "sg_description",
      "sg_status_list",
      "task_assignees",
      "start_date",
      "due_date",
      "entity.Asset.sg_status_list",
      "entity.Asset.sg_asset_type",
      "entity.Asset.code",
      "entity.Asset.sg_dealine",
      "entity.Asset.id",
      "entity.Asset.sg_finish_date",
      "entity.Asset.image",
      "entity.Asset.sg_category.CustomEntity26.code",
      "entity.Asset.sg_category.CustomEntity26.sg_parent_code_2",
      "entity.Asset.sg_category.CustomEntity26.sg_parent_code_1",
      "sg_task_progress"`
    }
    let resource_child_group_id = '';
    let group_id = '';
    let three_group_id = '';
    let group_id_level_1 = '';
    let group_id_level_2 = '';
    switch (resource_group_id) {
      case 'group_category':
        group_id_level_1 = 'category_name_parent_name_level_1';
        group_id_level_2 = 'category_name_parent_name_level_2';
        group_id = 'category_name';
        resource_child_group_id = 'shot_name';
        three_group_id = 'link_name';
        break;
      case 'group_sequence':
        group_id = 'sequence';
        resource_child_group_id = 'shot_name';
        three_group_id = 'link_name';
        break;
      case 'group_asset_type':
        group_id = 'asset_type';
        resource_child_group_id = 'asset_name';
        three_group_id = 'link_name';
        break;
      case 'group_task':
        group_id = 'link_name';
        resource_child_group_id = '';
        three_group_id = '';
        break;
      case 'group_shot':
        group_id = 'shot_name';
        resource_child_group_id = 'link_name';
        three_group_id = '';
        break;
      case 'group_asset':
        group_id = 'asset_name';
        resource_child_group_id = 'link_name';
        three_group_id = '';
        break;
      default:
        group_id = 'category_name';
        resource_child_group_id = 'shot_name';
        three_group_id = 'link_name';
        break;
    }
    
    //console.log(1111111,group_id, resource_child_group_id, three_group_id);return;
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
      // if(params.link_name.length > 1) {
      //   link_name = params.link_name.map( item => {
      //     return '"' + item + '"';
      //   }) 
      // }
      condition = condition + `,
      [
        "step.Step.code",
        "in",
        [${link_name}]
      ]`;
    }
    //console.log(condition);return;
    if(params.task_assignees) {
      // const task_assignees = params.task_assignees.map( item => {
      //   return `{
      //     "type": "HumanUser",
      //     "id": ${item},
      //     "name": "",
      //     "valid": "valid"
      //   }`;
      // })
      if(params.task_assignees * 1=== 2046) {
        project = ["TWE"]
      } else {
        const task_assignees =  `{
          "type": "HumanUser",
          "id": ${params.task_assignees},
          "name": "",
          "valid": "valid"
        }`;
        condition = condition + `,
        [
          "task_assignees",
          "in",
          [
            ${task_assignees}
          ]
        ]`;
      } 
      
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
    const entity_model = ctx.helper.InitialsChange(model)
    // teshuchuli
    if(model === 'shot') {
      condition = condition + `,
      [
        "step.Step.code",
        "is_not",
        "RnD"
      ]`;
    }
    
      project = project.map( item => {
        return '"' + item + '"';
      }) 
    //console.log(project);return;
    const data = `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "project.Project.name",
            "in",
            [${project}]
          ],
          [
            "entity",
            "type_is",
            "${entity_model}"
          ],
          [
            "sg_status_list",
            "not_in",
            ["omt","hold","hor","ho"]
          ],
          [
            "sg_in_bidding",
            "not_in",
            ["In Bidding","In Planning"]
          ],
          [
            "task_assignees",
            "is_not",
            [
              {
                "type": "HumanUser",
                "id": 2046,
                "name": "",
                "valid": "valid"
              }
            ]
          ]
          ${condition}
        ]
      },
      
      "sort": "${order}${sort}",
      "fields": [
        ${fields}
      ]
    }`
    console.log(data);
    //return;
    
    const sort_query = `&sort=${order}${sort}`
    const list_page = [];
    const shotgunHost = this.config.shotgunHost;
    const shotgun_list = async  function(number) {
      const page = `?page[size]=3000&page[number]=${number}`
      
      const url_entity_search = `${shotgunHost}/api/v1/entity/Task/_search${page}`;
      console.log('url',  `${shotgunHost}/api/v1/entity/Task/_search${page}`)
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
          list_page.push(item);
        })
        if(list.length > 0 && list.length === 3000) {
          number += 1;
          await shotgun_list(number);
        }
      } else {
        
     }
      
    }
    if(params.is_redis && params.is_redis * 1 === 2) {
		  await shotgun_list(1);
    }
    //this.ctx.helper.success(ctx, 1, '成功', list_page);return;

		// 获取任务状态todo
    const status_list = await ctx.service.bd.shotgun.getStatusList();
    //this.ctx.helper.success(ctx, 1, '成功', status_list);return;
    const status_arr_list = {}
    status_list.map( item => {
      status_arr_list[item.code] = item.name;
    })

    // 获取环节
    const step_list = await ctx.service.bd.shotgun.getStepList();
    const setps = {}
    const step_short_name_list = {}
    step_list.map( item => {
      setps[item.value] = item.color;
      step_short_name_list[item.value] = item.short_name;
    })
    // 获取环节进度比例
    const link_progress = await ctx.service.bd.shotgun.getLinkProgress();
    //console.log('link_progress', link_progress);return;
    const link_progress_list = {}
    const link_name_list = {}
    const link_code_progress_list = {}
    link_progress.map( item => {
      item.link_name.map( item_link => {
        //console.log('item_link', item_link)
        link_progress_list[item_link] = item.step_progress;
        link_name_list[item_link] = item.code;
      })
      link_code_progress_list[item.code] = item.step_progress;
    })
    
    let resq_page = []
    if(list_page) {
      list_page.map(item => {
        let category_name = '';
        let category_name_parent_name_level_1 = '';
        let category_name_parent_name_level_2 = '';
        if (item.attributes['entity.Shot.sg_category.CustomEntity26.code']) {
          category_name = item.attributes['entity.Shot.sg_category.CustomEntity26.code'];
          category_name_parent_name_level_1 = item.attributes['entity.Shot.sg_category.CustomEntity26.sg_parent_code_1'];
          category_name_parent_name_level_2 = item.attributes['entity.Shot.sg_category.CustomEntity26.sg_parent_code_2'];
        }
        if (item.attributes['entity.Asset.sg_category.CustomEntity26.code']) {
          category_name = item.attributes['entity.Asset.sg_category.CustomEntity26.code'];
          category_name_parent_name_level_1 = item.attributes['entity.Asset.sg_category.CustomEntity26.sg_parent_code_1'];
          category_name_parent_name_level_2 = item.attributes['entity.Asset.sg_category.CustomEntity26.sg_parent_code_2'];
        }

        if(item.attributes['project.Project.name'] === 'TWE2') {
          item.relationships.task_assignees.data = [
						{
							"id": 2046,
							"name": "MOREVFX Vendor",
							"type": "HumanUser"
						}
					]
        }
        const arr = {
          id: item.id,
          category_name,
          category_name_parent_name_level_1,
          category_name_parent_name_level_2,
          task_name: item.attributes.content,
          image: item.attributes.image ? item.attributes.image : '',
          sg_cut_duration: item.attributes['sg_cut_duration'] ? item.attributes['sg_cut_duration'] : '', //帧数 
          status: item.attributes.sg_status_list ? status_arr_list[item.attributes.sg_status_list] : '',
          shot_status: item.attributes['entity.Shot.sg_status_list'] ? status_arr_list[item.attributes['entity.Shot.sg_status_list']] : '',
          entity_id: item.attributes['entity.Shot.id'] ? item.attributes['entity.Shot.id'] : item.attributes['entity.Asset.id'],
          entity_image: item.attributes['entity.Shot.image'] ? item.attributes['entity.Shot.image'] : item.attributes['entity.Asset.image'],
          entity_status: item.attributes['entity.Shot.sg_status_list'] ? status_arr_list[item.attributes['entity.Shot.sg_status_list']] : status_arr_list[item.attributes['entity.Asset.sg_status_list']],
          shot_status_code: item.attributes['entity.Shot.sg_status_list'] ? item.attributes['entity.Shot.sg_status_list'] : '',
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
          
          //asset_id: item.attributes['entity.Asset.id'] ? item.attributes['entity.Asset.id'] : '',
          asset_name: item.attributes['entity.Asset.code'] ?  item.attributes['entity.Asset.code'] : '',
          final_date: item.attributes['entity.Shot.sg_dealine'],
          asset_type: item.attributes['entity.Asset.sg_asset_type'] ? item.attributes['entity.Asset.sg_asset_type'] : '', 
          asset_status: item.attributes['entity.Asset.sg_status_list'] ? status_arr_list[item.attributes['entity.Asset.sg_status_list']] : '',
          asset_status_code: item.attributes['entity.Asset.sg_status_list'] ? item.attributes['entity.Asset.sg_status_list'] : '',

          task_assignees: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.name }).join() : '',
          task_assignees_id: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.id }).join() : '',
          finaldate: item.attributes['entity.Shot.sg_deadline'] ? item.attributes['entity.Shot.sg_deadline'] : '',
          sg_schedule_last_dailies_date: item.attributes.sg_schedule_last_dailies_date ? item.attributes.sg_schedule_last_dailies_date : '',
          duration: item.attributes.duration ? item.attributes.duration : 0,
          progress: item.attributes.sg_task_progress ,
          sg_task_progress: item.attributes.sg_task_progress,
        }
        arr.group_name = arr.shot_name;
        resq_page.push(arr);
      })
    } else {
      console.log(2222222222, res2.data)
    }
    console.log(2222222222)
    // 缓存处理
    const redis_key = resource_group_id + '_' + model;
    console.log('redis_key', redis_key)
    let filter_list = resq_page;
    if(!params.is_redis) {
      //console.log(123);return;
      const group_redis = await ctx.service.redis.get(redis_key);
      //console.log(group_redis);
      if(group_redis) {
        group_redis.map(item => {
          let category_name = '';
          let category_name_parent_name_level_1 = '';
          let category_name_parent_name_level_2 = '';
          if (item.attributes['entity.Shot.sg_category.CustomEntity26.code']) {
            category_name = item.attributes['entity.Shot.sg_category.CustomEntity26.code'];
            category_name_parent_name_level_1 = item.attributes['entity.Shot.sg_category.CustomEntity26.sg_parent_code_1'];
            category_name_parent_name_level_2 = item.attributes['entity.Shot.sg_category.CustomEntity26.sg_parent_code_2'];
          }
          if (item.attributes['entity.Asset.sg_category.CustomEntity26.code']) {
            category_name = item.attributes['entity.Asset.sg_category.CustomEntity26.code'];
            category_name_parent_name_level_1 = item.attributes['entity.Asset.sg_category.CustomEntity26.sg_parent_code_1'];
            category_name_parent_name_level_2 = item.attributes['entity.Asset.sg_category.CustomEntity26.sg_parent_code_2'];
          }
  
          if(item.attributes['project.Project.name'] === 'TWE2') {
            item.relationships.task_assignees.data = [
              {
                "id": 2046,
                "name": "MOREVFX Vendor",
                "type": "HumanUser"
              }
            ]
          }
          const arr = {
            id: item.id,
            category_name,
            category_name_parent_name_level_1,
            category_name_parent_name_level_2,
            task_name: item.attributes.content,
            image: item.attributes.image ? item.attributes.image : '',
            sg_cut_duration: item.attributes['sg_cut_duration'] ? item.attributes['sg_cut_duration'] : '', //帧数 
            status: item.attributes.sg_status_list ? status_arr_list[item.attributes.sg_status_list] : '',
            shot_status: item.attributes['entity.Shot.sg_status_list'] ? status_arr_list[item.attributes['entity.Shot.sg_status_list']] : '',
            entity_id: item.attributes['entity.Shot.id'] ? item.attributes['entity.Shot.id'] : item.attributes['entity.Asset.id'],
            entity_image: item.attributes['entity.Shot.image'] ? item.attributes['entity.Shot.image'] : item.attributes['entity.Asset.image'],
            entity_status: item.attributes['entity.Shot.sg_status_list'] ? status_arr_list[item.attributes['entity.Shot.sg_status_list']] : status_arr_list[item.attributes['entity.Asset.sg_status_list']],
            shot_status_code: item.attributes['entity.Shot.sg_status_list'] ? item.attributes['entity.Shot.sg_status_list'] : '',
            link_name: item.relationships.step.data ? item.relationships.step.data.name : '',
            link_uuid: item.relationships.step.data ? item.relationships.step.data.id : '',
            plan_start_time: item.attributes.start_date,
            plan_end_time: item.attributes.due_date,
            //duration: item.attributes.duration,
            description: item.attributes.sg_description,
            project_name: item.attributes['project.Project.name'],
            sequence: item.attributes['entity.Shot.sg_sequence'] ? item.attributes['entity.Shot.sg_sequence'].name : '', //场次
            sequence_id: item.attributes['entity.Shot.sg_sequence'] ? item.attributes['entity.Shot.sg_sequence'].id : '',
            shot_name: item.attributes['entity.Shot.code'] ?  item.attributes['entity.Shot.code'] : '',
            //shot_id: item.attributes['entity.Shot.code'] ?  item.attributes['entity.Shot.id'] : '',
            
            //asset_id: item.attributes['entity.Asset.id'] ? item.attributes['entity.Asset.id'] : '',
            asset_name: item.attributes['entity.Asset.code'] ?  item.attributes['entity.Asset.code'] : '',
            final_date: item.attributes['entity.Shot.sg_dealine'],
            asset_type: item.attributes['entity.Asset.sg_asset_type'] ? item.attributes['entity.Asset.sg_asset_type'] : '', 
            asset_status: item.attributes['entity.Asset.sg_status_list'] ? status_arr_list[item.attributes['entity.Asset.sg_status_list']] : '',
            asset_status_code: item.attributes['entity.Asset.sg_status_list'] ? item.attributes['entity.Asset.sg_status_list'] : '',
  
            task_assignees: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.name }).join() : '',
            task_assignees_id: item.relationships.task_assignees.data.length > 0 ? item.relationships.task_assignees.data.map( item => { return item.id }).join() : '',
            finaldate: item.attributes['entity.Shot.sg_deadline'] ? item.attributes['entity.Shot.sg_deadline'] : '',
            sg_schedule_last_dailies_date: item.attributes.sg_schedule_last_dailies_date ? item.attributes.sg_schedule_last_dailies_date : '',
            duration: item.attributes.duration ? item.attributes.duration : 0,
            progress: item.attributes.sg_task_progress ,
            sg_task_progress: item.attributes.sg_task_progress,
          }
          arr.group_name = arr.shot_name;
          resq_page.push(arr);
        })
        
        if(params.link_name) {
         filter_list = resq_page.filter(item => item.link_name == params.link_name );
        }
        if(params.task_assignees) {
          if(params.task_assignees * 1 === 2046) {
           filter_list = resq_page.filter(item => item.project_name == 'TWE2' );
          } else {
            console.log('hahahha', params.task_assignees);
            filter_list = resq_page.filter(item => item.task_assignees_id * 1 == params.task_assignees * 1 );
          }
         
        }
        //this.ctx.helper.success(ctx, 1, '成功', filter_list);return;
      } else {
        this.ctx.helper.success(ctx, -1, '请联系管理员！'); return;
      }
    }
    if(params.is_redis && params.is_redis * 1 === 2) {
      console.log('reids start')
      const time = 60 * 500
      ctx.service.redis.set(redis_key, list_page, time);
      console.log('reids end')
    }
    //return;
		//分组 
		let map_page = [];
    const lingxing = []
    let jia_ids = 1;
    
		
    let new_resource_page_level_1 = [];
    if(group_id_level_1) {
      filter_list.map( item => {
        //
        
        const group_field = item[group_id_level_1];
        //console.log(item, group_field, group_id_level_1);return;
        if (!map_page[group_field]) {
          map_page[group_field] = {
          id:  item.category_name_parent_name_level_1 + item.category_name_parent_name_level_2 + item.category_name + item.sequence + item.asset_type + 'category_level_1',
          entity_id: item.entity_id,
          category_name: '',
          asset_type: item.asset_type,
          shot_name: '',
          link_name: '',
          duration: 0,
          description: '',
          project_name: project,
          sequence: '', //场次
          task_assignees: '',
          task_name: '',
          image: '',
          sg_cut_duration: '', //帧数
          status: '',
          is_start_num: '0', //已开始数量
          is_final_num: '0', //已完成数量或导演通过数
          sg_task_progress: '0',
          children: []
          }
        }
        
        map_page[group_field][group_id_level_1] = group_field;
  
        map_page[group_field].children.push(item);
      })
      new_resource_page_level_1 = Object.values(map_page);
      //this.ctx.helper.success(ctx, 1, '成功', new_resource_page_level_1);return;
      new_resource_page_level_1.map( item => {
        const level_2 = []
        item.children.map( item_level_2 => {
          const group_field = item_level_2[group_id_level_2];
          //const { group_name } = item;
          if (!level_2[group_field]) {
            level_2[group_field] = {
              id: item_level_2.category_name_parent_name_level_2 + item.category_name + item.sequence + item.asset_type  + 'category_level_2',
              entity_id: item.entity_id,
              category_name: '',
              asset_type: item.asset_type,
              shot_name: '',
              link_name: '',
              duration: 0,
              description: '',
              project_name: project,
              sequence: '', //场次
              task_assignees: '',
              task_name: '',
              image: '',
              sg_cut_duration: '', //帧数
              status: '',
              is_start_num: '0', //已开始数量
              is_final_num: '0', //已完成数量或导演通过数
              sg_task_progress: '0',
              children: []
            }
          }
          
          level_2[group_field][group_id_level_2] = group_field;
    
          level_2[group_field].children.push(item_level_2);
        })
        item.children = Object.values(level_2);
      })
      //this.ctx.helper.success(ctx, 1, '成功', new_resource_page_level_1);return;
      new_resource_page_level_1.map( item => {
        item.children.map( item_level_2 => {
          const category = []
          item_level_2.children.map( item_category => {
            const group_field = item_category[group_id];
            //const { group_name } = item;
            if (!category[group_field]) {
              category[group_field] = {
              id:  (group_id === 'shot_name' || group_id === 'asset_name')  ? item_category.entity_id : item_category.category_name + item_category.sequence + item_category.asset_type  + 'category_level_0',
              entity_id: item_category.entity_id,
              category_name: item_category.category_name,
              asset_type: item_category.asset_type,
              shot_name: '',
              link_name: '',
              duration: 0,
              description: '',
              project_name: project,
              sequence: item.sequence, //场次
              task_assignees: '',
              task_name: '',
              image: (group_id === 'shot_name' || group_id === 'asset_name')  ? item_category.entity_image : '',
              sg_cut_duration: group_id === 'shot_name' ? item_category.sg_cut_duration : '', //帧数
              status: group_id === 'shot_name' ? item_category.shot_status :  item_category.asset_status,
              is_start_num: '0', //已开始数量
              is_final_num: '0', //已完成数量或导演通过数
              sg_task_progress: '0',
              children: []
              }
            }
            
            category[group_field][group_id] = group_field;
      
            category[group_field].children.push(item_category);
          })
          item_level_2.children = Object.values(category);
        })
        
      })
    } else {
      let new_list = filter_list
      if(group_id === 'link_name') {
        //
        new_list = []
        //const guolv_list = [];
        filter_list.map( item=> {
          item.link_name_shotgun = link_name_list[item.link_name];
          item.link_progress = link_code_progress_list[item.link_name_shotgun];
          console.log('item.link_name_shotgun', item.link_name_shotgun);
          if(item.link_name_shotgun) {
            new_list.push(item);
          }
        })
        group_id = 'link_name_shotgun';
      }
      //this.ctx.helper.success(ctx, 1, '成功', new_list);return;
      new_list.map(item => {
        //
        //console.log(item);return;
        const group_field = item[group_id];
        //const { group_name } = item;
        if (!map_page[group_field]) {
          map_page[group_field] = {
          id:  (group_id === 'shot_name' || group_id === 'asset_name' )  ? item.entity_id : item.category_name + item.sequence + item.asset_type + item.link_name_shotgun,
          entity_id: item.entity_id,
          category_name: item.category_name,
          asset_type: item.asset_type,
          shot_name: '',
          link_name: group_id === 'link_name_shotgun' ? item.link_name_shotgun : '',
          duration: 0,
          description: '',
          project_name: project,
          sequence: item.sequence, //场次
          task_assignees: '',
          task_name: '',
          image: (group_id === 'shot_name' || group_id === 'asset_name')  ? item.entity_image : '',
          sg_cut_duration: group_id === 'shot_name' ? item.sg_cut_duration : '', //帧数
          status: (group_id === 'shot_name' || group_id === 'asset_name')  ? item.entity_status : '',
          is_start_num: '0', //已开始数量
          is_final_num: '0', //已完成数量或导演通过数
          sg_task_progress: '0',
          link_progress: item.link_progress ? item.link_progress + '%' : '0%',
          children: []
          }
        }
  
        
        
        map_page[group_field][group_id] = group_field;
  
        map_page[group_field].children.push(item);
        //item.progress = map_page[group_field].progress;
        //console.log(999999999999, link_progress_list[item.link_name], group_id, item);return;
        if(link_progress_list[item.link_name] && group_id === 'link_name_shotgun') {
          map_page[group_field].count = map_page[group_field].children.length;
          map_page[group_field].progress = Math.floor(map_page[group_field].children.reduce((c, item) => c * 1 + item.sg_task_progress, 0) * 1 / map_page[group_field].count * link_progress_list[item.link_name]  / 100 *1000)/1000 + '%';
          map_page[group_field].task_progress = Math.floor(map_page[group_field].children.reduce((c, item) => c * 1 + item.sg_task_progress, 0) * 1 / map_page[group_field].count   *1000)/1000 + '%';
          //map_page[group_field].progress = map_page[group_field].children.reduce((c, item) => c * 1 + item.sg_task_progress, 0) * 1 * 1 / map_page[group_field].count;
        } else {
          map_page[group_field].progress = '0%';
        }
      })
      new_resource_page_level_1 = Object.values(map_page);
    }
    
		const new_resource_page = new_resource_page_level_1;
    //this.ctx.helper.success(ctx, 1, '成功', new_resource_page_level_1);return;
    if(resource_child_group_id) {
      if(group_id_level_1) {
        new_resource_page.map( item_level => {
          item_level.children.map( item_level_2 => {
            item_level_2.children.map ( item => {
              let child_map = [];
              let is_start_num = 0;
              let is_final_num = 0;
              let is_total_num = 0;
              item.children.map( child_item => {
                // if(group_id === 'shot_name') {
                //   item.progress += child_item.progress;
                // }
                const child_group_field = child_item[resource_child_group_id];
                if (!child_map[child_group_field]) {
                  child_map[child_group_field] = {
                    id:  (resource_child_group_id === 'shot_name' || resource_child_group_id === 'asset_name')  ? child_item.entity_id : child_item.id + resource_child_group_id,
                    category_name: item.category_name,
                    shot_name: item.shot_name,
                    link_name: '',
                    duration: 0,
                    description: '',
                    project_name: project,
                    sequence: item.sequence, //场次
                    task_assignees: item.task_assignees,
                    task_name: '',
                    image: (resource_child_group_id === 'shot_name' || resource_child_group_id === 'asset_name')  ? child_item.entity_image : '',
                    sg_cut_duration: '', //帧数
                    status: '',
                    is_start_num: '0', //已开始数量
                    is_final_num: '0', //已完成数量或导演通过数
                    sg_task_progress: '0',
                    progress: child_item.progress ? child_item.progress : '0',
                    children: []
                  }
                }
                jia_ids++;
                child_map[child_group_field][resource_child_group_id] = child_group_field;
                child_map[child_group_field].children.push(child_item);
                child_map[child_group_field].count = child_map[child_group_field].children.length;
                //child_map[child_group_field].duration = child_map[child_group_field].children.reduce((c, item) => c + item.duration * 1, 0)
                //console.log(88888888, link_progress_list, child_item.link_name);
                // if(link_progress_list[child_item.link_name]) {
                //   //console.log(999999999999);return;
                //   child_map[child_group_field].progress = Math.floor(child_map[child_group_field].children.reduce((c, item) => c * 1 + item.sg_task_progress, 0) * 1 / child_map[child_group_field].count * link_progress_list[child_item.link_name] / 100 / 100 *1000)/1000;
                // } else {
                //   child_map[child_group_field].progress = 0;
                // }
                child_map[child_group_field].progress = '0%';
                //console.log('child_item.shot_status_code', child_item);return;
                //
                if(resource_child_group_id === 'shot_name') {
                  if(child_item.shot_status_code !== 'wtg' && child_item.shot_status_code !== 'rdy') {
                    is_start_num += 1;
                  }
                  if(child_item.shot_status_code === 'clapv' || child_item.shot_status_code === 'finsh' || child_item.shot_status_code === 'fin') {
                    is_final_num += 1;
                  }
                } 
                
                if(resource_child_group_id === 'asset_name') {
                  if(child_item.asset_status_code !== 'wtg' && child_item.asset_status_code !== 'rdy') {
                    is_start_num += 1;
                  }
                  if(child_item.asset_status_code === 'clapv' || child_item.asset_status_code === 'finsh' || child_item.asset_status_code === 'fin') {
                    is_final_num += 1;
                  }
                }
                is_total_num += 1;
              })
              item.children = Object.values(child_map);
              item.is_start_num = is_start_num.toString();
              item.is_final_num = is_final_num.toString();
              item.is_total_num = is_total_num.toString();
              //item.progress22 = '0'
              item.progress = item.is_total_num !== '0' && item.is_final_num !== '0' ? Math.floor(item.is_final_num * 1 / item.is_total_num *100)/100 * 100 + '%' : '0%';
            })
            })
        })
      } else {
        new_resource_page.map( item => {
          
            
              let child_map = [];
              let is_start_num = 0;
              let is_final_num = 0;
              let is_total_num = 0;
              item.children.map( child_item => {
                // if(group_id === 'shot_name') {
                //   item.progress += child_item.progress;
                // }
                const child_group_field = child_item[resource_child_group_id];
                if (!child_map[child_group_field]) {
                  child_map[child_group_field] = {
                    id:  (resource_child_group_id === 'shot_name' || resource_child_group_id === 'asset_name')  ? child_item.entity_id : child_item.id + resource_child_group_id,
                    category_name: item.category_name,
                    shot_name: item.shot_name,
                    link_name: '',
                    duration: 0,
                    description: '',
                    project_name: project,
                    sequence: item.sequence, //场次
                    task_assignees: item.task_assignees,
                    task_name: '',
                    image: (resource_child_group_id === 'shot_name' || resource_child_group_id === 'asset_name')  ? child_item.entity_image : '',
                    sg_cut_duration: '', //帧数
                    status: '',
                    is_start_num: '0', //已开始数量
                    is_final_num: '0', //已完成数量或导演通过数
                    sg_task_progress: '0',
                    progress: child_item.progress ? child_item.progress : '0',
                    children: []
                  }
                }
                jia_ids++;
                child_map[child_group_field][resource_child_group_id] = child_group_field;
                child_map[child_group_field].children.push(child_item);
                child_map[child_group_field].count = child_map[child_group_field].children.length * 1;
                //child_map[child_group_field].duration = child_map[child_group_field].children.reduce((c, item) => c + item.duration * 1, 0)
                //console.log(88888888, link_progress_list, child_item.link_name);
                if(link_progress_list[child_item.link_name]) {
                  //console.log(999999999999);return;
                  child_map[child_group_field].progress = Math.floor(child_map[child_group_field].children.reduce((c, item) => c * 1 + item.sg_task_progress, 0) * 1 / child_map[child_group_field].count * link_progress_list[child_item.link_name] / 100 / 100 *1000)/1000;
                } else {
                  child_map[child_group_field].progress = 0;
                }
                
                //console.log('child_item.shot_status_code', child_item);return;
                //
                if(resource_child_group_id === 'shot_name') {
                  if(child_item.shot_status_code !== 'wtg' && child_item.shot_status_code !== 'rdy') {
                    is_start_num += 1;
                  }
                  if(child_item.shot_status_code === 'clapv' || child_item.shot_status_code === 'finsh' || child_item.shot_status_code === 'fin') {
                    is_final_num += 1;
                  }
                } 
                
                if(resource_child_group_id === 'asset_name') {
                  if(child_item.asset_status_code !== 'wtg' && child_item.asset_status_code !== 'rdy') {
                    is_start_num += 1;
                  }
                  if(child_item.asset_status_code === 'clapv' || child_item.asset_status_code === 'finsh' || child_item.asset_status_code === 'fin') {
                    is_final_num += 1;
                  }
                }
                is_total_num += 1;
              })
              item.children = Object.values(child_map);
              item.is_start_num = is_start_num.toString();
              item.is_final_num = is_final_num.toString();
              item.is_total_num = is_total_num.toString();
              
              item.progress = item.is_total_num !== '0' && item.is_final_num !== '0' ? Math.floor(item.is_final_num * 1 / item.is_total_num *100)/100 *100 + '0%' : '0%';
            })
      }   
    }
    if(three_group_id) {
      if(group_id_level_1) {
        new_resource_page.map( item_level => {
          item_level.children.map( item_level_2 => {
            item_level_2.children.map ( item_p => {
          
          item_p.children.map( item => {
            let child_map = [];
            
            item.children.map( child_item => {
                const child_group_field = child_item[three_group_id];
                //console.log(`child_group_field`,child_group_field, '~~~~',three_group_id, child_item);
                if (!child_map[child_group_field]) {
                  child_map[child_group_field] = {
                    id: three_group_id === 'link_name' ? child_item.id + 'link_name' : item.id,
                    category_name: item.category_name,
                    shot_name: item.shot_name,
                    link_name: child_item.link_name,
                    duration: 0,
                    description: '',
                    project_name: project,
                    sequence: item.sequence, //场次
                    task_assignees: item.task_assignees,
                    task_name: '',
                    image: '',
                    sg_cut_duration: item.sg_cut_duration, //帧数
                    status: item.status,
                    is_start_num: '0', //已开始数量
                    is_final_num: '0', //已完成数量或导演通过数
                    children: []
                  }
                }
                child_map[child_group_field][three_group_id] = child_group_field;
                child_map[child_group_field].children.push(child_item);
                //child_map[child_group_field].duration = child_map[child_group_field].children.reduce((c, item) => c + item.duration * 1, 0)
                // child_map[child_group_field].progress = child_map[child_group_field].children.map( item => {
                //   const link_progress = link_progress_list[item.link_name] * item.sg_task_progress
                // })
                
            })
            item.children = Object.values(child_map);
            
          })
        })
      })
        })
    } else {
      new_resource_page.map( item_level => {
        
          
        
        item_level.children.map( item => {
          let child_map = [];
          
          item.children.map( child_item => {
              const child_group_field = child_item[three_group_id];
              //console.log(`child_group_field`,child_group_field, '~~~~',three_group_id, child_item);
              if (!child_map[child_group_field]) {
                child_map[child_group_field] = {
                  id: three_group_id === 'link_name' ? child_item.id + 'link_name' : item.id,
                  category_name: item.category_name,
                  shot_name: item.shot_name,
                  link_name: child_item.link_name,
                  duration: 0,
                  description: '',
                  project_name: project,
                  sequence: item.sequence, //场次
                  task_assignees: item.task_assignees,
                  task_name: '',
                  image: '',
                  sg_cut_duration: item.sg_cut_duration, //帧数
                  status: item.status,
                  is_start_num: '0', //已开始数量
                  is_final_num: '0', //已完成数量或导演通过数
                  children: []
                }
              }
              child_map[child_group_field][three_group_id] = child_group_field;
              child_map[child_group_field].children.push(child_item);
              //child_map[child_group_field].duration = child_map[child_group_field].children.reduce((c, item) => c + item.duration * 1, 0)
              // child_map[child_group_field].progress = child_map[child_group_field].children.map( item => {
              //   const link_progress = link_progress_list[item.link_name] * item.sg_task_progress
              // })
              
          })
          item.children = Object.values(child_map);
          
       
    })
      })
    }
    }

		const resource = new_resource_page;
    //this.ctx.helper.success(ctx, 1, '成功', resource);return;
		// 获取自定义字段
		const customFormField = [];
    //console.log('customField_type', customField_type);return;
		// role
		const events = [];
		const resources = [];
		const resources_role = [];
		//const events_role = [];
    const link_list_filter = [];
    const allow_resources = [];
    let shot_nums = 0
    //console.log('link_name_shotgun', group_id);return;
    if(group_id === 'category_name') {
      resource.map(level_1 => {
        const start_list_level_1 = [] //todo
        const end_list_level_1 = []
        let is_start_num_level_1 = 0;
        let is_final_num_level_1 = 0;
        let is_total_num_level_1 = 0;
        const task_progress_list_level_1 = [];
        level_1.children.map( level_2 => {
          const start_list_level_2 = [] //todo
          const end_list_level_2 = []
          let is_start_num = 0;
          let is_final_num = 0;
          let is_total_num = 0;
          const task_progress_list_level_2 = [];
          level_2.children.map(item =>{
            is_start_num += item.is_start_num * 1
            is_final_num += item.is_final_num * 1
            is_total_num += item.is_total_num * 1
            const start_list = [];
            const end_list = [];
            const task_progress_list = [];
            item.children.map(item_shot => {
              const start_list_shot = [];
              const end_list_shot = [];
              item_shot.children.map(item_link => {
                let duration = 0;
                //const lingxing = [];
                const task_assignees = []
                item_link.children.map(item_event => {
                  if(item_event.task_assignees) {
                    task_assignees.push(item_event.task_assignees)
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
                    id: item_event.id + 'event',
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
                    sg_schedule_last_dailies_date: ctx.helper.formatTime(item_event.plan_end_time),
                    sg_schedule_last_dailies_date_color: '#ff5200',
                    resource_progress: item_event.progress ? item_event.progress + '%' : '0%',
                  }
                  const arr_zhenghe = {
                    id: item_event.id + 'event',
                    resourceId: item_event.id,
                    title_oldvalue: item_event.description ? item_event.description : '暂无描述信息',
                    start: item_event.plan_start_time ? ctx.helper.formatTime(item_event.plan_start_time) : '',
                    end: item_event.plan_end_time ? ctx.helper.formatTime(item_event.plan_end_time) : '',
                    department_name: '',
                    editable: false,
                    progress,
                    title: step_short_name_list[item_event.link_name],
                    color: setps[item_event.link_name],
                    link_name: item_event.link_name,
                    duration: duration_real,
                    people_num: 1,
                    sg_schedule_last_dailies_date: ctx.helper.formatTime(item_event.plan_end_time),
                    sg_schedule_last_dailies_date_color: '#ff5200',
                    //resource_progress: item_shot.progress ? (item_shot.progress * 100) + '%' : '0%',
                  }
                  const zhenghe_start = ctx.helper.getUpTime(1, arr_zhenghe.end, 'has');
                  arr_zhenghe.id = item_shot.id + 'shot_asset_shap';
                  arr_zhenghe.resourceId = item_shot.id,
                  arr_zhenghe.start = arr_zhenghe.end = zhenghe_start;
                  arr_zhenghe.className = ['signbase_Event'];
                  events.push(arr);
                  if(zhenghe_start) {
                    events.push(arr_zhenghe);
                  }
                
                  if(arr.start) {
                    start_list.push(arr.start)
                    start_list_shot.push(arr.start)
                    start_list_level_2.push(arr.start)
                    start_list_level_1.push(arr.start)
                  }
                  
                  end_list.push(arr.end)
                  end_list_shot.push(arr.end)
                  end_list_level_2.push(arr.end)
                  end_list_level_1.push(arr.end)

                  task_progress_list.push(item_event.progress);
                  task_progress_list_level_1.push(item_event.progress);
                  task_progress_list_level_2.push(item_event.progress);
                  item_event.duration = duration_real
                })
                item_shot.duration = duration;
                item_shot.task_assignees = Array.from(new Set(task_assignees)).join();
              })
              let max = '';
              if(end_list_shot.length > 0){
                max = end_list_shot.reduce(function(a,b){ 
                  return b > a ? b : a; 
                });
              }
              let min = '';
              if(start_list_shot.length > 0) {
                min = start_list_shot.reduce(function(a,b){ 
                  return b < a ? b : a; 
                });
              }
              const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
              const arr = {
                id: item_shot.id + 'shot_asset',
                resourceId: item_shot.id,
                title_oldvalue: '',
                start: min,
                end: max,
                department_name: '',
                editable: false,
                progress: 100,
                title: min + '-' + max_shotgun,
                color: '#3BB2E3',
                link_name: '',
                duration: 0,
                people_num: 1,
                sg_schedule_last_dailies_date: '',
                sg_schedule_last_dailies_date_color: '#ff5200',
                resource_progress: item_shot.progress ? item_shot.progress : '0%',
              }
              
              events.push(arr);
            })

            item.count = task_progress_list.length;
            item.task_progress = Math.floor(task_progress_list.reduce((c, item) => c * 1 + item, 0) * 1 / item.count   *1000)/1000 + '%';

            //console.log(99999999, start_list, end_list);return;
            const max = end_list.reduce(function(a,b){ 
              return b > a ? b : a; 
            });
            let min = '';
            if(start_list.length > 0) {
              min = start_list.reduce(function(a,b){ 
                return b < a ? b : a; 
              });
            }
            //console.log('category_sequence_asset_type', item);return;
            const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
            const arr = {
              id: item.id + 'category_sequence_asset_type',
              resourceId: item.id,
              title_oldvalue: '',
              start: min,
              end: max,
              department_name: '',
              editable: false,
              progress: 100,
              title: min + '-' + max_shotgun,
              color: '#3BB2E3',
              link_name: '',
              duration: 0,
              people_num: 1,
              sg_schedule_last_dailies_date: '',
              sg_schedule_last_dailies_date_color: '#ff5200',
              resource_progress: item.task_progress ? item.task_progress  : '0%',
            }
            
            events.push(arr);
            return item;
          })
          level_2.is_start_num = is_start_num;
          level_2.is_final_num = is_final_num;
          level_2.is_total_num = is_total_num;
          is_start_num_level_1 += level_2.is_start_num;
          is_final_num_level_1 += level_2.is_final_num;
          is_total_num_level_1 += level_2.is_total_num;

          level_2.count = task_progress_list_level_2.length;
          level_2.task_progress = Math.floor(task_progress_list_level_2.reduce((c, item) => c * 1 + item, 0) * 1 / level_2.count   *1000)/1000 + '%';

          level_2.progress = level_2.is_total_num !== '0' && level_2.is_final_num !== '0' ? Math.floor(level_2.is_final_num * 1 / level_2.is_total_num *100)/100 * 100 + '%' : '0%';
          let max = '';
          if(end_list_level_2.length > 0){
            max = end_list_level_2.reduce(function(a,b){ 
              return b > a ? b : a; 
            });
          }
          let min = '';
          if(start_list_level_2.length > 0) {
            min = start_list_level_2.reduce(function(a,b){ 
              return b < a ? b : a; 
            });
          }
          const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
          const arr = {
            id: level_2.id + 'level_2',
            resourceId: level_2.id,
            title_oldvalue: '',
            start: min,
            end: max,
            department_name: '',
            editable: false,
            progress: 100,
            title: min + '-' + max_shotgun,
            color: '#3BB2E3',
            link_name: '',
            duration: 0,
            people_num: 1,
            sg_schedule_last_dailies_date: '',
            sg_schedule_last_dailies_date_color: '#ff5200',
            resource_progress: level_2.task_progress ? level_2.task_progress : '0%',
          }
          
          events.push(arr);
        })
        level_1.is_start_num = is_start_num_level_1
        level_1.is_final_num = is_final_num_level_1
        level_1.is_total_num = is_total_num_level_1

        
        level_1.count = task_progress_list_level_1.length;
        level_1.task_progress = Math.floor(task_progress_list_level_1.reduce((c, item) => c * 1 + item, 0) * 1 / level_1.count   *1000)/1000 + '%';
        
        level_1.progress = level_1.is_total_num !== '0' && level_1.is_final_num !== '0' ? Math.floor(level_1.is_final_num * 1 / level_1.is_total_num *100)/100 * 100 + '%' : '0%';
        let max = '';
        if(end_list_level_1.length > 0){
          max = end_list_level_1.reduce(function(a,b){ 
            return b > a ? b : a; 
          });
        }
        let min = '';
        if(start_list_level_1.length > 0) {
          min = start_list_level_1.reduce(function(a,b){ 
            return b < a ? b : a; 
          });
        }
        const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
        const arr = {
          id: level_1.id + 'level_1',
          resourceId: level_1.id,
          title_oldvalue: '',
          start: min,
          end: max,
          department_name: '',
          editable: false,
          progress: 100,
          title: min + '-' + max_shotgun,
          color: '#3BB2E3',
          link_name: '',
          duration: 0,
          people_num: 1,
          sg_schedule_last_dailies_date: '',
          sg_schedule_last_dailies_date_color: '#ff5200',
          resource_progress: level_1.task_progress ? level_1.task_progress : '0%',
        }
        
        events.push(arr);
      })
    }
    if(group_id === 'sequence' || group_id === 'asset_type') {
      resource.map(level_1 => {
        const start_list = [];
        const end_list = [];
        const task_progress_list_level_1 = [];
        level_1.children.map(item_shot => {
          //console.log('item_shot99', item_shot);return;
          // is_start_num += item.is_start_num * 1
          // is_final_num += item.is_final_num * 1
          // is_total_num += item.is_total_num * 1
          const start_list_shot = [];
          const end_list_shot = [];
          item_shot.children.map(item_link => {
            let duration = 0;
            //const lingxing = [];
            const task_assignees = []
            item_link.children.map(item_event => {
              if(item_event.task_assignees) {
                task_assignees.push(item_event.task_assignees)
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
                id: item_event.id + 'event',
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
                sg_schedule_last_dailies_date: ctx.helper.formatTime(item_event.plan_end_time),
                sg_schedule_last_dailies_date_color: '#ff5200',

              }
              const arr_zhenghe = {
                id: item_event.id + 'event',
                resourceId: item_event.id,
                title_oldvalue: item_event.description ? item_event.description : '暂无描述信息',
                start: item_event.plan_start_time ? ctx.helper.formatTime(item_event.plan_start_time) : '',
                end: item_event.plan_end_time ? ctx.helper.formatTime(item_event.plan_end_time) : '',
                department_name: '',
                editable: false,
                progress,
                title: step_short_name_list[item_event.link_name],
                color: setps[item_event.link_name],
                link_name: item_event.link_name,
                duration: duration_real,
                people_num: 1,
                sg_schedule_last_dailies_date: ctx.helper.formatTime(item_event.plan_end_time),
                sg_schedule_last_dailies_date_color: '#ff5200',

              }
              const zhenghe_start = ctx.helper.getUpTime(1, arr_zhenghe.end, 'has');
              arr_zhenghe.id = item_shot.id + 'shot_asset_shap';
              arr_zhenghe.resourceId = item_shot.id,
              arr_zhenghe.start = arr_zhenghe.end = zhenghe_start;
              arr_zhenghe.className = ['signbase_Event'];
              events.push(arr);
              if(zhenghe_start) {
                events.push(arr_zhenghe);
              }
              
              if(arr.start) {
                start_list.push(arr.start)
                start_list_shot.push(arr.start)
              }
              
              end_list.push(arr.end)
              end_list_shot.push(arr.end)
              task_progress_list_level_1.push(item_event.progress);
              item_event.duration = duration_real
            })
            item_shot.duration = duration;
            item_shot.task_assignees = Array.from(new Set(task_assignees)).join();
          })
          let max = '';
          if(end_list_shot.length > 0){
            max = end_list_shot.reduce(function(a,b){ 
              return b > a ? b : a; 
            });
          }
          let min = '';
          if(start_list_shot.length > 0) {
            min = start_list_shot.reduce(function(a,b){ 
              return b < a ? b : a; 
            });
          }
          const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
          const arr = {
            id: item_shot.id + 'shot_asset',
            resourceId: item_shot.id,
            title_oldvalue: '',
            start: min,
            end: max,
            department_name: '',
            editable: false,
            progress: 100,
            title: min + '-' + max_shotgun,
            color: '#3BB2E3',
            link_name: '',
            duration: 0,
            people_num: 1,
            sg_schedule_last_dailies_date: '',
            sg_schedule_last_dailies_date_color: '#ff5200',
          }
          
          events.push(arr);
        })

        level_1.count = task_progress_list_level_1.length;
        level_1.task_progress = Math.floor(task_progress_list_level_1.reduce((c, item) => c * 1 + item, 0) * 1 / level_1.count   *1000)/1000 + '%';

        level_1.progress = level_1.is_total_num !== '0' && level_1.is_final_num !== '0' ? Math.floor(level_1.is_final_num * 1 / level_1.is_total_num *100)/100 * 100 + '%' : '0%';
        //console.log(99999999, start_list, end_list);return;
        const max = end_list.reduce(function(a,b){ 
          return b > a ? b : a; 
        });
        let min = '';
        if(start_list.length > 0) {
          min = start_list.reduce(function(a,b){ 
            return b < a ? b : a; 
          });
        }
        const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
        const arr = {
          id: level_1.id + 'category_sequence_asset_type',
          resourceId: level_1.id,
          title_oldvalue: '',
          start: min,
          end: max,
          department_name: '',
          editable: false,
          progress: 100,
          title: min + '-' + max_shotgun,
          color: '#3BB2E3',
          link_name: '',
          duration: 0,
          people_num: 1,
          sg_schedule_last_dailies_date: '',
          sg_schedule_last_dailies_date_color: '#ff5200',
          resource_progress: level_1.task_progress,
        }
        
        events.push(arr);
        return level_1;
      })
        
    }
    //return
    if(group_id === 'shot_name' || group_id === 'asset_name') {
      resource.map(item => {
        
        //item.progress22 = 0;
        const start_list = [];
        const end_list = [];
        item.progress_list = [];
        item.children.map(item_shot => {
            if(item.id === 13125) {
              console.log('item_shot', item_shot);
            }
            item.progress_list.push(item_shot.progress);
            let duration = 0;
            //const lingxing = [];
            const task_assignees = []
            item_shot.children.map(item_event => {
              if(item_event.task_assignees) {
                task_assignees.push(item_event.task_assignees)
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
                id: item_event.id + 'event',
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
                sg_schedule_last_dailies_date: item_event.final_date,
                sg_schedule_last_dailies_date_color: '#ff5200',
              }
              const arr_zhenghe = {
                id: item_event.id + 'event',
                resourceId: item_event.id,
                title_oldvalue: item_event.description ? item_event.description : '暂无描述信息',
                start: item_event.plan_start_time ? ctx.helper.formatTime(item_event.plan_start_time) : '',
                end: item_event.plan_end_time ? ctx.helper.formatTime(item_event.plan_end_time) : '',
                department_name: '',
                editable: false,
                progress,
                title: step_short_name_list[item_event.link_name],
                color: setps[item_event.link_name],
                link_name: item_event.link_name,
                duration: duration_real,
                people_num: 1,
                sg_schedule_last_dailies_date: ctx.helper.formatTime(item_event.plan_end_time),
                sg_schedule_last_dailies_date_color: '#ff5200',

              }
              const zhenghe_start = ctx.helper.getUpTime(1, arr_zhenghe.end, 'has');
              arr_zhenghe.id = item.id + 'shot_asset_huizong',
              arr_zhenghe.resourceId = item.id;
              arr_zhenghe.start = arr_zhenghe.end = zhenghe_start;
              arr_zhenghe.className = ['signbase_Event'];
              events.push(arr);
              if(zhenghe_start) {
                events.push(arr_zhenghe);
              }
              

              if(arr.start) {
                start_list.push(arr.start)
              }
              
              end_list.push(arr.end)
              item_event.duration = duration_real
            })
            item_shot.duration = duration;
            item_shot.task_assignees = Array.from(new Set(task_assignees)).join();
        })
        let sum = 0;
        item.progress = item.progress_list.reduce(function(pre,curr) {
                    sum=pre * 1+curr * 1;
                    return sum;
                    });
        const max = end_list.reduce(function(a,b){ 
          return b > a ? b : a; 
        });
        let min = '';
        if(start_list.length > 0) {
          min = start_list.reduce(function(a,b){ 
            return b < a ? b : a; 
          });
        }
        const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
        const arr = {
          id: item.id + 'shot_asset',
          resourceId: item.id,
          title_oldvalue: '',
          start: min,
          end: max,
          department_name: '',
          editable: false,
          progress: 100,
          title: min + '-' + max_shotgun,
          color: '#3BB2E3',
          link_name: '',
          duration: 0,
          people_num: 1,
          sg_schedule_last_dailies_date: '',
          sg_schedule_last_dailies_date_color: '#ff5200',
        }
        
        events.push(arr);
        return item;
      })
    
    }
    if(group_id === 'link_name' || group_id === 'link_name_shotgun') {
      resource.map(item => {
        
        const start_list = [];
        const end_list = [];
        let duration = 0;
        //const lingxing = [];
        const task_assignees = []
        item.children.map(item_event => {
          if(item_event.task_assignees) {
            task_assignees.push(item_event.task_assignees)
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
            id: item_event.id + 'event',
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
            sg_schedule_last_dailies_date: ctx.helper.formatTime(item_event.plan_end_time),
            sg_schedule_last_dailies_date_color: '#ff5200',
          }
          events.push(arr);
          if(arr.start) {
            start_list.push(arr.start)
          }
          
          end_list.push(arr.end)
          item_event.duration = duration_real
        })
        item.duration = duration;
        item.task_assignees = Array.from(new Set(task_assignees)).join();
        
        const max = end_list.reduce(function(a,b){ 
          return b > a ? b : a; 
        });
        let min = '';
        if(start_list.length > 0) {
          min = start_list.reduce(function(a,b){ 
            return b < a ? b : a; 
          });
        }
        const max_shotgun = ctx.helper.getUpTime(1, max, 'has');
        const arr = {
          id: item.id + 'link_shotgun123',
          resourceId: item.id,
          title_oldvalue: '',
          start: min,
          end: max,
          department_name: '',
          editable: false,
          progress: 100,
          title: min + '-' + max_shotgun,
          color: '#3BB2E3',
          link_name: '',
          duration: 0,
          people_num: 1,
          sg_schedule_last_dailies_date: '',
          sg_schedule_last_dailies_date_color: '#ff5200',
          resource_progress: item.task_progress,
        }
        
        events.push(arr);

        return item;
      })
    }
    let sort_resource = new_resource_page;
    // if(params.sorts === 'duration') {
    //   sort_resource = ctx.helper.listSortBy(tree_resource, params.sorts, params.order);
    // }

    // let resourceorder = 1;
    // sort_resource.map( item => {
      
    //   item.resourceorder = resourceorder;
    //   resourceorder++;
    // })
		// 对events
    // 获取数据库得events
    const events_role = []
    const event_sql_list = await ctx.service.plan.event.getList();
    event_sql_list.rows.map( item => {
      item.resourceId = item.shots_uuid;
      item.start = ctx.helper.formatTime(item.start_at)
      item.end = ctx.helper.formatTime(item.end_at)
      item.title = item.content;
      item.id = item.uuid;
      item.className = [item.shap];
      //item.tips = item.title;
      //item.title = '';
      events.push(item);
      events_role.push(item.uuid)
    })

    // 对event 按照颜色分组
    let maps = [];
    
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
        "title": "环节",
        "description": "环节",
        "key": "9e04dcb2-8fdc-4ce3-aa72-1241d52498bf",
        "field": "link_name",
        "headerContent": "环节",
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
        "title": "任务名",
        "description": "任务名",
        "key": "9e04dcb2-8fdc-4ce3-aa72-1241d52498b1",
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
        "title": "描述",
        "description": "描述",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339a11",
        "field": "description",
        "headerContent": "描述",
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
        "title": "缩略图",
        "description": "缩略图",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339a12",
        "field": "image",
        "headerContent": "缩略图",
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
      //   "title": "帧数",
      //   "description": "帧数",
      //   "key": "a160f36f-ef19-43b5-9ba6-feccdc339a13",
      //   "field": "sg_cut_duration",
      //   "headerContent": "帧数",
      //   "width": "100px",
      //   "disabled": false,
      //   "headerClassNames": [
      //     "resource_header_name"
      //   ],
      //   "cellClassNames": [
      //     "resource_content_name"
      //   ]
      // },
      {
        "title": "制作方",
        "description": "制作方",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339ae3",
        "field": "task_assignees",
        "headerContent": "制作方",
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
        "title": "状态",
        "description": "状态",
        "key": "a160f36f-ef19-43b5-9ba6-feccdc339a24",
        "field": "status",
        "headerContent": "状态",
        "width": "100px",
        "disabled": false,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      }
      
    ];
    //console.log('group_id', group_id);return;
    if(model === 'shot') {
      resourceAreaColumns.unshift({
        "title": "镜头",
        "description": "镜头",
        "key": "5b63639f-7e61-4c88-9eec-a90b1522f31d",
        "field": "shot_name",
        "headerContent": "镜头",
        "width": "100px",
        "disabled": true,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      })
    }
    if(model === 'asset') {
      resourceAreaColumns.unshift({
        "title": "资产",
        "description": "资产",
        "key": "5b63639f-7e61-4c88-9eec-a90b1522f311",
        "field": "asset_name",
        "headerContent": "资产",
        "width": "150px",
        "disabled": true,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      })
    }
    if(group_id === 'category_name') {
      
      resourceAreaColumns.unshift(
        {
          "title": "一级分类",
          "description": "一级分类",
          "key": "f5c47237-e255-4d1d-ad09-78f43464a1q1",
          "field": "category_name_parent_name_level_1",
          "headerContent": "一级分类",
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
          "title": "二级分类",
          "description": "二级分类",
          "key": "f5c47237-e255-4d1d-ad09-78f43464a1q2",
          "field": "category_name_parent_name_level_2",
          "headerContent": "二级分类",
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
          "title": "分类",
          "description": "分类",
          "key": "f5c47237-e255-4d1d-ad09-78f43464a1a3",
          "field": "category_name",
          "headerContent": "分类",
          "width": "100px",
          "disabled": false,
          "headerClassNames": [
            "resource_header_name"
          ],
          "cellClassNames": [
            "resource_content_name"
          ]
        },
      )
    }
    if(group_id === 'sequence') {
      resourceAreaColumns.unshift(
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
      )
    }
    if(group_id === 'asset_type') {
      resourceAreaColumns.unshift(
        {
          "title": "资产类型",
          "description": "资产类型",
          "key": "a160f36f-ef19-43b5-9ba6-feccdc339123",
          "field": "asset_type",
          "headerContent": "资产类型",
          "width": "100px",
          "disabled": false,
          "headerClassNames": [
            "resource_header_name"
          ],
          "cellClassNames": [
            "resource_content_name"
          ]
        },
      )
    }
    if(group_id === 'link_name_shotgun') {
      resourceAreaColumns.push(
        {
          "title": "进度百分比",
          "description": "进度百分比",
          "key": "a160f36f-ef19-43b5-9ba6-feccdc339a16",
          "field": "progress",
          "headerContent": "进度百分比",
          "width": "100px",
          "disabled": false,
          "headerClassNames": [
            "resource_header_name"
          ],
          "cellClassNames": [
            "resource_content_name"
          ]
        },{
        "title": "Shotgun Proportion",
        "description": "Shotgun Proportion",
        "key": "5b63639f-7e61-4c88-9eec-a90b1522f99d",
        "field": "link_progress",
        "headerContent": "Shotgun Proportion",
        "width": "100px",
        "disabled": true,
        "headerClassNames": [
          "resource_header_name"
        ],
        "cellClassNames": [
          "resource_content_name"
        ]
      })
    } else if(group_id === 'category_name' || group_id === 'sequence' || group_id === 'asset_type') {
      resourceAreaColumns.push(
        {
          "title": "导演通过数/镜头总数",
          "description": "导演通过数/镜头总数",
          "key": "a160f36f-ef19-43b5-9ba6-feccdc339a16",
          "field": "progress",
          "headerContent": "导演通过数/镜头总数",
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
          "title": "镜头总数",
          "description": "镜头总数",
          "key": "a160f36f-ef19-43b5-9ba6-feccdc339ar4",
          "field": "is_total_num",
          "headerContent": "镜头总数",
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
          "title": "已开始数",
          "description": "已开始数",
          "key": "a160f36f-ef19-43b5-9ba6-feccdc339a34",
          "field": "is_start_num",
          "headerContent": "已开始数",
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
          "title": "导演通过数",
          "description": "导演通过数",
          "key": "a160f36f-ef19-43b5-9ba6-feccdc339a44",
          "field": "is_final_num",
          "headerContent": "导演通过数",
          "width": "100px",
          "disabled": false,
          "headerClassNames": [
            "resource_header_name"
          ],
          "cellClassNames": [
            "resource_content_name"
          ]
        }
      )
    }
    resourceAreaColumns.push(
      // {
      //   "title": "备注",
      //   "description": "备注",
      //   "key": "a160f36f-ef19-43b5-9ba6-feccdc339a15",
      //   "field": "remarks",
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
    )

    // 过滤得表头
    const init_key = []
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
      project,
      role: {
        resources_role: [],
        events_role,
      }

		}

    

		this.ctx.helper.success(ctx, 1, '成功', results);
	}

  async option() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.query;
    console.log(22222,ctx.request);
		//const schedule_uuid = '70caedef-e36c-497b-98d4-dffd5efe8c52';
    const schedeule_info = await ctx.service.plan.schedulemanage.getInfo(schedule_uuid);
    console.log(schedeule_info)
    const project = schedeule_info.project_name;
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
            "TWE2M"
        
          ],
          [
            "entity",
            "type_is",
            "Shot"
        
          ],
          [
            "sg_status_list",
            "is_not",
            "omt"
          ],
          [
            "sg_status_list",
            "is_not",
            "hold"
          ],
          [
            "sg_status_list",
            "is_not",
            "hor"
          ],
          [
            "sg_status_list",
            "is_not",
            "ho"
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
        "sg_status_list",
        "sg______tasklevel_",
        "sg_require_artist_level",
        "sg_plan_day",
        "task_assignees",
        "time_logs_sum",
        "sg_planday_suggestion",
        "start_date",
        "due_date",
        "duration"
        
      ]
    }`
     console.log(data)
    
    const sort_query = `&sort=${order}${sort}`
    const resList = [];
    const shotgunHost = this.config.shotgunHost;
    const shotgun_list = async  function(number) {
      const page = `?page[size]=3000&page[number]=${number}`
      
      const url_entity_search = `${shotgunHost}/api/v1/entity/Task/_search${page}`;
      console.log('url',  `${shotgunHost}/api/v1/entity/Task/_search${page}`)
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

  async create() {
    const { ctx } = this;
    const params = ctx.request.body;
    //const setting = JSON.parse(params.settings);
    if(params.uuid) {
      // schedule 创建
      const schedeule_arr = {
        project_name: JSON.stringify(params.project_name),
        //project_name: params.project_name,
        //retirement_status: '1',
        //created_user_uuid: uid,
        //created_user_name: name,
      }
      // schedeule_arr.setting = JSON.stringify({
      //   shot: params.shot,
      //   asset: params.asset,
      // })
      //console.log(schedeule_arr);return;
      const res = await ctx.service.plan.schedulemanage.update(params.uuid, schedeule_arr);

      ctx.helper.success(ctx, 1, '成功');
      return;
    }
    // schedule 创建
    const schedeule_arr = {
      //name: params.name,
      project_name: JSON.stringify(params.project_name),
      retirement_status: '1',
      //created_user_uuid: uid,
      //created_user_name: name,
      //shot: params.shot,
      //asset: params.asset,

    }
    // schedeule_arr.setting = JSON.stringify({
    //   shot: params.shot,
    //   asset: params.asset,
    // })
    
    //console.log(schedeule_arr);return;
    const res = await ctx.service.plan.schedulemanage.create(schedeule_arr);

    ctx.helper.success(ctx, 1, '成功', { uuid: res.dataValues.uuid, project_name: params.project_name})
  }

  async update() {
    const { ctx } = this;
    const params = ctx.request.body;
    //const setting = JSON.parse(params.settings);
    // schedule 创建
    const schedeule_arr = {
      name: params.name,
      //project_name: params.project_name,
      //retirement_status: '1',
      //created_user_uuid: uid,
      //created_user_name: name,
    }
    schedeule_arr.setting = JSON.stringify({
      shot: params.shot,
      asset: params.asset,
    })
    //console.log(schedeule_arr);return;
    const res = await ctx.service.plan.schedulemanage.update(params.uuid, schedeule_arr);

    ctx.helper.success(ctx, 1, '成功')
  }

  // 删除排期
  async del() {
    const { ctx, app } = this;
    let { validator } = app;
  
    const params = ctx.request.body;
    console.log('controller schedule destroy params', params)
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid; 
    const uuids = params.uuids;
    // 数据校验
    // const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // console.log('res11111111', res)
  
    try {
      // const arr_info = await ctx.service.bd.schedulebd.getInfoByUuids(uuids);
      // console.log('controller resource destroy arr_info', arr_info);
      // if (!arr_info) {
      //   ctx.helper.success(ctx, -1, '非法参数！')
      //   return
      // }
      // 更新数据
      const update_time = ctx.helper.getTime();
      const status = '3';
  
      const update_arr = {
        retirement_at: update_time,
        retirement_status: status
      }
  
      await ctx.service.plan.schedulemanage.updateByUuids(uuids, update_arr);

     
  
    } catch (error) {
     // console.log('controller resource destroy getInfo error', error);
      ctx.helper.success(ctx, -1, '非法参数！')
    }
    console.log('controller resource destroy end 成功');
    ctx.helper.success(ctx, 1, '成功')
  }

  // 计划列表
  async list() {
    const { ctx } = this;
    const params = ctx.request.query;

    const list = await ctx.service.plan.schedulemanage.list(params)

    list.rows.map( item => {
      item.project_name = JSON.parse(item.project_name);
      // const setting = JSON.parse(item.setting);
      // console.log('setting',setting)
      // if(setting.shot) {
      //   item.shot = setting.shot.map( item_set => {
      //     return item_set.name
      //   })
      // } else {
      //   item.shot = []
      // }
      
      // if(setting.asset) {
      //   item.asset = setting.asset.map( item_set => {
      //     return item_set.name
      //   })
      // } else {
      //   item.asset = []
      // }
      // item.setting = setting
      item.created_at = ctx.helper.formatTime(item.created_at)
    })

    const columns = [
      {
        key: 1,
        title: "编号",
        dataIndex: "id",
      },
      {
        key: 4,
        title: "项目",
        dataIndex: "project_name",
        scopedSlots: {customRender: "project_name"}
      },
      {
        key: 5,
        title: "创建时间",
        dataIndex: "created_at",
      },
      {
        key: 10,
        title: "操作",
        dataIndex: "action",
        fixid: "right",
        scopedSlots: { customRender: "action" },
      },
    ]
    list.columns = columns;

    ctx.helper.success(ctx, 1, '成功', list)
  }
}

module.exports = ShotgunController;