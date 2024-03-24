// pages/order/order.js
const db = wx.cloud.database();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        tabList: ['我的订单', '未支付订单', '已退款订单'],
        tabNow: 0,
        myOrder: [],
        openid: '',
        OrdernoPay: [],
        OrderRetern: [],
    },
    selectTab(e) {
        const {
            id
        } = e.currentTarget.dataset;
        this.setData({
            tabNow: id,
        })
        if (id === 0) {
            this.getMyOrder();
        } else if (id === 1) {
            this.getOrdernoPay();
        } else if (id === 2) {
            this.OrderRetern();
        }
    },

    // 删除订单
      deleteOrder(e) {
        wx.showLoading({
            icon:'loading',
          title: '处理中',
        })
        wx.hideLoading();
        const {
          id
        } = e.currentTarget.dataset;
        wx.cloud.callFunction({
          name: 'deleteOrder',
          data: {
            _id: id
          },
          success: (res) => {
              console.log(res)
               wx.showToast({
                icon:'success',
              title: '删除成功',
            })
            // this.getMyOrder();
            this.getOrdernoPay();
          },
          fail: (res) => {
            console.log(res)
            wx.showToast({
              icon: 'error',
              title: '删除失败',
            })
            // wx.hideLoading();
          }
        })

      },

    callPhone(e) {
        const {
            phone
        } = e.currentTarget.dataset;
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },

    // 获取我的订单信息
    getMyOrder() {
        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
            _openid: this.data.openid,
            statu: '已支付'
        }).get({
            success: (res) => {
                const {
                    data
                } = res;
                data.forEach(item => {
                    if (item.name === "快递代取" && item.info.expressCode) {
                        item.expressCode = item.info.expressCode;
                    }
                    if (item.name === "快递代取" && item.info.codeImg) {
                        item.codeImg = item.info.codeImg;
                    }
                    item.info = this.formatInfo(item);
                    item.stateColor = this.formatState(item.state);
                });
                this.setData({
                    myOrder: data,
                })
                wx.hideLoading();
            }
        })
    },

    //获取未支付订单
    getOrdernoPay() {
        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
            _openid: this.data.openid,
            statu: '未支付'
        }).get({
            success: (res) => {
                const {
                    data
                } = res;
                data.forEach(item => {
                    if (item.name === "快递代取" && item.info.expressCode) {
                        item.expressCode = item.info.expressCode;
                    }
                    if (item.name === "快递代取" && item.info.codeImg) {
                        item.codeImg = item.info.codeImg;
                    }
                    item.info = this.formatInfo(item);
                    item.stateColor = this.formatState(item.state);
                });
                this.setData({
                    OrdernoPay: data,
                })
                wx.hideLoading();
            }
        })
    },

    //获取已退款订单
    OrderRetern() {

        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
            _openid: this.data.openid,
            statu: '已退款',
        }).get({
            success: (res) => {
                const {
                    data
                } = res;
                data.forEach(item => {
                    if (item.name === "快递代取" && item.info.expressCode) {
                        item.expressCode = item.info.expressCode;
                    }
                    if (item.name === "快递代取" && item.info.codeImg) {
                        item.codeImg = item.info.codeImg;
                    }
                    item.info = this.formatInfo(item);
                    item.stateColor = this.formatState(item.state);
                });
                this.setData({
                    OrderRetern: data,
                })
                wx.hideLoading();
            }
        })
    },

    //重新拉起支付   (package未获取到，导致支付失败)
    rePay(event) {
        var that = this.data
        let index = event.currentTarget.dataset.index
        wx.cloud.callFunction({
            name: 'pay',
            data: {
                body: that.OrdernoPay[index].orderBody, //商品名称
                outTradeNo: that.OrdernoPay[index].orderId, //订单号
                totalFee: that.OrdernoPay[index].orderMoney * 100, //商品价格*100
            }
        }).then(res => { //回调函数
            const payment = res.result.payment
            //拉起支付
            this.pay(payment)
        })
    },

    //支付操作
    pay(payment) {
        var that = this;
        wx.requestPayment({
            ...payment,
            success: (res) => {
                wx.switchTab({
                    url: '../index/index',
                })
                wx.showToast({
                    title: '发布成功',
                })
            },
            fail(res) {
                wx.showToast({
                    icon: "error",
                    title: '支付失败',
                })
            }
        })
    },

    //退款操作
    reFund(e) {
        var that = this;
        let index = e.currentTarget.dataset.index
        let refundNum = Date.now() + '' + Math.ceil(Math.random() * 100)
        wx.cloud.callFunction({
            name: 'buy_Refund',
            data: {
                refundNum: refundNum,
                tradeNum: this.data.myOrder[index].orderId,
                money: this.data.myOrder[index].orderMoney * 100,
            },
            success(res) {
                if (res.result.returnCode == 'SUCCESS') {
                    wx.showToast({
                        icon: "success",
                        title: '退款成功',
                    })
                }
                if (res.result.errCodeDes == "订单已全额退款") {
                    wx.showToast({
                        icon: 'none',
                        title: '订单已全额退款',
                    })
                }
            },
            fail(res) {
                wx.showToast({
                    icon: 'error',
                    title: '退款失败',
                })
            }
        })

    },


    async toFinish(e) {
        wx.showLoading({
            title: '加载中',
        })
        const {
            item
        } = e.currentTarget.dataset;
        const {
            _id: orderID,
        } = item;


        await db.collection('order').doc(orderID).update({
            data: {
                state: '已完成'
            }
        });



        this.getMyOrder();
        wx.hideLoading();

    },

    formatInfo(orderInfo) {
        const {
            name,
            info,
        } = orderInfo;
        if (name === '快递代取') {
            const {
                business,
                expectGender,
                expectTime,
                number,
                remark,
                size,
            } = info;
            return `快递类型: ${size} -- 快递商家: ${business} -- 期望送达: ${expectTime} -- 备注: ${remark}`;
        } else if (name === '打印服务') {
            const {
                colorPrint,
                pageNum,
                remark,
                twoSided
            } = info;
            return `页数: ${pageNum} -- 是否彩印: ${colorPrint ? '是' : '否'} -- 是否双面: ${twoSided ? '是' : '否'} -- 备注: ${remark}`;
        } else if (name === '校园跑腿') {
            const {
                helpContent,
                pickUpAddress
            } = info;
            return `帮助内容: ${helpContent} -- 取货地点: ${pickUpAddress}`;
        } else if (name === '快递代寄') {
            const {
                helpContent,
                business,
                remark
            } = info;
            return `帮助内容: ${helpContent} -- 快递商家: ${business} -- 备注: ${remark}`;
        } else if (name === '租借服务') {
            const {
                leaseItem,
                leaseTime,
                deliveryTime
            } = info;
            return `租借物品: ${leaseItem} -- 租借时长: ${leaseTime} -- 预计交货时间: ${deliveryTime}`;
        } else if (name === '游戏陪玩') {
            const {
                gameID,
                gameName,
                gameTime,
                remark
            } = info;
            return `游戏名称: ${gameName} -- 游戏时间or盘数: ${gameTime} -- 游戏ID: ${gameID} -- 备注信息: ${remark}`;
        } else if (name === '帮我送') {
            const {
                deliveryInfo
            } = info;
            return `送达地点: ${deliveryInfo}`;
        } else if (name === '代替服务') {
            const {
                helpContent
            } = info;
            return `帮助内容: ${helpContent}`;
        } else if (name === '其它帮助') {
            const {
                helpContent
            } = info;
            return `帮助内容: ${helpContent}`;
        }
    },
    //更改帮助状态
    formatState(state) {
        if (state === '待帮助') {
            return 'top_right';
        } else if (state === '已接单') {
            return 'top_right_help';
        } else if (state === '已完成') {
            return 'top_right_finish';
        }
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getMyOrder();
        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
            _openid: this.data.openid,
            statu: '已支付'
        }).get({
            success: (res) => {
                const {
                    data
                } = res;
                data.forEach(item => {
                    if (item.name === "快递代取" && item.info.expressCode) {
                        item.expressCode = item.info.expressCode;
                    }
                    if (item.name === "快递代取" && item.info.codeImg) {
                        item.codeImg = item.info.codeImg;
                    }
                    item.info = this.formatInfo(item);
                    item.stateColor = this.formatState(item.state);
                });
                this.setData({
                    myOrder: data,
                    openid: wx.getStorageSync('openid')
                })
                wx.hideLoading();
            },
            fail: (res) => {
                wx.showToast({
                    icon: 'none',
                    title: '服务器异常~~~',
                })
                wx.hideLoading();
            }
        })
    },
    //展示取件码
    showCodeImg(e) {
        const {
            item: {
                codeImg,
                state,
                receivePerson
            }
        } = e.currentTarget.dataset;
        if (state !== '已帮助' || receivePerson !== this.data.openid) {
            wx.showToast({
                icon: 'none',
                title: '无权查看!',
            })
            return;
        }
        wx.previewImage({
            urls: [codeImg],
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
        this.onLoad();
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
        wx.showLoading({
            title: '加载中',
        })
        let {
            myOrder,
            OrdernoPay,
            tabNow,
            openid,
            OrderRetern,
        } = this.data;

        if (tabNow === 0) {
            db.collection('order').orderBy('createTime', 'desc').skip(myOrder.length).where({
                _openid: openid,
                statu: '已支付'
            }).get({
                success: (res) => {
                    if (res.data.length) {
                        res.data.forEach(item => {
                            if (item.name === "快递代取" && item.info.expressCode) {
                                item.expressCode = item.info.expressCode;
                            }
                            if (item.name === "快递代取" && item.info.codeImg) {
                                item.codeImg = item.info.codeImg;
                            }
                            item.info = this.formatInfo(item);
                            item.stateColor = this.formatState(item.state);
                            myOrder.push(item);
                        })
                        this.setData({
                            myOrder,
                        })
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '我也是有底线的~~',
                        })
                    }
                    wx.hideLoading();
                },
                fail: (error) => {
                    wx.showToast({
                        icon: 'none',
                        title: '服务器出错...',
                    })
                    wx.hideLoading();
                }
            })
        } else if (tabNow === 1) {
            db.collection('order').orderBy('createTime', 'desc').skip(OrdernoPay.length).where({
                _openid: openid,
                statu: '未支付'
            }).get({
                success: (res) => {
                    if (res.data.length) {
                        const {
                            data
                        } = res;
                        data.forEach(item => {
                            if (item.name === "快递代取" && item.info.expressCode) {
                                item.expressCode = item.info.expressCode;
                            }
                            if (item.name === "快递代取" && item.info.codeImg) {
                                item.codeImg = item.info.codeImg;
                            }
                            item.info = this.formatInfo(item);
                            item.stateColor = this.formatState(item.state);
                            OrdernoPay.push(item);
                        });
                        this.setData({
                            OrdernoPay,
                        })
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '我也是有底线的~~',
                        })
                    }
                    wx.hideLoading();
                }
            })
        } else if (tabNow === 2) {
            db.collection('order').orderBy('createTime', 'desc').skip(OrderRetern.length).where({
                receivePerson: this.data.openid,
                statu: '已退款'
            }).get({
                success: (res) => {
                    if (res.data.length) {
                        const {
                            data
                        } = res;
                        data.forEach(item => {
                            if (item.name === "快递代取" && item.info.expressCode) {
                                item.expressCode = item.info.expressCode;
                            }
                            if (item.name === "快递代取" && item.info.codeImg) {
                                item.codeImg = item.info.codeImg;
                            }
                            item.info = this.formatInfo(item);
                            item.stateColor = this.formatState(item.state);
                            helpOrder.push(item);
                        });
                        this.setData({
                            OrderRetern,
                        })
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '我也是有底线的~~',

                        })
                    }
                    wx.hideLoading();
                }
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})