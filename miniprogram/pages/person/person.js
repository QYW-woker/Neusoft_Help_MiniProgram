// pages/person/person.js
const db = wx.cloud.database();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        /**获取用户信息 */
        userInfo: {},
        hasUserInfo: false,
        canIUseGetUserProfile: false,
        //接单员审核状态
        // success代表已经是接单员了, 
        // fail代表曾经申请过但是没通过
        // loading代表目前有正在审核中的
        // null代表从未申请过
        personReceiveState: '',
        //管理员
        admin: '',
    },

    orderReceiver() {
        wx.navigateTo({
            url: '../orderReceiver/orderReceiver',
        })
    },


    applyOrder() {
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.showToast({
                icon: 'none',
                title: '请先登录!',
            })
            return;
        }
        const {
            personReceiveState
        } = this.data;
        if (personReceiveState === 'success') {
            wx.showModal({
                title: '提示',
                content: '您已经是接单员了, 请勿重复申请!',
                showCancel: false
            })
        } else if (personReceiveState === 'fail') {
            wx.showModal({
                title: '提示',
                content: '您之前提交的申请未通过审核, 您可以继续申请, 如有疑问请联系管理员: 18331092918',
                success: (res) => {
                    const {
                        confirm
                    } = res;
                    if (confirm) {
                        wx.navigateTo({
                            url: '../applyOrder/applyOrder',
                        })
                    }
                }
            })
        } else if (personReceiveState === 'loading') {
            wx.showModal({
                title: '提示',
                content: '您之前申请的内容正在审核中, 请耐心等待! 如加急审核请添加管理员微信: 18331092918',
                showCancel: false,
            })
        } else if (personReceiveState === 'null') {
            wx.navigateTo({
                url: '../applyOrder/applyOrder',
            })
        }
    },

    toAbout() {
        wx.navigateTo({
            url: '../aboutUs/aboutUs',
        })
    },

    /**setClipboardData 微信复制API组件 */
    getWXCustomer() {
        wx.setClipboardData({
            data: '19108305710',
            success: () => {
                wx.showToast({
                    title: '复制微信成功',
                })
            }
        })
    },

    /**用户信息更改页面 */
    updateInfo() {
        if (this.data.hasUserInfo) {
            wx.navigateTo({
                url: '../updateInfo/updateInfo',
            })
        }
    },
    /**获取用户手机号码 */
    getPhoneNumber(e) {
        wx.cloud.callFunction({
            name: 'getUserPhone',
            data: {
                cloudID: e.detail.cloudID,
            },
            success: (res) => {
                wx.setStorageSync('phone', res.result.list[0].data.phoneNumber);
            },
            fail: (err) => {
                console.log(err);
            }

        })
    },
    //API获取用户信息
    getUserProfile() {
        wx.getUserProfile({
            desc: '获取用户信息',
            success: (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
                //缓存用户信息
                wx.setStorageSync('userInfo', res.userInfo);
            }
        })
    },

    //老接口
    getUserInfo(e) {
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },

    // 判断当前用户是否是管理员
    getAdminPower() {
        db.collection('admin').where({
            adminID: wx.getStorageSync('openid')
        }).get({
            success: (res) => {

                this.setData({
                    admin: !!res.data.length
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }
        wx.showLoading({
            title: '加载中',
        })
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            hasUserInfo: !!userInfo,
            userInfo: userInfo,
        })
        let personReceiveState = '';
        this.getAdminPower();
        db.collection('orderReceive').where({
            _openid: wx.getStorageSync('openid')
        }).get({
            success: (res) => {
                const {
                    data
                } = res;
                if (data.length) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].state === '通过') {
                            personReceiveState = 'success';
                            break;
                        } else if (data[i].state === '不通过') {
                            personReceiveState = 'fail';
                        } else {
                            personReceiveState = 'loading';
                            break;
                        }
                    }
                } else {
                    personReceiveState = 'null';
                }
                this.setData({
                    personReceiveState,
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})