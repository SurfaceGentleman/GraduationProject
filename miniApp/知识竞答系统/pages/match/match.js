// pages/match/match.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: "wz",
    user_id: 1,
    matching: false
  },
  //连接WebSocket
  startConnect: function () {
    this.setData({
      message_list: []
    })
    //var url = 'ws://localhost:8000/ws/chat/1/';
    let url = 'ws://localhost:8000/match/' + this.data.user_id + '/';
    this.data.wxst = wx.connectSocket({
      url: url,
    });
    this.data.wxst.onOpen(res => {
      console.info('连接打开成功');
    });
    this.data.wxst.onError(res => {
      console.info('连接识别');
      console.error(res);
    });
    this.data.wxst.onMessage(res => {
      let msg_list = this.data.message_list
      let server_msg = JSON.parse(res.data)
      console.log(server_msg)


      if (server_msg.status === 200) {
        let room = server_msg.room
        this.data.wxst.close();
        wx.redirectTo({
          //url: '/pages/contest/contest?room=' + room,
          url: `/pages/matchcontest/matchcontest?room=${room}`
        })
        
      }

    });
    this.data.wxst.onClose(() => {
      console.info('连接关闭');
    });
  },

  matchRoom: function (options) {
    this.setData({
      matching: true
    })
    let datas = JSON.stringify({
      'status': 110,
      'message': '匹配对战'
    })
    this.data.wxst.send({
      data: datas,
      success: (res) => {
        console.log(res)
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('user_id'),
      username: wx.getStorageSync('user_name')
    })


    this.startConnect();
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