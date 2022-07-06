const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class ShotgunController extends Controller {
	async index() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.query;
		const { project, schedule_uuid } = params;
		if (!project) {
			this.ctx.helper.success(ctx, 1, '成功'); return;
		}
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
    
    const data = `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "project.Project.name",
            "is",
            "${project}"
        
          ]
    
        
        ]
      },
      "grouping": [
        {
          "column": "entity.Asset.code",
          "method": "exact",
          "direction": "asc"
        }],
        "sorts": [
          {
            "column": "sg_description",
            "direction": "desc"
          }
        ],
      "fields": [
        "entity.Asset.image",
        "entity.Shot.tags",
        "entity.Asset.sg_category.CustomEntity26.code",
        "entity.Shot.sg_category.CustomEntity26.code",
        "entity.Shot.sg_episodes",
        "entity",
        "entity.Asset.description",
        "step",
        "content",
        "sg_description",
        "sg_status_list",
        "sg_task_progress",
        "task_assignees",
        "start_date",
        "sg_schedule_last_dailies_date",
        "due_date",
        "duration",
        "sg_plan_day",
        "time_logs_sum",
        "sg_hero_shot",
        "sg_follow_shots",
        "tags",
        "entity.Shot.id",
        "entity.Shot.code",
        "start_date",
        "due_date",
        "duration",
        "sg_status_list",
        "color",
        "task_assignees",
        "milestone",
        "project",
        "dependency_violation",
        "sg_timelogdivionplanday",
        "sg_timelog_vs_planday",
        "id",
        "pinned",
        "upstream_tasks",
        "downstream_tasks",
        "inventory_date",
        "splits",
        "entity.Asset.code"
      ]
    }`
    const sort = '&sort=sg_description'
    const resList = [];
    const shotgunHost = this.config.shotgunHost;
    const shotgun_list = async  function(number) {
      const page = `?page[size]=1000&page[number]=${number}`
      
      const url_entity_search = `${shotgunHost}/api/v1/entity/Task/_search${page}${sort}`;
      
      const res2 = await ctx.curl(url_entity_search, {
        dataType: 'json',
        headers,
        method: 'POST',
        data
      });
      const list = res2.data.data;
      list.map( item => {
        resList.push(item);
      })
      if(list.length > 0) {
        number += 1;
        await shotgun_list(number);
      }
    }
		const reslist = await shotgun_list(1);
    // const page = '?page[size]=1000&page[number]=1'
		

		// const filter = '&filter[duration]=24';
		//return;

		// const url_entity_search = `${this.config.shotgunHost}/api/v1/entity/Task/_search${page}${sort}`;
		// const res2 = await ctx.curl(url_entity_search, {
		// 	dataType: 'json',
		// 	headers,
		// 	method: 'POST',
		// 	data
		// });
		// const aa = res2.data.data;
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
			const arr = {
				category_name,
				shot_name: item.attributes['entity.Shot.code'] ? item.attributes['entity.Shot.code'] : item.attributes['entity.Asset.code'],
				link_name: item.relationships.step.data.name,
				link_uuid: item.relationships.step.data.id,
				plan_start_time: item.attributes.start_date,
				plan_end_time: item.attributes.due_date,
				duration: item.attributes.duration,
				description: item.attributes.sg_description,
			}
			arr.group_name = arr.category_name + '_' + arr.link_name;
			resq.push(arr);
		})

		//分组 
		let map = [];
		resq.map(item => {
			const { group_name } = item;
			if (!map[group_name]) {
				map[group_name] = {
					category_name: item.category_name,
					link_name: item.link_name,
					children: [],
				}
			}
			map[group_name].children.push(item);
		})
		const new_resource = Object.values(map);
		//this.ctx.helper.success(ctx, 1, '成功', new_resource);return;
		//整理数据 添加父子关系
		for (const item of new_resource) {

			let parent_id = '';
			// 获取分类 
			const params = {
				category_name: item.category_name,
				schedule_uuid,
				parent_id: 0,
			}
			const category_info = await ctx.service.bd.shot.getInfoByParams(params);
			//console.log('haha', category_info);return;
			if (category_info) {
				// 获取环节 分类 
				const params = {
					category_name: item.category_name,
					link_name: item.link_name,
					parent_id: category_info.id,
					schedule_uuid,
				}
				const parent_info = await ctx.service.bd.shot.getInfoByParams(params);
				//console.log('haha', params, parent_info);return;
				if (parent_info) {
					parent_id = parent_info.id;
				} else {
					const shot_link = {
						category_name: item.category_name,
						schedule_bd_uuid: schedule_uuid,
						member_name: '',
						shot_name: '-',
						created_user_uuid: uid,
						link_uuid: item.link_uuid,
						link_name: item.link_name,
						parent_id: category_info.id,
					}
					const res_shot_link = await ctx.service.bd.shot.create(shot_link);
					parent_id = res_shot_link.id;
				}
				//console.log('params', params);return;
			} else {
				//add 
				const shot_category = {
					category_name: item.category_name,
					schedule_bd_uuid: schedule_uuid,
					member_name: '',
					shot_name: '-',
					created_user_uuid: uid,
					link_name: '',
					parent_id: 0,
				}
				const res_shot_category = await ctx.service.bd.shot.create(shot_category);
				const shot_link = {
					category_name: item.category_name,
					schedule_bd_uuid: schedule_uuid,
					member_name: '',
					shot_name: '-',
					created_user_uuid: uid,
					link_uuid: item.link_uuid,
					link_name: item.link_name,
					parent_id: res_shot_category.id,
				}
				const res_shot_link = await ctx.service.bd.shot.create(shot_link);
				parent_id = res_shot_link.id;
			}
			//console.log('parent_id', parent_id);return;
			//console.log('parent_info', parent_info);return;
			// 删除相关event
			// 获取所有得镜头 uuids  并删除
			// 获取所有得events uuids 并 删除
			const parent_params = {
				parent_id,
			}
			const shot_uuids_list = await ctx.service.bd.shot.getInfoByParams(parent_params, 'list');
			const shot_uuids = shot_uuids_list.rows.map(item => {
				return item.uuid;
			})
			console.log('shot_uuids', shot_uuids);
			if (shot_uuids.length > 0) {
				await ctx.service.bd.shot.delByUuids(shot_uuids);
			}
      
			//console.log('parent_info', parent_info);return;
			for (const tt of item.children) {
				console.log('tt.shot_name', tt.shot_name, tt)
				// 判断是否是同一个 shot_name
				const params = {
					category_name: item.category_name,
					shot_name: tt.shot_name,
					schedule_uuid,
          parent_id,
				}
				const shot_info = await ctx.service.bd.shot.getInfoByParams(params);
				console.log(shot_info, params);
				//return;
				let shots_uuid = '';
				if (shot_info) {
					shots_uuid = shot_info.uuid;
				} else {
					// 插入 shots
					const shot_arr = {
						category_name: item.category_name,
						schedule_bd_uuid: schedule_uuid,
						member_name: '',
						created_user_uuid: uid,
						link_uuid: 0,
						link_name: tt.link_name,
						parent_id,
						shot_name: tt.shot_name,
						from: 'shotgun',
					}

					const res_shot_arr = await ctx.service.bd.shot.create(shot_arr);
					shots_uuid = res_shot_arr.uuid;
				}
				// 插入 events_bd
				// 插入 map 关系表 hour
				let duration = 0;
				if (tt.plan_start_time && tt.plan_end_time) {
					duration = (ctx.helper.getDateDiff(tt.plan_start_time, tt.plan_end_time, 'day') + 1) * 1 * 8;
				}

				const progress = tt.duration ? (tt.duration * 1 / 60 / duration * 1).toFixed(2) * 100 : 100;

				const events = {
					schedule_bd_uuid: schedule_uuid,
					shots_uuid,
					start_at: tt.plan_start_time,
					end_at: tt.plan_end_time,
					content: tt.description,
					from: 'shotgun',
					//duration,
					duration: tt.duration ? tt.duration * 1 / 60 / 8 : 0,
					progress,
					created_user_uuid: uid,
					color: '#db591b',
				}
				// if(events.duration * 1 === 1) {
				//   console.log(ctx.helper.getDateDiff('2021-07-26', '2021-07-27', 'day'))
				//   console.log('haha', tt,duration ,tt.duration * 1 / 60 / duration * 1, (tt.duration * 1 / 60 / duration * 1).toFixed(2))
				// }
				if (tt.plan_start_time) {
					//	console.log('events', events); return;
				}

				const res_event = await ctx.service.bd.event.create(events);
				const map = {
					shots_uuid,
					events_bd_uuid: res_event.uuid,
				}
				await ctx.service.bd.event.createMap(map);
			}
		}

		//
		// //获取最大结束，最小开始时间
		// const date_max_min = await ctx.service.bd.event.getDateMaxMin(schedule_uuid);
		// const end = date_max_min.end !== null ? date_max_min.end : '';
		// const end_date = ctx.helper.getNextTime(60, end);
		// const start_date = ctx.helper.getUpTime(6, date_max_min.start);;
		// console.log('controller event create date_max_min', date_max_min);
		// const schedule_arr = {
		//   plan_start_at: start_date,
		//   plan_end_at: end_date,
		// }
		// await ctx.service.bd.schedulebd.update(schedule_uuid, schedule_arr);

		this.ctx.helper.success(ctx, 1, '成功');
	}

	async import_shotgun() {
		const { ctx, app } = this;
		let { validator } = app;
		const params = ctx.request.body;
		const { project, schedule_uuid, link_list } = params;
		if (!project) {
			this.ctx.helper.success(ctx, 1, '成功'); return;
		}
    
    // 默认环节加排序
    const link_sort_list = {
				"Layout": 1,
				"Animation": 2,
				"Effects": 3,
        "Lighting": 4,
        "Setup": 5,
				"Mattpainting": 6,
        "Compositing": 7,
      }

		//const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
		const token_info = await ctx.service.bd.shotgun.getAxcessToken();

		const token = token_info;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}

    const headers_post = {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/vnd+shotgun.api3_hash+json',
			'Accept': 'application/json',
		}


		// 获取shotgun 的所有分类
    const url_category = `${this.config.shotgunHost}/api/v1/entity/CustomEntity26/_search`;
    const data_shotgun_category_params =  `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "project.Project.name",
            "is",
            "${project}"
          ]
        ]
      },
      "fields": [
        "id",
        "code"
      ]
    }` 
    const res_category = await ctx.curl(url_category, {
			dataType: 'json',
			headers: headers_post,
      data: data_shotgun_category_params,
			method: 'POST',
		});
    const list = res_category.data.data;
    
		const resq_category = [];
		list.map(item => {
			resq_category.push({
				name: item.attributes.code,
        id: item.id,
			})
		})

		//console.log(res2.data);
		//this.ctx.helper.success(ctx, 1, '成功', resq_category); 
		//return;
    let resq_step = link_list;
    //console.log(resq_step);return;
    // 获取setp 信息
    const step_list = await ctx.service.bd.shotgun.getStepList();
    const setps = {}
    step_list.map( item => {
      setps[item.value] = item.color;
    })
		if(resq_category.length === 0) {
			// 只插入一组环节
			let parent_id = '';
			// 获取分类 
			const params = {
				category_name: '',
				schedule_uuid,
				parent_id: 0,
			}
			const category_info = await ctx.service.bd.shot.getInfoByParams(params);
			if (category_info) {
				parent_id = category_info.id;
				//console.log('params', params);return;
			} else {
				//add 
				const shot_category = {
					category_name: '',
					schedule_bd_uuid: schedule_uuid,
					member_name: '',
					shot_name: '-',
					created_user_uuid: uid,
					link_name: '',
					parent_id: 0,
				}
				const res_shot_category = await ctx.service.bd.shot.create(shot_category);
				parent_id = res_shot_category.id;
			}

			// 获取环节 分类 
			for (const item of resq_step) {
				// 获取环节 分类 
				const params = {
					category_name: '',
					link_name: item,
					parent_id,
					schedule_uuid,
				}
				const shot_info = await ctx.service.bd.shot.getInfoByParams(params);
				if(!shot_info) {
					const shot_link = {
						category_name: '',
						schedule_bd_uuid: schedule_uuid,
						member_name: '',
						shot_name: '-',
						created_user_uuid: uid,
						link_uuid: 0,
						link_name: item,
						parent_id,
            link_color: setps[item],
					}
					ctx.service.bd.shot.create(shot_link);
				}
			}
		} else {
			// 插入多组环节
      const shots_num_info = await ctx.service.bd.shotgun.getShotNum(project);
      //this.ctx.helper.success(ctx, 1, '成功', shots_num); return;
			for( const item of resq_category) {
        // 获取镜头数量
        
       
				let parent_id = '';
				// 获取分类 
				const params = {
					category_name: item.name,
          //category_id: item.id,
					schedule_uuid,
					parent_id: 0,
				}
				const category_info = await ctx.service.bd.shot.getInfoByParams(params);
				if (category_info) {
					parent_id = category_info.id;
          // 更新
          const update_arr = {
            shot_num: shots_num_info[item.name] || 0,
          }
          await ctx.service.bd.shot.update(category_info.uuid, update_arr);
					//console.log('params', params);return;
				} else {
					//add 
					const shot_category = {
						category_name: item.name,
            category_id: item.id,
						schedule_bd_uuid: schedule_uuid,
						member_name: '',
						shot_name: '-',
						created_user_uuid: uid,
						link_name: '',
						parent_id: 0,
            shot_num: shots_num_info[item.name] || 0,
            link_sort: 10000,
					}
					const res_shot_category = await ctx.service.bd.shot.create(shot_category);
					parent_id = res_shot_category.id;
				}
				console.log('parent_id2', parent_id);
				// 获取环节 分类 
				for (const step of resq_step) {
					// 获取环节 分类 
					const params = {
						category_name: item.name,
            //category_id: item.id,
						link_name: step,
						parent_id,
						schedule_uuid,
					}
					console.log('parent_id3', params);
					const shot_info = await ctx.service.bd.shot.getInfoByParams(params);
					if(!shot_info) {
						const shot_link = {
							category_name: item.name,
              category_id: item.id,
							schedule_bd_uuid: schedule_uuid,
							member_name: '',
							shot_name: '-',
							created_user_uuid: uid,
							link_uuid: 0,
							link_name: step,
              link_color: setps[step],
							parent_id,
              shot_num: shots_num_info[item.name] || 0,
              link_sort: link_sort_list[step] || 10000,
						}
						ctx.service.bd.shot.create(shot_link);
					} else {
            // 更新
          const update_arr = {
            shot_num: shots_num_info[item.name] || 0,
          }
          await ctx.service.bd.shot.update(shot_info.uuid, update_arr);
          }
				}
			}
		}

		this.ctx.helper.success(ctx, 1, '成功');
	}

	async getStepList() {
		const { ctx } = this;
		const data = {
			grant_type: 'password',
			username: 'lingxiao',
			password: 'ling0310?!',
		}
		const url = 'https://shotgun.morevfx.com/api/v1/auth/access_token';
		const res = await ctx.curl(url, {
			dataType: 'json',
			data,
			method: 'POST',
		});
		console.log('222222222222 getUsers res', res.data);
    this.ctx.helper.success(ctx, 1, '成功', res.data);return;
		const token = res.data.access_token;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}
		const fields = '?fields=*'
		const filter = '&filter[entity_type]=Shot'
		const url2 = `https://shotgun.morevfx.com/api/v1/entity/Step/${fields}`;
		// ${filter}
		console.log('url2', url2)
		const res2 = await ctx.curl(url2, {
			dataType: 'json',
			headers,
		});
		//console.log('222222222222 getUsers res2', res2.data);
		//console.log(333333333, tree_data);
		const list = res2.data.data;
		const resq = [];
		list.map(item => {
			resq.push({
				id: item.id,
				name: item.attributes.code,
        color: ctx.helper.setRgbTo16(`rgb(${item.attributes.color})`),
			})
		})
		this.ctx.helper.success(ctx, 1, '成功', resq);
	}

	async getProjectList() {
		const { ctx } = this;
		const token_info = await ctx.service.bd.shotgun.getAxcessToken();
		const token = token_info;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}
		const fields = '?fields=name'
		const filter = '&filter[sg_production_or_not]=商业项目'
		const url2 = `https://shotgun.morevfx.com/api/v1/entity/Project/${fields}${filter}`;
		console.log('url2', url2)
		const res2 = await ctx.curl(url2, {
			dataType: 'json',
			headers,
		});
		//console.log('222222222222 getUsers res2', res2.data);
		//console.log(333333333, tree_data);
		const list = res2.data.data;
		const resq = [];
		list.map(item => {
			resq.push(
				item.attributes.name,
			)
		})

		// 获取现有的所有项目
		//const projects = await ctx.service.bd.schedulebd.
		this.ctx.helper.success(ctx, 1, '成功', resq);
	}

  async createCategory(){
    const { ctx } = this;
    const params = ctx.request.query;
    const token_info = await ctx.service.bd.shotgun.getAxcessToken();
		const token = token_info;
    const project = params.project;
    const headers_post = {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/vnd+shotgun.api3_hash+json',
			'Accept': 'application/json',
		}

    // 获取所有的分类数据
    const schedule_params = {
      schedule_bd_uuid: params.schedule_uuid,
    }
    const list2 = await ctx.service.bd.shot.getScheduleOptions(schedule_params);
		//  
		const category = [];
		const category_id_list = {}
		list2.rows.map(item => {
			if (item.category_name) {
				category.push(item.category_name);
        if(item.category_id * 1 !== 0)
        category_id_list[item.category_name] = item.category_id;
			}
		})
    const category_name_list = Array.from(new Set(category));
    //this.ctx.helper.success(ctx, 1, '成功', category_name_list);return;
    // 获取shotgun 的所有分类
    const url_category = `${this.config.shotgunHost}/api/v1/entity/CustomEntity26/_search`;
    const data_shotgun_category_params =  `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "project.Project.name",
            "is",
            "${project}"
          ]
        ]
      },
      "fields": [
        "id",
        "code"
      ]
    }` 
    const res_category = await ctx.curl(url_category, {
			dataType: 'json',
			headers: headers_post,
      data: data_shotgun_category_params,
			method: 'POST',
		});
    const res_category_list = res_category.data;
    
    const shotgun_category_list = res_category_list.data.map( item => {
      return item.attributes.code;
    } )
		//this.ctx.helper.success(ctx, 1, '成功', shotgun_category_list);return;
    // 获取需要同步到shotgun的分类
    let dfrcset = [...category_name_list].filter(item => [...shotgun_category_list].every(i => i !== item));
    
    //console.log('dfrcset', dfrcset,category_name_list , shotgun_category_list);return;
    // 判断是否是编辑过得分类
    const edit_dfrcset = [], create_dfrcset = [];
    dfrcset.map( item => {
      if(category_id_list[item]) {
        edit_dfrcset.push({
          name: item,
          id:category_id_list[item],
        });
      } else {
        create_dfrcset.push(item);
      }
    })
    //console.log('edit_dfrcset', edit_dfrcset);
    //console.log('create_dfrcset', create_dfrcset);return;
    // 获取项目id
    const url_project = `${this.config.shotgunHost}/api/v1/entity/Project/_search`;
    const data = `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
          [
            "name",
            "is",
            "${project}"
          ]
        ]
      },
      "fields": [
        "id",
        "name",
        "image",
        "code",
        "sg_status",
        "sg_description",
        "sg_start",
        "sg_due",
        "sg_type",
        "updated_at",
        "updated_by",
        "is_template",
        "archived",
        "filmstrip_image"
      ]
    }`
    console.log(data);
    const res_project = await ctx.curl(url_project, {
			dataType: 'json',
			headers: headers_post,
      data: data,
			method: 'POST',
		});
    const res_project_info = res_project.data;
    const project_id = res_project_info.data[0].id;
    //this.ctx.helper.success(ctx, 1, '成功', res_project.data);return;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
      'Content-Type': 'application/json',
		}
    for(const item of create_dfrcset) {
      const category_data = {
        "project": {
          "type": "Project",
          "id": project_id,
          "name": project,
          },
        code: item
      }
      console.log(category_data)
      const url2 = `https://shotgun.morevfx.com/api/v1/entity/CustomEntity26`;
      // ${filter}
      console.log('url2', url2)
      const res2 = await ctx.curl(url2, {
        dataType: 'json',
        headers,
        data: category_data,
        method: 'POST',
      });
      console.log(res2.data)
    }
    if(edit_dfrcset.length > 0) {
      for(const item of edit_dfrcset) {
        const category_data = {
          code: item.name,
          
        }
        console.log(category_data)
        const url2 = `https://shotgun.morevfx.com/api/v1/entity/CustomEntity26/${item.id}`;
        // ${filter}
        console.log('url2', url2)
        const res2 = await ctx.curl(url2, {
          dataType: 'json',
          headers,
          data: category_data,
          method: 'PUT',
        });
        console.log('edit_dfrcset', res2.data)
      }
    }
    
    
    this.ctx.helper.success(ctx, 1, '成功');
  }
}

module.exports = ShotgunController;