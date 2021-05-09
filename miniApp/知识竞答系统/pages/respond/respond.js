// pages/respond/respond.js
var utils = require('../../utils/util');
const { $Message } = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 2,
    wxst: null,
    message_list: [],
    is_ready: false,
    is_all_ready: false,
    index: 0,
    wrong_list: [],
    wrong: 0,
    record: [],
    total: 0,
    score: 0,
    CDstart: 0,//调用开启函数
    CDend: 0,//调用立即结束函数  
    CDinit: 0,//调用初始化函数
    room: 0,
    canIUseButton: false,
    // username: "wz",
    // user_id: 1,
    score: 0,
    hasEnd: false,
    user_list: [],
    user_icon:"http://127.0.0.1:8000/media/icon/%E6%8D%95%E8%8E%B7.PNG"
  },

  //处理消息
  handleJoin(message) {
    $Message({
      content: message,
      type: 'success'
    });
  },
  handleleave(message) {
    $Message({
      content: message,
      type: 'error'
    });
  },
  //连接WebSocket
  startConnect: function () {
    this.setData({
      message_list: []
    })
    //var url = 'ws://localhost:8000/ws/chat/1/';
    let url = 'ws://localhost:8000/ws/responder/' + this.data.room + '/' + this.data.user_id + '/';
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

      if (server_msg.status === 100) {
        msg_list.push(server_msg.message)
        this.setData({
          message_list: msg_list
        })
      }
      if (server_msg.status === 101) {
        //msg_list.push(server_msg.message)
        this.handleJoin(server_msg.message)
      }
      if (server_msg.status === 102) {

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
      if (server_msg.status === 103) {
        msg_list.push(server_msg.message)
        this.handleleave(server_msg.message)
      }
      if (server_msg.status === 600) {
        msg_list.push(server_msg.message)
        this.setData({
          canIUseButton: true
        })
      }
      if (server_msg.status === 603) {
        msg_list.push(server_msg.message)
        this.setData({
          canIUseButton: false
        })
        console.log(msg_list)

        if (server_msg.username === this.data.user_name) {
          if (server_msg.is_true === "1") {
            this.setData({
              score: this.data.score + 10
            })
          } else{
            this.setData({
              score: this.data.score - 10
            })
          }
        }
      }
      if (server_msg.status === 610) {
        msg_list.push(server_msg.message)
        this.setData({
          hasEnd: true,
          canIUseButton: false
        })
        let datas = JSON.stringify({
          'message': "用户最终得分",
          "status": 611,
          "score": this.data.score,
          "username": this.data.user_name
        })
        this.data.wxst.send({
          data: datas,
          success: () => {
            console.info('客户端发送成功');
          }
        });
      }
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

  //发送内容
  sendOne: function () {
    let datas = JSON.stringify({
      'message': this.data.user_name + "说:" + "hello （" + utils.formatTime(new Date()) + "）",
      "status": 100
    })
    if (this.data.wxst.readyState == this.data.wxst.OPEN) {
      this.data.wxst.send({
        data: datas,
        success: () => {
          console.info('客户端发送成功');
        }
      });
    } else {
      console.error('连接已经关闭');
    }
  },
  sendResponder: function () {
    let datas = JSON.stringify({
      'message': "用户" + "wz" + "参与了抢答！",
      "time": utils.formatTime(new Date()),
      "status": 601
    })
    if (this.data.wxst.readyState == this.data.wxst.OPEN) {
      this.data.wxst.send({
        data: datas,
        success: () => {
          console.info('客户端发送成功');
          this.setData({
            canIUseButton: false
          })
        }
      });
    } else {
      console.error('连接已经关闭');
    }
  },
  //关闭连接
  closeOne: function () {
    this.data.wxst.close();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('user_id'),
      user_name: wx.getStorageSync('user_name')
    })
    let room = options.room;
    console.log(options);
    this.setData({
      room
    })
    this.startConnect();
    wx.setNavigationBarTitle({
      title: '抢答系统',
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
    this.data.wxst.close();
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