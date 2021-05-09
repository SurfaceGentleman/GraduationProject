Page({
  data: {
    phone: '',
    password: '',
    success: false,
    text: ''

  },
  onLoad: function (e) {
    wx.setNavigationBarTitle({
      title: '知识竞答系统登录',
    })
    if (wx.getStorageSync('token')) {
      wx.switchTab({
        url: "/pages/home/home",
      })
      let app = getApp()
      app.globalData.user_id = wx.getStorageSync('user_id')
    }
  },
  // 获取输入账号 
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 获取输入密码 
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录 
  login: function () {
    var that = this;

    var warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空
    if (that.data.phone.length == 0) {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (that.data.password.length == 0) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else {

      wx.request({
        url: 'http://127.0.0.1:8000/api/login/',
        method: "POST",
        data: {
          username: that.data.phone,
          password: that.data.password
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          // if (res.data.state == 1) {  //判断是否能正常登录
          //   warn = "账号或密码错误";
          //   wx.showModal({
          //     title: '提示',
          //     content: warn
          //   })
          //   return;
          // } else {
          //   that.setData({
          //     success: true,
          //     text: res.data.url
          //   })
          // }
          console.log(res.data.token);
          console.log(res.data)

          if (res.statusCode == 200) {
            let app = getApp();
            app.globalData.token = res.data.token
            app.globalData.user_id = res.data.user_id
            console.log(app.globalData.user_id)

            wx.showToast({
              title: '认证成功',
              duration: 1500
            }),
            wx.setStorageSync('token', res.data.token);
            wx.setStorageSync('user_id', res.data.user_id);
            wx.setStorageSync('icon', res.data.icon);
            wx.setStorageSync('desc', res.data.desc);
            wx.setStorageSync('user_name', res.data.username)

            wx.switchTab({
              url: "/pages/home/home",
            })
          } else {
            wx.showToast({
              title: '认证失败',
              duration: 1500
            })
          }
        },
      })


    }
  },
  // 注册 
  register: function () {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  }

})