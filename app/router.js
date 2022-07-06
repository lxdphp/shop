module.exports = app => {
    const { router, controller } = app;

    const auth = app.middleware.isAuth(); 

    //router.get('/', controller.index.index);
    //
    router.get('/schedule/demo', controller.bd.shotgun.index);
   
    // 自定义字段
    router.post('/entity/up', controller.admin.entity.up);
    router.get('/entity/form', controller.admin.entity.getCustomForm);
    router.get('/entity/getUp', controller.admin.entity.getUp);
    router.post('/entity/editUp', controller.admin.entity.editUp);

    // 获取菜单
    router.get('/schedule/menu', controller.menu.index);

    // 获取排期列表
    router.get('/schedule/manpower/list', controller.schedule.index);
    router.get('/schedule/manpower/info', controller.schedule.info);
    router.get('/schedule/manpower/list/options', controller.schedule.options);
    router.post('/schedule/manpower/del', controller.schedule.del); // 删除排期
    router.post('/schedule/manpower/create', controller.schedule.create);  // 新建排期记录接口
    router.get('/schedule/manpower/create/fieldlist', controller.schedule.resource_fields);  // 新建排期记录接口
    
    // 获取排期列表-BD
    router.get('/schedule/bd/list', controller.bd.schedulebd.index);
    router.post('/schedule/bd/del', controller.bd.schedulebd.del); // 删除排期
    router.post('/schedule/bd/create', controller.bd.schedulebd.create);  // 新建排期记录接口
    router.resources('bd', '/schedule/bd', controller.bd.shot);  // 资源接口
    router.get('/schedule/bd/step/list', controller.bd.shotgun.getStepList);
    router.get('/schedule/bd/project/list', controller.bd.shotgun.getProjectList);
    router.resources('bd/event', '/schedule/bd/event', controller.bd.event);  // 事件接口
    router.get('/bd/resource/options', controller.bd.shot.options);
    router.post('/bd/schedule/milestone/del', controller.milestone.del);
    router.get('/schedule/bd/event/daySummary', controller.bd.event.day_summary);  //获取
    router.post('/schedule/bd/import/shotgun', controller.bd.shotgun.import_shotgun);  //获取shotgun 数据-分类-环节
    router.get('/schedule/bd/import/shotgun/task', controller.bd.shotgun.index);  //获取shotgun 数据
    router.get('/schedule/bd/shotgun/createCategory', controller.bd.shotgun.createCategory);  //获取shotgun 数据
    // router.post('/schedule/resource/create', controller.resource.create);  // 新建资源接口
    // router.put('/schedule/resource/edit', controller.resource.edit);  // 编辑资源接口
    router.get('/schedule/bd/info', controller.bd.schedulebd.info);
    router.post('/schedule/bd/edit', controller.bd.schedulebd.edit);
    router.get('/schedule/bd/step/default', controller.bd.shot.getdefaultlink);
    router.post('/bd/resource/batch_del', controller.bd.shot.batch_del);
    // 发布
    router.get('/schedule/bd/publish', controller.bd.shot.publish);
    // shotgun 页面
    router.get('/schedule/bd/shotgun/index', controller.bd.shot.getShotgunIndex);


    // restful 资源接口
    router.resources('resource', '/schedule/resource', controller.resource);  // 资源接口
    router.get('/resource/options', controller.resource.options);
    
    router.get('/resource/options/getDepartmentUsers', controller.resource.getDepartmentUsers);

    router.resources('event', '/schedule/event', controller.event);  // 事件接口
    router.get('/schedule/event/daySummary', controller.event.day_summary);  //

    // day
    router.resources('day', '/schedule/day', controller.day);

    // milestone 
    router.resources('milestone', '/schedule/milestone', controller.milestone);

    // excel 
    router.resources('excel', '/schedule/excel', controller.excel);
    router.post('/schedule/excel/import', controller.excel.import);

    // 对比
    // router.post('/schedule/contrast', controller.schedule.contrast);

    // 获取用户信息
    router.resources('user', '/schedule/user', controller.user);
    router.get('/user/logout', controller.user.logout);

    // 用户个性页面
    router.resources('page', '/schedule/page', controller.page);
   
    // countrast
    router.post('/entity/field/add', controller.entity.create);

    // 获取节假日
    router.get('/day/holiday', controller.day.getholiday);
    // 
    router.post('/schedule/shotgun/outsource/plan', controller.bd.outsource.index);  //获取shotgun 数据
    router.get('/schedule/shotgun/outsource/plan/option', controller.bd.outsource.option);  //获取shotgun 数据

    // 管理
    router.post('/schedule/shotgun/manageprogress/plan', controller.plan.manageprogress.index);  //获取shotgun 数据
    router.post('/schedule/shotgun/manageprogress/plan/create', controller.plan.manageprogress.create);  //创建计划
    router.post('/schedule/shotgun/manageprogress/plan/edit', controller.plan.manageprogress.update);  //编辑计划
    router.post('/schedule/shotgun/manageprogress/plan/del', controller.plan.manageprogress.del);  //批量删除计划
    router.get('/schedule/shotgun/manageprogress/plan/list', controller.plan.manageprogress.list);  //计划列表
    router.get('/schedule/shotgun/manageprogress/plan/option', controller.plan.manageprogress.option);  //获取shotgun 数据

    router.resources('manage/event', '/schedule/manage/event', controller.plan.event);  // 事件接口


    //
    router.post('/uploadImg', controller.upload.uploadImg);
    router.get('/category/list', controller.category.index);
    router.post('/category/create', controller.category.create);
    router.post('/category/del', controller.category.destroy);

    router.get('/goods/list', controller.goods.index);
    router.post('/goods/create', controller.goods.create);
    router.post('/goods/update', controller.goods.update);
    router.post('/goods/del', controller.goods.destroy);
  };