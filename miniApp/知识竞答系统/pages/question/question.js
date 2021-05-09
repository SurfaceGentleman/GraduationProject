// pages/question/question.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    let app = getApp();
    wx.request({
      //url: 'http://127.0.0.1:8000/api/user_detail_test_record/1/' + options.test_id + "/",
      url: 'http://127.0.0.1:8000/api/questions/' + options.id,
      method: "GET",
      header: {
        'content-type': 'application/json',
        //"Authorization":"JWT "+ wx.getStorageSync('token')
      },
      success: function (res) {
        console.log(res.data);
        let question = res.data;
        that.setData({
          question
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