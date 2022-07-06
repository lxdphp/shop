'use strict';

const moment = require('moment');
const sd = require('silly-datetime');
module.exports = {
  setRgbTo16(str){
    let reg = /^(rgb|RGB)/;
    if(!reg.test(str)){return;}
    // 将str中的数字提取出来放进数组中
    var arr = str.slice(4, str.length-1).split(",");
    let c = '#';
    for(var i = 0; i < arr.length; i++){
        // Number() 函数把对象的值转换为数字
        // toString(16) 将数字转换为十六进制的字符表示
        var t = Number(arr[i]).toString(16);
        //如果小于16，需要补0操作,否则只有5位数
        if(Number(arr[i]) < 16){
            t = '0' + t;
        }
        c += t;
    }
    return c;
  },
  logoutUrl() {
    return this.config.logoutUrl;
  },
  getDateDiff(startTime, endTime, diffType) {
    //console.log(startTime, endTime)
    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式

    startTime = startTime.replace(/-/g, "/");

    endTime = endTime.replace(/-/g, "/");

    //将计算间隔类性字符转换为小写

    diffType = diffType.toLowerCase();

    var sTime = new Date(startTime); //开始时间

    var eTime = new Date(endTime); //结束时间

    //作为除数的数字

    var divNum = 1;

    switch (diffType) {

      case "second":

        divNum = 1000;

        break;

      case "minute":

        divNum = 1000 * 60;

        break;

      case "hour":

        divNum = 1000 * 3600;

        break;

      case "day":

        divNum = 1000 * 3600 * 24;

        break;

      default:

        break;

    }

    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));

  },

  getAllDays(begin_date, end_date) {
    const errArr = [],
      resultArr = [],
      dateReg = /^[2]\d{3}-[01]\d-[0123]\d$/;

    if (typeof begin_date !== 'string' || begin_date === '' || !dateReg.test(begin_date)) {
      return errArr;
    }

    if (typeof end_date !== 'string' || end_date === '' || !dateReg.test(end_date)) {
      return errArr;
    }

    try {
      const beginTimestamp = Date.parse(new Date(begin_date)),
        endTimestamp = Date.parse(new Date(end_date));

      // 开始日期小于结束日期
      if (beginTimestamp > endTimestamp) {
        return errArr;
      }

      // 开始日期等于结束日期
      if (beginTimestamp === endTimestamp) {
        resultArr.push(begin_date);
        return resultArr;
      }

      let tempTimestamp = beginTimestamp,
        tempDate = begin_date;


      // 新增日期是否和结束日期相等， 相等跳出循环
      while (tempTimestamp !== endTimestamp) {
        resultArr.push(tempDate);

        // 增加一天
        tempDate = moment(tempTimestamp)
          .add(1, 'd')
          .format('YYYY-MM-DD');

        // 将增加时间变为时间戳
        tempTimestamp = Date.parse(new Date(tempDate));
      }

      // 将最后一天放入数组
      // resultArr.push(end_date);
      return resultArr;

    } catch (err) {
      return errArr;
    }
  },

  getNextTime(num, date = '') {
    const time = date === '' ? sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') : date;
    const res = moment(time).add(num, 'days').format('YYYY-MM-DD');
    return res
  },

  getUpTime(num, date = '', has = '') {
    if(has && !date) {
      return '';
    }
    const time = date === '' ? sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') : date;
    const res = moment(time).subtract(num, 'days').format('YYYY-MM-DD');
    return res
  },

  changeTime(time) {
    return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
  },

  getTime() {
    const time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    return time;
  },

  getTimeByThree() {
    const time = sd.format(new Date(), 'YYYY-MM-DD');

    return time;
  },

  getTimeByFour(date) {
    return moment(date).format('YYYY/MM/DD')
  },

  // 按照某个字段去重
  unique(arr, val) {
    const res = new Map();
    return arr.filter(item => !res.has(item[val]) && res.set(item[val], 1))
  },

  formatTime(date) {
    return moment(date).format('YYYY-MM-DD')
  },

  // 首字母改成大写。先全部改成小写，再把首字母替换成大写的
  InitialsChange(str) {
    console.log('str', str);
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()); // 执行代码
  },



  keysort(property) {
    //console.log(property);
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    }
  },
  listSortBy(arr, field, order){
    var refer = [], result=[], order = order=='asc'?'asc':'desc', index;
    for(let i=0; i<arr.length; i++){
        refer[i] = arr[i][field]+':'+i;
    }
    refer.sort();
    if(order=='desc') refer.reverse();
    for(let i=0;i<refer.length;i++){
        index = refer[i].split(':')[1];
        result[i] = arr[index];
    }
    return result;
},
  

  getThursdayDate(date) {
    let dateObj = new Date(date), timestamp = dateObj.getTime();
    let day = dateObj.getDay();
    if ([0, 1, 2, 3].includes(day)) {
      timestamp += (4 - day) * 24 * 3600000;
    } else if ([5, 6].includes(day)) {
      timestamp -= (day - 4) * 24 * 3600000;
    }
    return timestamp;
  },
  getWeek(date) {
    let value = this.getThursdayDate(date);

    //let value = new Date(date).getTime();
    let fullYear = new Date(value).getFullYear(),
      timestamp = new Date(value).getTime(),
      timeObj = new Date(fullYear + "/01/01");

    //获取1月1日获取属于星期几
    let day = timeObj.getDay();
    console.log('getweek', fullYear, timestamp, timeObj, day);
    //第一周开始的时间戳
    let firstWeekTimestamp = 0;
    if ([1, 2, 3, 4].includes(day)) {
      //1月1日属于第一周
      firstWeekTimestamp = (timeObj.getTime()) - (day * 24 * 1 * 3600000);
    } else {
      let num = day > 0 ? 8 : 1;
      console.log('num', num - day);
      //1月1日  不属于第一周
      firstWeekTimestamp = (timeObj.getTime()) + (num - day) * 24 * 1 * 3600000;
    }
    if (timestamp >= firstWeekTimestamp) {
      //如果属于本年度的周数
      let num = Math.ceil((timestamp - firstWeekTimestamp) / 7 / 24 / 3600000);
      //return  num;
      return fullYear + '-' + num;
      return { year: fullYear, week: num };
    } else {
      //如果属于上一年的周数
      let string = (fullYear - 1) + "/12/28";
      return this.getWeek(string);
    }
  },

  computedWeek(date) {
    let day = new Date(date);
    // 设置成最近的周四
    day.setDate(day.getDate() + 4 - (day.getDay() || 7));
    // 找出今年第一天的时间
    const yearFirstDay = new Date(day.getFullYear(), 0, 1);
    // 算出今天离今年第一天过去多长时间了
    // 算出过了多少天，然后算出过了多少周
    const weekNum = Math.ceil(((day - yearFirstDay) / 86400000) / 7)
    let fullYear = new Date(date).getFullYear()
    return fullYear + '-' + weekNum;

  },

  success(ctx, code = 1, msg, data) {
    if (code) {
      const body = {
        code,
        msg,
        data,
      }
      ctx.body = body;
    } else {
      const body = {
        code,
        msg
      }
    }
  }
};