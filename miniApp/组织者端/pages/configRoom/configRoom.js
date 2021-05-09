// pages/responder/responder.js
var util = require('../../utils/util');

Page({



  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    password: "",
    info: "",
    message_list: []
  },
  inputPassword: function (options) {
    this.setData({
      password: options.detail.value
    })
  }
  ,
  setRoom: function (options) {
    console.log(this.data.password);

    this.setData({
      info: "房间名：" + "组织者1创建的" + this.data.title + "/n密码是" + this.data.password
    })
    console.log(options)
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this;
    let type = options.currentTarget.dataset.type;
    this.setData({
      type
    })

    console.log("将要创建的习题集id" + this.data.question_list_id)

    wx.request({
      url: 'http://127.0.0.1:8000/api/room/',
      method: 'post',
      header: {
        'content-type': 'application/json',
        //"Authorization": "JWT " + wx.getStorageSync('token')

      },
      data: {
        "name": this.data.title + " （organizer1 &" + util.formatTime(new Date()).toString() + '）',
        //"password": this.data.password,
        "user": 4,
        "type": type,
        "question_list": this.data.question_list_id == "undefined" ? null : this.data.question_list_id
      },
      success: function (res) {
        if (res.statusCode != 200) {
          // wx.removeStorageSync('token'),
          //   wx.navigateTo({
          //     url: '/pages/login/login',
          //   })
        }

        console.log(res.data)
        let questions = res.data
        //重新渲染页面
        if (that.data.type == 3) {
          wx.navigateTo({
            url: '../../pages/responder2/responder2?room=' + res.data.id,
          })
        } else {
          wx.navigateTo({
            url: '../../pages/responder/responder?room=' + res.data.id,
          })
        }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)
    wx.setNavigationBarTitle({
      title: options.name,
    }),

      this.data.title = options.name;
    let type = options.type;
    console.log("习题集id：" + options.id)
    this.setData({
      type,
      //设置list_id
      question_list_id: options.id
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