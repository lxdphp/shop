'use strict';

const Service = require('egg').Service;

class MenuService extends Service {
  
  async getMenuList(fields, params = []) {
    const res = this.ctx.model.Routers.findAndCountAll({
      attributes: fields,
      where: {
        retirement_status: '1',
      },
      order: [
        ["id", "ASC"]
      ],
      raw: true
    })

    return res;
  }

  async recursionDataTree(dataList,pid, tt = ''){
    if(dataList.length === 0) {
      return [];
    }
    let resultList = [];
    if (!dataList) return null; 
    for (const map of dataList) {
        let bmid_new = map["id"];
        if(tt) {
          const new_id = tt + 'id';
          bmid_new = map[new_id];
        }
        let parentId = map["parent_id"];
        if (pid==parentId) {
            const data = map;
            let childrenList = await this.recursionDataTree(dataList, bmid_new, tt);
            if (childrenList)
            data["children"]= childrenList;
            if(tt) {
              const data_arrange = data;
              data_arrange.children = childrenList,
              resultList.push(data_arrange);
            } else {
              const data_arrange = {
                name: data.name,
                path: data.path,
                component: data.component,
                redirect: data.redirect,
                meta: data.meta,
                children: childrenList,
              }
              resultList.push(data_arrange);
            }
            
        }
    }
    return resultList;
  }

  
}

module.exports = MenuService;