// pages/user_profile/user_profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    user_id: 1,
    desc: "dd",
    icon: "/media/icon/%E6%8D%95%E8%8E%B7.PNG"
  },

  toWrongPage:function (params) {
    wx.navigateTo({
      url: '../../pages/wrong/wrong',
    })
  },

  loginOut:function (params) {
    wx.clearStorageSync()
    wx.redirectTo({
      url: '../../pages/login/login',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('user_id'),
      username: wx.getStorageSync('user_name'),
      desc: wx.getStorageSync('desc'),
      //icon: wx.getStorageSync('icon')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      user_id: wx.getStorageSync('user_id'),
      username: wx.getStorageSync('user_name'),
      desc: wx.getStorageSync('desc'),
      icon: wx.getStorageSync('icon')
    })
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