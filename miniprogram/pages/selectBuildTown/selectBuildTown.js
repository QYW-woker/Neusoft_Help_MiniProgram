// pages/selectBuild/selectBuild.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabList: ['男生宿舍', '女生宿舍'],
        tabNow:0,

        /**buildList为数组包含的项目 */
        buildList: ['1栋', '2栋', '3栋', '4栋', '5栋','6栋','7栋','8栋','9栋','10栋','17栋','18栋','19栋','21栋','22栋','23栋','24栋','25栋','26栋'],
        buildNow: 0,
        buildList1: ['11栋', '12栋','13栋','14栋','15栋','16栋','20栋'],
        buildNow1: 0,
        
    },

    selectTab(e){
        const id=e.currentTarget.dataset.id;
        this.setData({
            tabNow:id,
        })
    },

  
    selectBuild(e){
        const id=e.currentTarget.dataset.id;
        this.setData({
            buildNow:id,
        })
        const index = e.currentTarget.dataset.index; 
        const that = this.data;
        const build = `${that.tabList[that.tabNow]}-${that.buildList[that.buildNow]}楼`
        console.log(build);
        wx.navigateTo({
          url: `../addAddressTown/addAddressTown?build=${build}`
          /**url为返回的页面 ? 后为需要携带的信息 */
        })
    },

    selectBuild1(e){
        const id=e.currentTarget.dataset.id;
        this.setData({
            buildNow1:id,
        })
        const index = e.currentTarget.dataset.index; 
        const that = this.data;
        const build1 = `${that.tabList[that.tabNow]}-${that.buildList1[that.buildNow1]}楼`
        console.log(build1);
        wx.navigateTo({
          url: `../addAddress/addAddress?build=${build1}`
          /**url为返回的页面 ? 后为需要携带的信息 */
        })
    },

    

    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})