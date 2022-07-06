'use strict';

const Controller = require('egg').Controller;


// 注意方法名字是官方规定的
class ExcelController extends Controller {
	// 导出excel
	async index() {
		const { ctx } = this;
    console.log(111111111111111)
    let headers = [
      [ 
          { t: '下单时间', f: 'trade_time', totalRow: true },
          { t: '订单类型', f: 'order_type', totalRow: true },
          { t: '手机号码', f: 'phone_number', totalRow: true },
          { t: '扫描状态', f: 'scan_status', totalRow: true },
          { t: '交易状态', f: 'ctf_order_status', totalRow: true },
          { t: '订单份额(克)', f: 'trade_share', totalRow: true },
          { t: '当时账号总份额(克)', f: 'account_share', totalRow: true },
          { t: '订单号', f: 'order_no', totalRow: true },
      ]
    ];
    let data = [
        { trade_time: '2020-12-10', order_type:'线上', phone_number:'18374009921', scan_status:'1', ctf_order_status:'1', trade_share:'2', account_share:'2', order_no:'164656456546' },
        { trade_time: '2020-12-10', order_type:'线下', phone_number:'18374009921', scan_status:'1', ctf_order_status:'1', trade_share:'2', account_share:'2', order_no:'164656456546' }
    ] // 需要在这边自己适配数据，这边为空

    await ctx.service.excel.excelCommon(headers, data, '订单信息');
    //this.ctx.helper.success(ctx, 1, '成功');
		//ctx.body = '这里是restful-index';
    //ctx.body = '这里是restful-index';
	}

  async import() {
    const { ctx } = this;
    const XLSX = require('xlsx');
    console.log(222222222)
    const stream =  ctx.multipart();
    const part = await stream(); 

    // 存储获取到的数据
    let exceldata = [];

    const promise = await new Promise(function(resolve, reject) { // 异步处理
      // 处理结束后、调用resolve 或 reject
      let list = []
      part.on('data', function(chunk) {
        //console.log('chunk', chunk);
        // 读取内容
        const workbook = XLSX.read(chunk, { type: 'buffer' });
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            list = (XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            //console.log(exceldata);
            
            break; // 如果只取第一张表，就取消注释这行
          }
        }
        resolve(list);
      });
      });

    const aa = Object.values(promise)
    console.log('res is', aa);  // 打印解析出来的Excel 内容
    aa.map(item => {
      //console.log(item);
      const aa = Object.values(item);
      console.log(aa);
    })
    // const file = this.ctx.request;
    // console.log('file', file);
    //   const list = [];

    //   const workbook = XLSX.read(stream, { type: 'buffer' });
    //   console.log(workbook);
    //   for (const sheet in workbook.Sheets) {
    //     console.log(sheet);
    //     if (workbook.Sheets.hasOwnProperty(sheet)) {
    //      // 数据直接转成json格式 
    //       list.push(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
    //       console.log('555555555', list);
    //     }
    //   }

    //   console.log(list);

    ctx.body = '这里是restful-index';
  }
	
}

module.exports = ExcelController;
