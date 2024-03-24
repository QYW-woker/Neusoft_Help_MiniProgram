const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        banner: [
            'cloud://cloud1-9gl9fqa7376cce6b.636c-cloud1-9gl9fqa7376cce6b-1313048280/Carousel area/蓝色斜纹三角几何促销微信公众号封面.png'

        ], //轮播区图片
        indexConfig: [ //首页组件
            {
                icon: '../../images/parcel.png',
                text: '快递代取',
                url: '../selectAddress/selectAddress'
            },
            {
                icon: '../../images/run.png',
                text: '校园跑腿',
                url: '../choice/choice'
            },
            {
                icon: '../../images/Store.png',
                text: '宿舍商店',
                url: '../trade/trade'
            },
            {
                icon: '../../images/other.png',
                text: '其他帮助',
                url: '../otherchoice/otherchoice'
            }
        ],
        tabList: ['全部订单', '正在悬赏', '已接订单'],
        tabNow: 0,
        orderList: [],
        rewardOrder: [],
        helpOrder: [],
        openid: '',
        canReceive: false,
        helpTotalNum: 0,
        helpTotalMoeny: 0
    },
    /**toDetail(e) 跳转制定页面的响应选择器 */
    toDetail(e) {
        /**
         wx.navigateTo({
           url: 'url',
         }) 微信跳转页面的组件
         */
        const userInfo = wx.getStorageSync('userInfo');
        const url = e.currentTarget.dataset.url;
        if (userInfo) {
            wx.navigateTo({
                url,
            })
        } else {
            wx.showToast({
                icon: 'none',
                title: '请前往个人中心登录',
            })
        }
    },

    //轮播图点击跳转
    Goto() {
        wx.navigateTo({
            url: '../selectAddress/selectAddress',
        })
    },
    //公告
    handleClickNotice() {
        wx.showModal({
            title: '公告',
            content: '下单请添加客服wx:19108305710'
        })
    },
    //选择哪个展示
    selectTab(e) {
        const {
            id
        } = e.currentTarget.dataset;
        this.setData({
            tabNow: id,
        })
        if (id === 0) {
            this.onLoad();
        } else if (id === 1) {
            this.getRewardOrder();
        } else if (id === 2) {
            this.getMyHelpOrder();
        }
    },
    //取件码展示
    showCodeImg(e) {
        const {
            item: {
                codeImg,
                state,
                receivePerson
            }
        } = e.currentTarget.dataset;
        if (state !== '已接单' || receivePerson !== this.data.openid) {
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

    //打电话
    callPhone(e) {
        const {
            phone
        } = e.currentTarget.dataset;
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },

    //获取全部订单
    getAllOrder() {
        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
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
                    rewardOrder: data,
                })
                wx.hideLoading();
            }
        })
    },

    // 获取正在悬赏的订单信息
    getRewardOrder() {
        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
            state: '待帮助',
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
                    rewardOrder: data,
                })
                wx.hideLoading();
            }
        })
    },

    // 获取我帮助的订单信息 
    getMyHelpOrder() {
        wx.showLoading({
            title: '加载中',
        })
        db.collection('order').orderBy('createTime', 'desc').where({
            statu: '已支付',
            state: '已接单'
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
                    helpOrder: data,
                })
                wx.hideLoading();
            }
        })
    },


    //删除订单
    deleteOrder(e) {
        wx.showLoading({
            icon: 'loading',
            title: '处理中',
        })
        const {
            id
        } = e.currentTarget.dataset;
        wx.cloud.callFunction({
            name: 'deleteOrder',
            data: {
                _id: id
            },
            success: (res) => {
                wx.showToast({
                    icon: 'success',
                    title: '删除成功',
                })
                this.getAllOrder();
            },

            fail: (res) => {
                wx.showToast({
                    icon: 'error',
                    title: '删除失败',
                })
                wx.hideLoading();
            }
        })
    },


    // 我帮助的订单金额总和
    getHelpTotalMoney() {
        const $ = db.command.aggregate;
        db.collection('order').aggregate().match({
            receivePerson: wx.getStorageSync('openid'),
            state: '已帮助',
        }).group({
            _id: null,
            totalNum: $.sum('$money'),
        }).end({
            success: (res) => {
                this.setData({
                    helpTotalMoeny: res.list[0].totalNum
                })
            }
        })
    },

    // 点击接单
    orderReceive(e) {
        if (this.data.canReceive) {
            wx.showLoading({
                title: '加载中',
            })
            const {
                item
            } = e.currentTarget.dataset;
            const {
                _id
            } = item;
            wx.cloud.callFunction({
                name: 'updateReceive',
                data: {
                    _id,
                    receivePerson: this.data.openid,
                    state: "已接单"
                },
                success: (res) => {
                    if (this.data.tabNow === 0) {
                        this.onLoad();
                    } else {
                        this.getRewardOrder();
                    }
                    wx.hideLoading();
                },
                fail: (err) => {
                    wx.showToast({
                        icon: 'error',
                        title: '接单失败',
                    })
                }
            })
        } else {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '您目前不是接单员, 请前往个人中心申请成为接单员!'
            })
        }

    },

    //更变接单条件
    async toFinish(e) {
        wx.showLoading({
            title: '加载中',
        })
        const {
            item
        } = e.currentTarget.dataset;
        const {
            _id: orderID,
            receivePerson,
            money
        } = item;


        const result = await db.collection('orderReceive').where({
            _openid: receivePerson
        }).get();
        let data = result.data[0];
        data.allMoney += money;
        data.allCount += 1;
        item.state = '已接单';
        item.stateColor = this.formatState(item.state)
        data.allOrder.push(item);
        const {
            _id,
            allCount,
            allMoney,
            allOrder
        } = data;


        await wx.cloud.callFunction({
            name: 'updateReceiver',
            data: {
                _id,
                allMoney,
                allCount,
                allOrder
            },
        });

        await db.collection('order').doc(orderID).update({
            data: {
                state: '已完成'
            }
        });

        this.getMyOrder();
        wx.hideLoading();

    },
    //帮助详情
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
    //快递状态
    formatState(state) {
        if (state === '待帮助') {
            return 'top_right';
        } else if (state === '已接单') {
            return 'top_right_help';
        } else if (state === '已完成') {
            return 'top_right_finish';
        }
    },
    //判断是否是接单员，要在数据库新建orderReceive存储接单员信息
    getPersonPower() {
        db.collection('orderReceive').where({
            _openid: wx.getStorageSync('openid'),
            state: '通过'
        }).get({
            success: (res) => {
                this.setData({
                    //是否允许接单
                    canReceive: !!res.data.length
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获取id缓存
        const openid = wx.getStorageSync('openid');

        if (!openid) {
            //callFunction请求云函数
            wx.cloud.callFunction({
                name: 'UserOpenId',
                success: (res) => {
                    const {
                        openid
                    } = res.result;
                    //放入缓存
                    wx.setStorageSync('openid', openid);
                }
            })
        }

        wx.showLoading({
            title: '加载中',
        })
        this.getPersonPower();
        db.collection('order').orderBy('createTime', 'desc').get({
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
                    orderList: data,
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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getAllOrder();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        wx.showLoading({
            title: '加载中',
        })
        let {
            orderList,
            rewardOrder,
            helpOrder,
            tabNow,
            openid
        } = this.data;

        if (tabNow === 0) {
            db.collection('order').orderBy('createTime', 'desc').skip(orderList.length).where({
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
                            orderList.push(item);
                        })
                        this.setData({
                            orderList,
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
                        icon: 'error',
                        title: '服务器出错...',
                    })
                    wx.hideLoading();
                }
            })
        } else if (tabNow === 1) {
            db.collection('order').orderBy('createTime', 'desc').skip(rewardOrder.length).where({
                state: '待帮助',
                statu: '已支付'
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
                            rewardOrder.push(item);
                        });
                        this.setData({
                            rewardOrder,
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
            db.collection('order').orderBy('createTime', 'desc').skip(helpOrder.length).where({
                receivePerson: this.data.openid,
                statu: '已支付',
                state: '已接单'
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
                            helpOrder,
                        })
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '无更多信息',
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

    },


})