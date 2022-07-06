'use strict';

const Service = require('egg').Service;

class EventService extends Service {


	//
	async create(params) {
		const res = this.ctx.model.EventsBd.create(params);

		return res;
	}

	async createMap(params) {
		const res = this.ctx.model.MapShotsEventsBdEvent.create(params);

		return res;
	}

	async update(uuid, params) {
		const res = this.ctx.model.EventsBd.update(
			params
			, {
				where: {
					uuid,
				}
			})

		return res;
	}

	async updateMap(uuid, params) {
		const res = this.ctx.model.MapShotsEventsBdEvent.update(
			params
			, {
				where: {
					events_bd_uuid: uuid,
				}
			})

		return res;
	}

	// 获取单条数据信息
	async getInfo(uuid) {
		const res = await this.ctx.model.EventsBd.findOne({
			where: {
				uuid,
			},
			raw: true,
		})
		return res;
	}

	// max min
	async getDateMaxMin(schedule_bd_uuid, resource_uuid = '') {
    const condition = {
      retirement_status: { [this.ctx.model.Sequelize.Op.ne]: '3' },
      from: '',
    }
    if(schedule_bd_uuid) {
      condition.schedule_bd_uuid = schedule_bd_uuid;
    }
    if(resource_uuid) {
      condition.shots_uuid = resource_uuid;
    }
		const res = await this.ctx.model.EventsBd.findOne({
			attributes: [[this.ctx.model.EventsBd.sequelize.fn('MAX', this.ctx.model.EventsBd.sequelize.col('end_at')), 'end'], [this.ctx.model.EventsBd.sequelize.fn('MIN', this.ctx.model.EventsBd.sequelize.col('start_at')), 'start']],
			raw: true,
			where: condition,
		})
		return res;
	}

	async getDaySummary(schedule_uuid, group = '', option = {}, publish = '') {
		const { ctx } = this;
		const params = {
      from: '',
      parent_id: -1,
		}
    if(publish) {
      const publish_projects = await ctx.service.bd.schedulebd.getPublishProjects();
      params.schedule_uuids = publish_projects.map( item => {
        return item.uuid;
      })
    } else {
      params.schedule_uuid = schedule_uuid;
    }
    if(option.link_name) {
      params.link_name_not_parent = option.link_name;
    }
    if(option.category_name) {
      params.category_name = option.category_name;
    }
		const limit = 10000;
		const offect = 1;
		const entity = 'shots';
		const properties = await ctx.service.pgsql.costomField(entity);
		const fieldss = [];
		const resource = await ctx.service.bd.shot.getShots(fieldss, params, limit, offect, properties.includes);
		const events = [];
		resource.rows.map(item => {
			//console.log(item);return;
			let duration = 0;
			item.events_bds.map(item_event => {
				duration += item_event.duration * 1;

				const arr = {
					id: item_event.uuid,
					resourceId: item.uuid,
					title: item_event.content,
					start: ctx.helper.formatTime(item_event.start_at),
					end: ctx.helper.formatTime(item_event.end_at),
					progress: item_event.progress,
          people_num: item_event.people_num,
				}
				events.push(arr);
			}
			)
			return item;
		})

    // 
    // 获取所有的假期
    const res = await ctx.service.day.getList([]);
    const holiday = [];
    res.rows.map( item => {
      item.start_at = ctx.helper.formatTime(item.start_at);
      holiday.push(item.start_at)
    })
    // 获取duration 所有的日期
    
    //console.log('holiday', holiday, duration_res, diff_duration);return;


		//对events
		const all_days = []
		events.map(item => {
			const arr = ctx.helper.getAllDays(item.start, item.end);
			const diff_arr = [...arr].filter(item => [...holiday].every(i => i !== item));
      

			diff_arr.map(it => {
				all_days.push({
					date: it,
					progress: item.progress * 1 * item.people_num / 100,
				})
			})

		})
		
		let result = {};
		all_days.forEach(item => {
			if (result[item.date]) {
				result[item.date] += item.progress.toFixed(2) * 100 / 100;

			} else {
				result[item.date] = item.progress * 1;
			}
		})

		if(group === 'week') {
			const byweek = [];
			all_days.map(function(value, index, array) {
				let ds = ctx.helper.getTimeByFour(value.date);
				const d = ctx.helper.computedWeek(ds);
				if (!byweek[d]) {
					byweek[d] = {
					week: d,
					list: [],
					}
				}
        console.log('aaaaaaa', d, value);
				byweek[d].list.push(value);
			});
			
			const new_byweek = Object.values(byweek);
			console.log('',);
			const byweek_sum = {};
			new_byweek.map(function(value, index, array) {
			  
				const arr = value.list.map( item => {
					//if(value.week === '2022-20') {
						//console.log('item', item);
					//}
					
					return item.progress
				})
				
				const sum = arr.reduce(function (prev, next, index, item) {
					return prev + next; //本次的返回值会作为下一次的prev
				})
				byweek_sum[value.week] = sum.toFixed(2) * 1;
			})
			return byweek_sum;
		}
		
		
		let s = {};
		for (let k in result) {
			s[k] = result[k].toFixed(2) * 1
		}
		console.log('s1', s);
		return s;
	}
}

module.exports = EventService;