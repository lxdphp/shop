const Service = require('egg').Service;

const headers = {
	"Authorization": 'Bearer MTY1MTEyNjYyNC41NTI2MzY5Jjg1MWUxOWUyNWZjYmU2ZTAzNTdhMjZhNDI0MjQ5NmY2OTVhYmZmN2FmYWJjZDc5MjAzNGU1MWE4ZDg5ZjU1NWU=',
	"Content-Type": "application/json",
}

class ShotgunService extends Service {

	async getAxcessToken() {
		const { ctx } = this;

    const redis_key = 'schedule:shotgun_user_token';
    //const res = await ctx.service.redis.get(redis_key);
    
    let token = '';
    //if(res) {
    //  token = res;
   // } else {
      const data = {
        grant_type: 'password',
        username: 'lingxiao',
        password: 'ling0310?!',
      }
      const url = `${this.config.shotgunHost}/api/v1/auth/access_token`;
  
      //try {
        const res = await ctx.curl(url, {
          dataType: 'json',
          data,
          method: 'POST',
        });
        //await ctx.service.redis.set(redis_key, res.data.access_token, 40);
        token = res.data.access_token
     // } catch (error) {
        //console.log('service shotgun getAxcessToken error: ', error);
      
      //}
    //}
    return token;		
	}

	async getProjectList() {
		const { ctx } = this;
		const resAccesstoken = await ctx.service.bd.shotgun.getAxcessToken();
		const token = resAccesstoken;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}
		const fields = '?fields=name'
		const filter = '&filter[sg_production_or_not]=商业项目'
		const url2 = `${this.config.shotgunHost}/api/v1/entity/Project/${fields}${filter}`;
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
				name: item.attributes.name,
			})
		})
		return resq;
		this.ctx.helper.success(ctx, 1, '成功', resq);
	}

	async getStepList(type = '') {
		const { ctx } = this;
		const resAccesstoken = await ctx.service.bd.shotgun.getAxcessToken();
		const token = resAccesstoken;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}
		const fields = '?fields=*'
		const filter = '&filter[entity_type]=Shot,Asset'
		const url2 = `${this.config.shotgunHost}/api/v1/entity/Step/${fields}${filter}`;
	  
    try {
      const res2 = await ctx.curl(url2, {
        dataType: 'json',
        headers,
      });

      const list = res2.data.data;
    
      const resq = [];
      const map = [];
      list.map(item => {
        resq.push({
          //id: item.id,
          value: item.attributes.code,
          label: item.attributes.code,
          disabled: false,
          color: ctx.helper.setRgbTo16(`rgb(${item.attributes.color})`),
          short_name: item.attributes.short_name,
        })

        const { entity_type } = item.attributes;
        if (!map[entity_type]) {
          map[entity_type] = {
            children: [],
            entity_type,
          }
        }
        map[entity_type].children.push(item.attributes.code);
        
      })
      //console.log(map['Shot']);return
      const new_res = Object.values(map);
      const group_list = {}
      new_res.map( item => {
        group_list[item.entity_type] = item.children;
      })

      if(type) {
        return group_list;
      }
      return resq
		  
    } catch (error) {
      return [];
    }
		
		
	}

  async getLinkProgress(project_name) {
    const { ctx } = this;
		const resAccesstoken = await ctx.service.bd.shotgun.getAxcessToken();
		const token = resAccesstoken;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}
		const fields = '?fields=*'
		const filter = '&filter[project.Project.name]=TWE2M'
		const url2 = `${this.config.shotgunHost}/api/v1/entity/CustomEntity17/${fields}${filter}`;
    try {
      const res2 = await ctx.curl(url2, {
        dataType: 'json',
        headers,
      });

      const list = res2.data.data;
    
      const resq = [];
      const map = [];
      list.map(item => {
        resq.push({
          id: item.id,
          link_name: item.relationships.sg_steps.data.map( item => {
            return item.name;
          }),
          // link_id: item.relationships.sg_step.data.id,
          step_progress: item.attributes.sg_proportion,
          code: item.attributes.code,
          step_type: item.attributes.sg_entity_type,
        })
      })
      //console.log('error', res2.data)
      return resq
		  
    } catch (error) {
      console.log('error', error)
      return [];
    }
  }

  async getStatusList(type = '') {
		const { ctx } = this;
		const resAccesstoken = await ctx.service.bd.shotgun.getAxcessToken();
		const token = resAccesstoken;
		const headers = {
			Authorization: 'Bearer ' + token,
			'Accept': 'application/json',
		}
		const fields = '?fields=*'
		const filter = '&filter[sg_fuction]=Task Status,No Fuction'
		const url2 = `${this.config.shotgunHost}/api/v1/entity/Status/${fields}${filter}`;
    try {
      const res2 = await ctx.curl(url2, {
        dataType: 'json',
        headers,
      });

      const list = res2.data.data;
    
      const resq = [];
      const map = [];
      list.map(item => {
        resq.push({
          id: item.id,
          name: item.attributes.name,
          code: item.attributes.code,
          sg_progress: item.attributes.sg_progress,
          sg_progress_statue: item.attributes.sg_progress_statue,
        })
        
      })
      
      return resq
		  
    } catch (error) {
      return [];
    }
		
		
	}

  async getShotNum(project_name) {
    const { ctx } = this;
		const resAccesstoken = await ctx.service.bd.shotgun.getAxcessToken();
		const token = resAccesstoken;
		const headers_post = {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/vnd+shotgun.api3_hash+json',
			'Accept': 'application/json',
		}


		// 获取shotgun 的所有分类
    const page = `?page[size]=5000&page[number]=1`
    const sort = '&sort=id'
    const url_category = `${this.config.shotgunHost}/api/v1/entity/Shot/_search${page}${sort}`;
    const data_shotgun_category_params =  `{
      "filters": {
        "logical_operator": "and",
        "conditions": [
         
          [
            "project.Project.name",
            "is",
            "${project_name}"
          ]
        ]
      },
      "fields": [
        "image",
        "code",
        "sg_status_list",
        "description",
        "sg_cut_duration",
        "step_0",
        "sg_epibolys",
        "sg_supervisor_notes",
        "sg_ppm_notes",
        "sg_fs_status",
        "sg_category.CustomEntity26.code",
        "sg_category.CustomEntity26.id",
        "project.Project.code",
        "project.Project.id",
        "id"
      ]
    }` 
    console.log(data_shotgun_category_params);
   
    try {
      const res = await ctx.curl(url_category, {
        dataType: 'json',
        headers: headers_post,
        data: data_shotgun_category_params,
        method: 'POST',
      });
      console.log(res.data);
      //return res.data.data;
      let map = [];
      if(res.data.data.length === 0) {
        return [];
      }
      const list = []
      res.data.data.map( item => {
        list.push({
          category_name: item.attributes['sg_category.CustomEntity26.code'] ? item.attributes['sg_category.CustomEntity26.code'] : '',
          id: item.id
        })
      })
      list.map( item => {
        const { category_name } = item;
        if (!map[category_name]) {
          map[category_name] = {
            category_name,
            children: [],
            count: 0,
          }
        }
        map[category_name].children.push(item);
        map[category_name].count = map[category_name].children.length;
      })
    const new_res = Object.values(map);
    const tongji = {}
    new_res.map( item => {
      tongji[item.category_name] = item.count;
    })
    return tongji;
    } catch (error) {
      console.log('error', error);
    }
    
  }

}
module.exports = ShotgunService;

