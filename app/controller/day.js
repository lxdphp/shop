const Controller = require('egg').Controller;

const { v4: uuidv4 } = require('uuid');

class DayController extends Controller {
  async index() {
    const { ctx, app } = this;
    let { validator } = app;
    const params = ctx.request.query;
    console.log('res11111111', params)
    // app.validator.validate({ userName: 'string' }, ctx.request.body);
    //const res = validator.validate({userName: 'userName'}, ctx.request.body);
    // 获取所有的假期
    const res = await ctx.service.day.getList(params);
    const list = [];
    res.rows.map( item => {
      item.start_at = ctx.helper.formatTime(item.start_at);
      //item.end_at = ctx.helper.formatTime(item.end_at);
      list.push(item.start_at)
    })
    //console.log(333333333, tree_data);
    this.ctx.helper.success(ctx, 1, '成功', list);
  }

  async getholiday() {
    const { ctx } = this;
    const { year } = ctx.request.query;
    const start =  year + '-06-23';
    const moment = require('moment');
    const end = year + '-08-31';
    console.log(start, end);

    function sleep(ms) {
      return new Promise(resolve=>setTimeout(resolve, ms))
    }

    const day_list = ctx.helper.getAllDays(start, end);
    const list = [];
    for( const item of  day_list) {
      const url = `https://tool.bitefu.net/jiari/?d=${item}`
      const rest = await ctx.curl(url, {
        dataType: 'json',

      });
      const dd = rest.data;
      if(dd === 0) {
        console.log('工作日', item)
      }
      if(dd === 1) {
        console.log('非工作日', item)
        list.push(item);
      }
      if(dd === 2) {
        console.log('节假日', item)
        list.push(item);
      }
      await sleep(2000)
    }

    this.ctx.helper.success(ctx, 1, '成功', list);

  }
}

module.exports = DayController;