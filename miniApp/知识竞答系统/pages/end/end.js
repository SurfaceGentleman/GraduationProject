// pages/end/end.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    total: 0,
    test_id: 0
  },

  backToHome: function (options) {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  toDetail: function (options) {
    wx.navigateTo({
      url: '/pages/detail/detail?test_id=' + this.data.test_id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      score: options.score,
      total: options.total,
      test_id: options.testid
    })
    this.data.score = options.score;
    this.data.total = options.total;
    let testid = options.testid;
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8000/api/test_record/' + testid + "/",
      method: "GET",
      header: {
        'content-type': 'application/json',
        "Authorization":"JWT "+ wx.getStorageSync('token')
      },
      success: function (res) {
        console.log(res.data);
        let test_record = res.data;
        that.setData({

        })
        wx.setNavigationBarTitle({
          title: test_record.test_name
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