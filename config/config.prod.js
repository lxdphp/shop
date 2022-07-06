
/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  //config.keys = appInfo.name + '_1564639326024_3672';
  config.keys = '_1564639326024_3672';
  // add your middleware config here
  config.middleware = [];

  // 连接pgsql的配置
  exports.sequelize = {
      dialect: 'postgres',
      database: 'test',
      host: 'localhost',
      port: '5433',
      username: 'postgres',
      password: '123456',
      timezone: '+08:00',
      logging: false,
  }
  exports.redis = {
    client: {
      port: 6379,
      host: '192.168.61.21',
      password: '', 
      db: 0
    }, 
  }
  // exports.redis = {
  //   client: {
  //     port: 6379,
  //     host: '127.0.0.1',
  //     password: '', 
  //     db: 0
  //   }, 
  // }

  exports.session = {
    key: 'EGG_SESS',
    maxAge: 1000*3600*24,
    httpOnly: true,
    encrypt: true
  }
  exports.multipart = {
    mode: 'stream',  // 对应文件类型 
    fileSize: 1048576000,
    whitelist: ['.xlsx'],
    fileExtensions: [
      '.foo',
      '.apk',
      '.jpg', '.jpeg', // image/jpeg
      '.png', // image/png, image/x-png
      '.gif', // image/gif
      '.bmp', // image/bmp
      '.wbmp', // image/vnd.wap.wbmp
      '.webp',
      '.tif',
      '.psd',
      // text
      '.svg',
      '.js', '.jsx',
      '.json',
      '.css', '.less',
      '.html', '.htm',
      '.xml',
      // tar
      '.zip',
      '.gz', '.tgz', '.gzip',
      // video
      '.mp3',
      '.mp4',
      '.avi',
    ],
  };
  
  config.coreHost = 'http://fullerene.morevfx.com:9001';
  config.coreHost2 = 'http://fullerene.morevfx.com:9001';

  // config.coreHost = 'http://192.168.61.21:7000:9001';
  // config.coreHost2 = 'http://192.168.61.21:7000:9001';

  config.shotgunHost = 'https://shotgun.morevfx.com',

  config.logoutUrl = 'http://account.morevfx.com/login?redirect=http://192.168.61.22:8082/projectschedule/index'
  // config.cluster = {
  //   listen: {
  //     port: 9999,
  //   },
  // };

  config.auth = {
    jwtExclude: ['/schedule/resource',  '/entity/field/add','/schedule/manpower/info','/schedule/manpower/list','/schedule/manpower/create', '/schedule/resource/create','/schedule/event/create', '/schedule/resource/edit','/schedule/resource/edit/517e943c-9535-4861-ad85-cecd77fac3a','/schedule/manpower/list/options'], // 验证用户登录需要跳过的路由
    errorCode: -2, // 错误的code,
    output: 'apidoc/output', // apidoc输出目录，必选
    template: 'apidoc/template' // apidoc模板，可选
  }

  exports.validate = {
    // convert: false,  // 对参数可以使用convertType规则进行类型转换
    // validateRoot: false,  // 限制被验证值必须是一个对象。
  };

  config.security = {
    csrf: false,
    domainWhiteList: [ '*' ]
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  exports.middleware = ['isAuth'];

  return {
    ...config,
    ...userConfig,
  };
};