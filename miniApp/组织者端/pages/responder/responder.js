// pages/responder/responder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_id: 4,
    user_name: "organizer1",
    room: "",
    CDstart: 0,//调用开启函数
    CDend: 0,//调用立即结束函数  
    CDinit: 0,//调用初始化函数
    user_list: [],
    msg_list: [],
    user_record: [],
    is_record_all: false
  },
  //开启倒计时
  bindCDstart: function () {
    this.setData({ CDstart: this.data.CDstart + 1 })
  },
  //结束倒计时
  bindCDend: function () {
    this.setData({ CDend: this.data.CDend + 1 })
  },
  //初始化倒计时
  bindCDinit: function () {
    this.setData({ CDinit: this.data.CDinit + 1 })
  },
  sendClientQuestion: function () {
    let datas = JSON.stringify({
      "status": 210,
      "message": "请开始答题！"
    })
    this.data.wxst.send({
      data: datas
    })
  },

  sendUserRank: function (options) {

  },

  startConnect: function () {
    this.setData({
      message_list: []
    })
    //var url = 'ws://localhost:8000/ws/chat/1/';
    let url = 'ws://localhost:8000/ws/' + this.data.room + '/' + this.data.user_id + '/';
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
      if (server_msg.status === 201) {
        this.setData({
          is_all_ready: true
        })
        msg_list.push("所有人均已准备好")
      } else {
        console.log("这是数据" + JSON.parse(res.data).status)
      }
      if (server_msg.status === 102) {
        msg_list.push("用户列表：")
        for (let index = 0; index < server_msg.message.length; index++) {
          msg_list.push(server_msg.message[index].username);

        }
        let user_list = [];
        for (let index = 0; index < server_msg.message.length; index++) {
          user_list.push(server_msg.message[index].username);
        }
        this.setData(
          {
            user_list
          }
        )

      }
      if (server_msg.status === 100) {
        msg_list.push(server_msg.message)
      }
      if (server_msg.status === 101) {
        msg_list.push(server_msg.message)
      }

      if (server_msg.status === 501) {
        let user_record = this.data.user_record;
        user_record.push(
          {
            "data": server_msg.data,
            'user_name': server_msg.user_name,
            'score': server_msg.score
          }
        );

        this.setData({
          user_record
        })
        console.log(this.data.user_record)
        console.log("用户记录" + this.data.user_record.length);
        //console.log("用户列表" + this.data.user_list.length - 1);
        //需要减掉组织者
        if (this.data.user_record.length == this.data.user_list.length - 1) {
          this.setData({
            is_record_all: true
          })
          console.log("所有用户的作答已记录")
          let datas = JSON.stringify({
            "status": 502,
            "message": "这是排名情况",
            'data': this.data.user_record.sort(this.compare)
          })
          this.setData({
            user_record: this.data.user_record.sort(this.compare)
          })
          console.log("所有用户的记录")
          console.log(user_record)
          this.data.wxst.send({
            data: datas,
          })

        }

      }
      console.log(msg_list)
      this.setData(
        {
          message_list: msg_list
        }
      )
    });
    this.data.wxst.onClose(() => {
      console.info('连接关闭');
    });
  },

  compare: function (x, y) {
    if (x.score < y.score) {
      return 1;
    } else if (x.score > y.score) {
      return -1;
    } else {
      return 0;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      room: options.room
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