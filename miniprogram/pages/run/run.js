// pages/run/run.js
import {
    getTimeNow
} from '../../utils/index';
const db = wx.cloud.database();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        helpContent: '',
        pickUpAddress: '',
        address: '',
        userInfo: {},
        addMoney: null,
        money: 4,

    },

    submit() {
        const {
            helpContent,
            pickUpAddress,
            address,
            addMoney,
            userInfo
        } = this.data;
        if (!helpContent || !pickUpAddress || !address) {
            wx.showToast({
                icon: 'none',
                title: '您填写的信息不全',
            })
            return;
        }

        let orderId = Date.now() + '' + Math.ceil(Math.random() * 1000) //生成随机数用以生成订单号
        //添加订单（未支付）到订单数据库表
        db.collection('order').add({
            data: {
                orderId: orderId, //订单编号
                orderMoney: 4 + addMoney, //商品价格  goodsList[index]为获取确定用户所选择
                orderBody: '校园跑腿',
                goodId: this.data._id, //商品的_id
                statu: '未支付', //0：未支付  ；  1：已支付
                // 模块的名字
                name: '校园跑腿',
                // 当前时间
                time: getTimeNow(),
                // 订单金额
                money: 4 + addMoney,
                // 订单状态
                state: '待帮助',
                // 收件地址
                address,
                // 订单信息
                info: {
                    // 帮助内容
                    helpContent,
                    // 取货地点
                    pickUpAddress,
                },
                // 用户信息
                userInfo,
                // 手机号
                phone: wx.getStorageSync('phone'),
                createTime: db.serverDate()
            }

        }).then(res => {
            //调用统一下单云函数 请求参数
            this.setData({
                order_id: res._id //存储_id用于支付成功后根据_id修改订单状态
            })
            //支付操作，传必要参数
            wx.cloud.callFunction({
                name: 'pay',
                data: {
                    body: wx.getStorageSync('phone'), //商品名称
                    outTradeNo: orderId, //订单号
                    totalFee: (4 + addMoney) * 100, //商品价格*100
                    //是为了让价格正确
                }
            }).then(res => { //回调函数
                const payment = res.result.payment
                //拉起支付
                this.pay(orderId, payment)
            })
        })

    },

    pay(orderId, payment) {
        var that = this;
        wx.requestPayment({
            ...payment,
            success: (res) => {
                db.collection('order')
                    .where({
                        orderId: orderId //订单号
                    })
                    .update({
                        data: {
                            statu: '已支付'
                        }
                    }).then(res => {
                        return res
                    }).catch(res => {
                        return res
                    })
                wx.switchTab({
                    url: '../index/index',
                })
                wx.showToast({
                    title: '发布成功',
                })
            },
            fail: (res) => {
                wx.showToast({
                    icon: "error",
                    title: '支付失败',
                })
            }
        })
    },


    getMoney(e) {
        this.setData({
            addMoney: Number(e.detail.value)
        })
    },

    getPickUpAddress(e) {
        this.setData({
            pickUpAddress: e.detail.value
        })
    },

    selectAddress() {
        wx.setStorageSync('urlNow', 'run')
        wx.redirectTo({
            url: '../addressTown/addressTown',
        })
    },

    getHelpContent(e) {
        wx.setStorageSync('helpContent', e.detail.value);
        this.setData({
            helpContent: e.detail.value
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const address = wx.getStorageSync('addressNow');
        const userInfo = wx.getStorageSync('userInfo');
        const helpContent = wx.getStorageSync('helpContent');
        if (address) {
            const {
                build,
                houseNumber
            } = address;
            this.setData({
                address: `${build}-${houseNumber}`,
            })
        }
        this.setData({
            userInfo,
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        const helpContent = wx.getStorageSync('helpContent');
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const helpContent = wx.getStorageSync('helpContent');
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})