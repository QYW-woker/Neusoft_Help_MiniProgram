// pages/selectBuild/selectBuild.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabList: ['J栋', '教学楼'],
        tabNow:0,

        /**buildList为数组包含的项目 */
        buildList: ['J1栋(女)', 'J2栋(女)', 'J2栋(男)', 'J3栋(男)', 'J4栋(男)', 'J5栋(男)','体育馆女生宿舍'],
        buildNow: 0,
        buildList1: ['A栋', 'B栋', 'C栋', 'D栋', 'E栋', 'F栋', 'G栋', 'H栋', '体育馆'],
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
          url: `../addAddress/addAddress?build=${build}`
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