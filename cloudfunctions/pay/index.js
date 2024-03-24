// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.body,//商品描述
    "outTradeNo" : event.outTradeNo,//订单号
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1629152178",//商户号
    "totalFee" : event.totalFee,//订单金额
    "envId": "cloud1-9gl9fqa7376cce6b",//云环境名称
    "tradeType":"JSAPI",//交易类型
    //"functionName":"success"//成功回调
  })
  return res
}