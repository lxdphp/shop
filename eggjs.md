>**[EggJs 开发说明文档](#jump_8)**


## 1 编码规范

### 1.1 编码格式与语法

> 项目默认编码格式统一为UTF-8格式，语法采用ES6+语法
    
### 1.2 代码注释

> 注释符号后要有一个空格

#### 1.2.1 函数/方法注释

> 函数/方法注释放置于函数/方法的上方，主要描述函数/方法功能以及参数类型，参数和返回值说明

```      
/**
 * 功能
 * @param  {参数类型} 参数名 参数说明
 * @return {返回值类型} 返回值 返回值说明
 */
```  

#### 1.2.2 单行注释

> 对代码做简要说明

### 1.3 代码分段及缩进

> 每段代码应放在一个代码块中。块内的代码都应该统一地缩进一个单位。

#### 1.3.1 使用空格作为缩进

> 使用2个空格作为一个缩进单位。

#### 1.3.2 代码块符号

> 代码块的开始符号要放在行尾，不可单独一行；代码块结束符号要单独一行。

``` 
function demo() { // 代码块开始符号
  // ...
} // 代码块结束符号
``` 

### 1.4 空白行分隔

> 不同功能或多个代码块之间，使用空白行分隔

### 1.5 命名规则

> 不同功能或多个代码块之间，使用空白行分隔

#### 1.5.1 文件命名

> 控制器，模型，服务的文件名使用小写名词。
>中间件使用下划线分割命名。
>使用中间件使用将下划线命名改为首字母小写的驼峰命名。
>控制器，服务的类名为首字母大写的文件名+Controller。

#### 1.5.2 变量与常量命名

> 尽量使用const代替let
若变量需要改变才使用let
固定常量为全大写，其余使用首字母小写的驼峰命名法

#### 1.5.3 函数/方法命名

> 使用首字母小写的驼峰命名

## 2.项目规范

### 2.1 项目生成

> npm install npm run dev npm start

### 2.2 安装第三方库

> npm install 库名

### 2.3 运行项目

> npm run dev； npm start

### 2.4 项目目录

```
.
├── app.js
├── app
│   ├── router.js (路由)
│   ├── controller            
│   ├── extend           
│   ├── middleware （中间件）
│   ├── service
│   ├── public
│   ├── view
│   └── model （自建Sequelize目录）
├── config
│   ├── plugin.js
│   ├── config.default.js
│   └── config.prod.js
├── logs
└── test
    └── app
        ├── middleware
        └── controller
```
以上目录约定如下：

1. app/router.js 用于配置URL路由规则。
2. app/controller/ 用于解析用户输入，处理后返回响应结果。
3. app/extend/ 用于框架内部对象的拓展(request,response,context,application)和工具类(helper)的编写。
4. app/middleware/ 用于编写中间件。
5. app/service/ 用于编写业务逻辑，如数据库操作的封装，api请求的封装等。
6. app/public/ 用于放置静态文件。
7. app/view/ 用于放置模板文件（可能不需要）。
8. app/model/ 用于放置数据模型（若使用Sequelize）。
9. app/router/ 用户放置分离的路由
10. logs/ 日志存放目录。
11. test/ 测试文件目录。
12. app.js 用于自定义启动时的初始化工作。

### 2.5 项目相关文件说明

#### 2.5.1 Service

> 保持Controller中逻辑简洁，以及业务逻辑的独立性，抽象出的Service可以被多个Controller调用。比如封装数据库操作的方法，API请求封装，第三方服务调用等。

访问方式：

this.service
Service支持多级目录，访问的时候可以通过目录名级联访问
app/service/biz/user.js => ctx.service.biz.user
app/service/sync_user.js => ctx.service.syncUser
app/service/HackerNews.js => ctx.service.hackerNews
代码格式（类的方式）：
类名使用首字母大写的驼峰命名法
获取ctx,app,service,config,logger等对象使用const {对象} = this的方式获取


#### 2.5.2 Controller

> 三种功能，处理restful接口用户传来的参数；模板渲染；请求代理

访问方式：

可以支持多级目录，访问的时候可以通过目录名级联访问
例如：
app.controller.post.create() // 代码放在 app/controller/post.js
app.controller.sub.post.create() // 代码放在 app/controller/sub/post.js
代码格式（类的方式）：
命名使用文件名首字母大写+Controller
获取ctx,app,service,config,logger等对象使用const {对象} = this的方式获取

### 2.6 Sequelize

#### 2.6.1 安装

> npm install egg-sequelize mysql2

#### 2.6.2 启用与配置

```
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize'
}


在config.{{env}}.js中配置数据库连接.账户相关的信息，开发状态下将信息填入config.local.js；部署环境下，将信息填入config.prod.js

config.sequelize = {
  dialect: 'mysql',
  database: process.env.DB_DATABASE || '数据库名',
  host: process.env.DB_HOST || 'IP地址',
  port: process.env.DB_PORT || '数据库端口号',
  username: process.env.DB_USER || '数据库用户名',
  password: process.env.DB_PASSWORD || '数据库密码',
  timezone: '+08:00'
}

```

#### 2.6.3 model数据模型开发

文件名为表名
在文件前面引入需要的字段类型const {类型} = Sequelize
代码格式：

```
'use strict'

module.exports = app => {
  const {类型} = app.Sequelize
  const 首字母大写的表名 = app.model.define('表名', {
    字段名: {
      type: 类型,
      // 其他属性
      // 是否是唯一
      unique: true,
      // 定义主键
      primaryKey: true,
      // 自增
      autoIncrement: true,
      // 校验
      validate: {
        is: ["^[a-z]+$",'i'],     // 只允许字母
        is: /^[a-z]+$/i,          // 与上一个示例相同,使用了真正的正则表达式
        not: ["[a-z]",'i'],       // 不允许字母
        isEmail: true,            // 检查邮件格式 (foo@bar.com)
        isUrl: true,              // 检查连接格式 (http://foo.com)
        isIP: true,               // 检查 IPv4 (129.89.23.1) 或 IPv6 格式
        isIPv4: true,             // 检查 IPv4 (129.89.23.1) 格式
        isIPv6: true,             // 检查 IPv6 格式
        isAlpha: true,            // 只允许字母
        isAlphanumeric: true,     // 只允许使用字母数字
        isNumeric: true,          // 只允许数字
        isInt: true,              // 检查是否为有效整数
        isFloat: true,            // 检查是否为有效浮点数
        isDecimal: true,          // 检查是否为任意数字
        isLowercase: true,        // 检查是否为小写
        isUppercase: true,        // 检查是否为大写
        notNull: true,            // 不允许为空
        isNull: true,             // 只允许为空
        notEmpty: true,           // 不允许空字符串
        equals: 'specific value', // 只允许一个特定值
        contains: 'foo',          // 检查是否包含特定的子字符串
        notIn: [['foo', 'bar']],  // 检查是否值不是其中之一
        isIn: [['foo', 'bar']],   // 检查是否值是其中之一
        notContains: 'bar',       // 不允许包含特定的子字符串
        len: [2,10],              // 只允许长度在2到10之间的值
        isUUID: 4,                // 只允许uuids
        isDate: true,             // 只允许日期字符串
        isAfter: "2011-11-05",    // 只允许在特定日期之后的日期字符串
        isBefore: "2011-11-05",   // 只允许在特定日期之前的日期字符串
        max: 23,                  // 只允许值 <= 23
        min: 23,                  // 只允许值 >= 23
        isCreditCard: true,       // 检查有效的信用卡号码

        // 也可以自定义验证:
        isEven(value) {
          if (parseInt(value) % 2 != 0) {
            throw new Error('Only even values are allowed!')
            // 我们也在模型的上下文中，所以如果它存在的话, 
            // this.otherField会得到otherField的值。
          }
        }
      }
    }
  },{
    // 配置表名 
    tableName: '表名', 

    // 不添加时间戳属性 (updatedAt, createdAt)
    timestamps: true,

    // 不删除数据库条目，但将新添加的属性deletedAt设置为当前日期（删除完成时）。 
    // paranoid 只有在启用时间戳时才能工作
    paranoid: true,

    // 不使用驼峰样式自动添加属性，而是下划线样式，因此updatedAt将变为updated_at
    underscored: true,

    // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
    freezeTableName: true,

    // 不使用createdAt
    createdAt: false,

    // 我想 updateAt 实际上被称为 updateTimestamp
    updatedAt: 'updateTimestamp',

  })
  首字母大写的表名.associate = function() {
    // 表关联
  }
  return 首字母大写的表名
}
```
