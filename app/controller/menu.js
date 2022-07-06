const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class MenuController extends Controller {
  async index() {
    const { ctx } = this;
    //const uid = 'edc078e6-5974-4b69-81ed-8b0eb5f58111';
    const user = ctx.session.user;
    const uid = user.uuid;
    let role_uuids = [];
    if(user) {
      role_uuids = user.rules.map(item => {
        return item.uuid;
      })
    }
    console.log(role_uuids);
    const pamams  = ctx.request.query;
    
    //获取菜单路由的字段
    const entity = 'routers';
    const menu_fields = await ctx.service.entity.getEnertyColumns(entity);
    
    const fields = menu_fields.rows.map( item => {
      return item.code;
    })
    //根据角色获取路由数据
    const menu_list = await ctx.service.menu.getMenuList(fields);
    //对数据处理
    for(const item of menu_list.rows){
      item.meta = item.meta ? JSON.parse(item.meta) : '';
      // 权限赋予
      // 人力排期log
      if(item.name === 'workerscheduleindex') {
        const model = 'schedule';
        const params = {
          model,
          role_uuids
        }
        const schedule_permission = await ctx.service.permission.getModelPermission(params);
        
        item.meta.btnPermissions = schedule_permission.rows.map(item => {
          return item.code;
        })
      }
      // 人类排期详情
      if(item.name === 'workerscheduledit') {
        const model = 'resource';
        const params = {
          model,
          role_uuids
        }
        const resource_permission = await ctx.service.permission.getModelPermission(params);
        
        item.meta.btnPermissions = resource_permission.rows.map(item => {
          return item.code;
        })
      }

      // 人力排期log
      if(item.name === 'projectscheduleindex') {
        const model = 'schedule_bd';
        const params = {
          model,
          role_uuids
        }
        const schedule_permission = await ctx.service.permission.getModelPermission(params);
        item.meta.btnPermissions = schedule_permission.rows.map(item => {
          return item.code;
        })
      }
      // 人类排期详情
      if(item.name === 'projectscheduledit') {
        const model = 'shot';
        const params = {
          model,
          role_uuids
        }
        const resource_permission = await ctx.service.permission.getModelPermission(params);

        item.meta.btnPermissions = resource_permission.rows.map(item => {
          return item.code;
        })
      }

      // 项目管理
      if(item.name === 'projectprogressedit') {
        const model = 'manage_shot';
        const params = {
          model,
          role_uuids
        }
        const resource_permission = await ctx.service.permission.getModelPermission(params);

        item.meta.btnPermissions = resource_permission.rows.map(item => {
          return item.code;
        })
      }
      
      //return item;
    }
    //转成树形结构
    const tree_data = await ctx.service.menu.recursionDataTree(menu_list.rows, 0);
    //console.log(333333333, tree_data);
    this.ctx.helper.success(ctx, 1, '成功', tree_data)
  }

}

module.exports = MenuController;