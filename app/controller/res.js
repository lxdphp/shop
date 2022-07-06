// res.js
'use strict';

const Controller = require('egg').Controller;
// 注意方法名字是官方规定的
class V1Controller extends Controller {
	// http://127.0.0.1:7001/api/v1/restful get
	async index() {
		const { ctx } = this;
		ctx.body = '这里是restful-index';
	}
	// http://127.0.0.1:7001/api/v1/restful/new get
	async ['new']() { //new是关键字，如果直接new(){}可能有问题
		const { ctx } = this;
		ctx.body = '这里是restful-new';
	}
	// http://127.0.0.1:7001/api/v1/restful/11  get
	async show() {
		const { ctx } = this;
		ctx.body = '这里是restful-show';
	}
	// http://127.0.0.1:7001/api/v1/restful/11/edit get
	async edit() {
		const { ctx } = this;
		ctx.body = '这里是restful-edit';
	}
	// http://127.0.0.1:7001/api/v1/restful 传入参数  post
	// https://eggjs.org/zh-cn/basics/router.html#表单内容的获取
	async create() {
		const { ctx } = this;
		ctx.body = '这里是restful-create';
		console.log(ctx.req);
	}
	// http://127.0.0.1:7001/api/v1/restful/1 put
	async update() {
		const { ctx } = this;
		ctx.body = '这里是restful-update';
	}
	// http://127.0.0.1:7001/api/v1/restful/1 delete
	async destroy() {
		const { ctx } = this;
		ctx.body = '这里是restful-destroy';
	}
}

module.exports = V1Controller;
