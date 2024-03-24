// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const res = await cloud.cloudPay.refund({
      "out_refund_no" : event.refundNum,//退款单号
      "out_trade_no" : event.tradeNum,//原订单号
      "nonce_str" : ""+ Date.now(),//随机字符串
      "subMchId" : "1629152178",//商户号
      "total_fee" : event.money,//订单金额
      "refund_fee": event.money,//申请退款金额
      "functionName": "Refund_success"	//退款成功回调函数
    })
    return res
  }