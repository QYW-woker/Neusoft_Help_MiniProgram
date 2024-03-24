// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    return await cloud.database().collection('order').where({
      orderId:event.outTradeNo
    }).update({
      data:{
        statu: '已退款'
      },
    }).then(res=>{
        console.log("退款成功");
      return res
    }).catch(res=>{
      console.log('退款失败')
      return res
    })
}