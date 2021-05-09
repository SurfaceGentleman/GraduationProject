// pages/home/home.js
Page({
  toTestPage: function (option) {
    let testid = option.currentTarget.dataset["testid"];
    let testname = option.currentTarget.dataset["name"];
    console.log(testid);
    wx.navigateTo({
      url: '/pages/test/test?testid=' + testid + '&name=' + testname
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "知识竞答系统",
    })
    this.setData({
      user_name:wx.getStorageSync('user_name')
    })
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8000/api/question_lists/',
      method: 'get',
      header: {
        'content-type': 'application/json',
        "Authorization":"JWT "+ wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode != 200){
          wx.removeStorageSync('token'),
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }

        console.log(res.data)
        var questions = res.data
        //重新渲染页面
        that.setData({
          list: questions
        })
      },
      fail: function () {
        wx.showToast({
          title: '服务器异常',
          duration: 1500
        })
      }
    })
  }
},


)