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
      title: "知识小竞答demo",
    })

    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8021/app01/question_lists/',
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
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