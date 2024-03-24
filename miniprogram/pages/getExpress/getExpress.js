// pages/getExpress/getExpress.js
import {
    getTimeNow
} from '../../utils/index';
const db = wx.cloud.database();
Page({

    //24
    //新增预览用户上传的取件码fileList




    /**
     * 页面的初始数据
     */
    data: {
        typeList: [{
                name: '小件',
                tips: '小件: 文件接或衣服袋子大小，小于1公斤, 价格1.9元',
                money: 1.9,
            },
            {
                name: '中件',
                tips: '中件: 鞋服盒子大小的快件，或1-3公斤物品, 价格3.3元',
                money: 3.3,
            },
            {
                name: '大件',
                tips: '大件: 四个鞋盒大小,或 3-6公斤物品，价格6.6元',
                money: 6.6,
            },
            {
                name: '特大件',
                tips: '特大件: 行李箱大小,或 6以上公斤物品，价格11.9元以上',
                money: 11.9,
            }
        ],
        typeNow: 0,
        showMore: false,
        isReward: false,
        businessIndex: 0,
        businessArray: ['请选择快递站点', '菜鸟驿站', '菜鸟驿站（阳光内）', '顺丰快递', '京东快递'],
        arriveIndex: 0,
        arriveArray: ['不限制', '尽快送达', '今天中午', '今天晚上', '明天上午', '明天中午', '明天晚上'],
        address: '',
        business: '',
        expressCode: '',
        codeImg: '',
        remark: '',
        addMoeny: '',
        money: 1.9,
        size: '',
    },



    //提交订单
    submit() {
        // 保存this指向
        const that = this.data;
        // 判断必填值有没有填
        // 收件地址、快递单家、收件码或者截图
        if (!that.address || !(that.expressCode || that.codeImg)) {
            wx.showToast({
                icon: 'none',
                title: '您填写的信息不全',
            })
            return;
        }
        let orderId = Date.now() + '' + Math.ceil(Math.random() * 10000) //生成随机数用以生成订单号
        //添加订单（未支付）到订单数据库表


        // wx.request({
        //     url: 'http://localhost:3000/addOrder',
        //     method:'POST',
        //       data: {
        //       // 模块的名字
        //       name: '快递代取',
        //       // 当前时间
        //       time: getTimeNow(),
        //       // 订单金额
        //       money: Number(that.money + that.addMoeny),
        //       // 订单状态
        //       state: '待帮助',
        //       // 收件地址
        //       address: that.address,
        //       business: that.businessArray[that.businessIndex],
        //       // 订单信息
        //       info: {
        //         //  快递大小
        //         size: that.typeList[that.typeNow].name,
        //         // 快递商家
        //         business: that.businessArray[that.businessIndex],
        //         // 取件码
        //         expressCode: that.expressCode,
        //         // 取件码截图
        //         codeImg: that.codeImg,
        //         // 备注
        //         remark: that.remark,
        //         // 期望送达
        //         expectTime: that.arriveArray[that.arriveIndex],
        //       },
        //        //用户信息
        //       userInfo: that.userInfo,
        //       // 用户手机号
        //       phone: wx.getStorageSync('phone'),
        //       },
        //       success: (res) => {
        //           if(res.data === "success"){
        //               wx.switchTab({
        //                 url: '../index/index',
        //               })
        //               wx.showToast({
        //                 title: '发布成功',
        //               })
        //           }else{
        //               wx.showToast({
        //                 title: '发布失败',
        //               })
        //           }
        //       }
        //   })

        db.collection('order').add({
                data: {
                    orderId: orderId, //订单编号
                    orderMoney: Number(that.money + that.addMoeny), //商品价格  
                    orderBody: '快递代取',
                    //goodId: this.data._id,//商品的_id
                    statu: '未支付', //0：未支付  ；  1：已支付
                    // 模块的名字
                    name: '快递代取',
                    // 当前时间
                    time: getTimeNow(),
                    // 订单金额
                    money: Number(that.money + that.addMoeny),
                    // 订单状态
                    state: '待帮助',
                    // 收件地址
                    address: that.address,
                    business: that.businessArray[that.businessIndex],
                    // 订单信息
                    info: {
                        //  快递大小
                        size: that.typeList[that.typeNow].name,
                        // 快递商家
                        business: that.businessArray[that.businessIndex],
                        // 取件码
                        expressCode: that.expressCode,
                        // 取件码截图
                        codeImg: that.codeImg,
                        // 备注
                        remark: that.remark,
                        // 期望送达
                        expectTime: that.arriveArray[that.arriveIndex],
                    },
                    // 用户信息
                    userInfo: that.userInfo,
                    // 用户手机号
                    phone: wx.getStorageSync('phone'),
                    createTime: db.serverDate()
                }
            })
            .then(res => {
                //调用统一下单云函数 请求参数
                this.setData({
                    order_id: res._id //存储_id用于支付成功后根据_id修改订单状态
                })
                money: Number(that.money + that.addMoeny),
                    //支付操作，传必要参数
                    wx.cloud.callFunction({
                        name: 'pay',
                        data: {
                            body: wx.getStorageSync('phone'), //商品名称
                            outTradeNo: orderId, //订单号
                            totalFee: Number(that.money + that.addMoeny) * 100, //商品价格*100
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




    //打赏金额
    getAddMoeny(e) {
        // e.detail.value取到的是字符串, 需要转成数值类型再进行计算
        this.setData({
            addMoeny: Number(e.detail.value)
        })
    },

    //备注信息
    getRemark(e) {
        this.setData({
            remark: e.detail.value
        })
    },
    //上传取件码
    getCode() {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                wx.showLoading({
                    title: '加载中',
                })
                const random = Math.floor(Math.random() * 1000);
                wx.cloud.uploadFile({
                    cloudPath: `expressCode/${random}.png`,
                    filePath: res.tempFilePaths[0],
                    success: (res) => {
                        let fileID = res.fileID;
                        wx.cloud.getTempFileURL({
                            fileList: [fileID],
                            success: (res) => {
                                this.setData({
                                    codeImg: res.fileList[0].tempFileURL,
                                })
                                wx.hideLoading();
                            }
                        })

                    }
                })
            },
        })
    },
    //存缓存取件码
    getExpressCode(e) {
        this.setData({
            expressCode: e.detail.value
        })
    },

    //快递数量
    bindExpressNumChange(e) {
        this.setData({
            numIndex: e.detail.value
        })
    },

    //配送男女
    bindGenderChange(e) {
        this.setData({
            genderIndex: e.detail.value
        })
    },
    //送达时间
    bindArriveChange(e) {
        this.setData({
            arriveIndex: e.detail.value
        })
    },
    //快递驿站
    bindBusinessChange(e) {
        this.setData({
            businessIndex: e.detail.value,
            selectBusiness: true
        })
    },
    //选地址
    selectAddress() {
        wx.setStorageSync('urlNow', 'getExpress');
        wx.navigateTo({
            url: '../address/address',
        })
    },
    //选快递点
    bindBusinessChange(e) {
        this.setData({
            businessIndex: e.detail.value,
        })
    },
    //赏金
    handleChangeReward(e) {
        const value = e.detail.value;
        this.setData({
            isReward: value
        })
    },
    //展示更多信息
    showMore() {
        this.setData({
            showMore: !this.data.showMore
        })
    },
    //选择快递大小
    selectType(e) {
        const {
            id,
            tip
        } = e.currentTarget.dataset;
        this.setData({
            typeNow: id,
            money: this.data.typeList[id].money
        })
        wx.showToast({
            icon: 'none',
            title: tip,
        })
    },
    //下单必读
    read() {
        wx.showModal({
            title: '下单必读',
            content: '下单代取用户填写信息务必要和包裹信息相匹配。包裹价值超过200元，请添加客服微信 提供保价服务！因暂时没有女性成员，女生宿舍只能配送至楼下，丢（坏）件必赔'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */

    onLoad: function (options) {
        const {
            business
        } = options;
        const address = wx.getStorageSync('addressNow');
        const userInfo = wx.getStorageSync('userInfo');
        if (address) {
            const {
                build,
                houseNumber
            } = address;
            this.setData({
                address: `${build}-${houseNumber}`
            })
        }
        if (business) {
            this.setData({
                business,
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

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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
        wx.switchTab({
            url: '../index/index',
        })
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