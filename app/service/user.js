'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  
  // 获取用户信息
  async getUser(userToken) {
    const { ctx } = this;
    //:const user_token = userToken.replace('Bearer ', ' ');
    const token = Buffer.from( userToken.replace('Bearer ', ' '), 'base64').toString();
    console.log('token', token);
    const mark = '&';
    const token_list = token.split(mark);
    console.log('token_list', token_list);
    const user = await ctx.service.redis.get(token_list[1]);
    console.log('user', user);
    if(!user) {
      return false;
    }
    user.roles = user.rules.map( item => { return item.name }).join();
    // 获取用户部门信息
    // const department_uuids = await ctx.service.core.getEntityInfo(user.uuid)
    // console.log('department_uuids', department_uuids.employee.department);
    // if(department_uuids.employee.department.length > 0 ) {
    //   const params = {
    //     department: department_uuids.employee.department
    //   }
    //   const department_list = await ctx.service.core.getDepartmentByParams(params, 'list');
    //   console.log('department_list', department_list);
    //   const department_name = department_list.map( item => { return item.name }).join();
    //   user.department = department_name;
    // }
    
    return user;
  }
  
}

module.exports = UserService;