const Service = require('egg').Service;

const headers = {
  "Authorization": 'Bearer MTY1MTEyNjYyNC41NTI2MzY5Jjg1MWUxOWUyNWZjYmU2ZTAzNTdhMjZhNDI0MjQ5NmY2OTVhYmZmN2FmYWJjZDc5MjAzNGU1MWE4ZDg5ZjU1NWU=',
  "Content-Type":"application/json",
}

class CoreService extends Service {

  async getDepartments() {
    const { ctx } = this;

    const url = this.config.coreHost + '/v1/entity/departments';
    const res = await ctx.curl(url, {
      dataType: 'json',
      headers,
    });
    console.log('11111111111 getDepartments res', res);
    const list = [];
    res.data.data.map(item => {
      const arr = {
        value: item.uuid,
        label: item.name,
        disabled: false
      }
      list.push(arr);
      return item;
    })

    return list;
  }

  async getUsers() {
    const { ctx } = this;
    const url = this.config.coreHost + '/v1/entity/employee';
    console.log('headers', headers)
    const res = await ctx.curl(url, {
      dataType: 'json',
      headers,
    });
    console.log('222222222222 getUsers res', res);
    //console.log('getUsers res', res.data.data);
    const list = [];
    res.data.data.map(item => {
      console.log('getUsers item', item)
      const arr = {
        id: item.uuid,
        value: item.code,
        text: item.code
      }
      list.push(arr);
      return item;
    })

    return list;
  }

  async getDepartmentUsers(department_uuid) {
    const { ctx } = this;
    const data = {
      filters:[[
			"department",
			"array_contains",
			department_uuid
		]]};
    console.log('3333333333 data', data)
    
    const url = this.config.coreHost + '/v1/entity/employee/_search';
    const res = await ctx.curl(url, {
      dataType: 'json',
      data,
      method: 'POST',
      headers,
    });0
    console.log('res', res)
    // const list = [
    //   "赵建伟",
		// 	"管理员"
    // ];
    const list = [];
    if(res.code != 200 || res.data.data.length == 0) {
      return list;
    } 
    res.data.data.map(item => {
      // const arr = {
      //   value: item.uuid,
      //   label: item.name,
      //   disabled: true
      // }
      list.push(item.name);
      return item;
    })

    return list;
  }

  async getDepartmentByParams(params, return_type = 'info') {
    const { ctx } = this;
    const data_post = []
    if(params.name) {
      const arr = [
        "name",
        "is",
        params.name
      ]
      data_post.push(arr);
    }
    if(params.department) {
      const arr = [
        "uuid",
        "in",
        params.department
      ]
      data_post.push(arr);
    }
    const data = {filters: data_post};
    console.log('4444444444444 data', data)
    
    const url = this.config.coreHost + '/v1/entity/departments/_search';
    const res = await ctx.curl(url, {
      dataType: 'json',
      data,
      method: 'POST',
      headers,
    });
    console.log('res', res.data)
    if(return_type === 'list') {
      return res.data.data;
    }
    return res.data.data[0];
  }

  // 获取实体详情，获取用户实体详情
  async getEntityInfo(uuid) {
    const entity = 'employee';

    const url = this.config.coreHost + `/v1/entity/${entity}/${uuid}`;
    const res = await this.ctx.curl(url, {
      dataType: 'json',
      headers,
    });
    console.log('55555555555 getEntityInfo res', res.data.data);
    return res.data.data;
  }

}
module.exports = CoreService;
