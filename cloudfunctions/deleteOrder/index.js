// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
    const {
        _id
    } = event;
    //数据库修改的操作
    try {
        return await db.collection('order').doc(_id).remove()
    } catch (error) {
        console.log(error);
    }
}