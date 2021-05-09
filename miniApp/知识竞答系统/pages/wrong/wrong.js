// pages/wrong/wrong.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_id: 1,
    user_name: 'wz'
  },

  ToQuestion:function (options) {
    console.log('👴')
    wx.navigateTo({
      url: '/pages/question/question?id=' + options.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('user_id'),
      user_name: wx.getStorageSync('user_name')
    })
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8000/api/user_wrong/' + that.data.user_id + '/',
      method: 'get',
      header: {
        'content-type': 'application/json',
        //"Authorization": "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Ind6IiwiZXhwIjoxNjE5MjcxNDI4LCJlbWFpbCI6IiJ9.CwBnGu3bTdIEszHgQfBi--fYCqolkfrdy9ezg0bcZQM"
      },
      success: function (res) {
        // if (res.statusCode != 200) {
        //   wx.removeStorageSync('token'),
        //     wx.navigateTo({
        //       url: '/pages/login/login',
        //     })
        // }

        console.log(res.data)
        var wrong_list = res.data
        //重新渲染页面
        that.setData({
          wrong_list
        })
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常',
          duration: 1500
        })
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