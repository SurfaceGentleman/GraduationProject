// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),// 如需尝试获取用户信息可改为false
    list: []
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bindContest(options) {
    console.log(options)
    // 1必答 2风险
    if (options.currentTarget.dataset.type == 1 || options.currentTarget.dataset.type == 2) {
      wx.navigateTo({
        url: '/pages/responder/responder?room=' + options.currentTarget.dataset.id + "&question_list_id=" + options.currentTarget.dataset.question_list_id
      })
    } else {
      wx.navigateTo({
        url: '/pages/responder2/responder2?room=' + options.currentTarget.dataset.id,
      })
    }

  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '组织者端',
    })
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8000/api/room/',
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
        var room = res.data
        //重新渲染页面
        that.setData({
          list: room
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
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
