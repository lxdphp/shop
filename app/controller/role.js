// res.js
'use strict';

const Controller = require('egg').Controller;
// 
class RoleController extends Controller {
	// 
	async index() {
		const { ctx } = this;
		ctx.body = '这里是restful-index';
	}

  
}

module.exports = RoleController;
