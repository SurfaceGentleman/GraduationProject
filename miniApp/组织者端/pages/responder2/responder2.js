// pages/responder2/responder2.js
var utils = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_list: [],
    message_list: null,
    wxst: null,
    hasBeenRespond: false,
    queen: [],
    canIJudge: false,
    is_end: false,
    user_score: []
  },
  startConnect: function () {
    this.setData({
      message_list: []
    })
    //var url = 'ws://localhost:8000/ws/chat/1/';
    let url = 'ws://localhost:8000/ws/responder/' + this.data.room + '/4/';
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
    //万恶之源
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
      }
      if (server_msg.status === 100) {
        msg_list.push(server_msg.message)
      }
      if (server_msg.status === 101) {
        msg_list.push(server_msg.message)
      }
      if (server_msg.status === 200) {
        msg_list.push(server_msg.message)
      }
      if (server_msg.status === 601) {
        this.setData({
          canIJudge: true
        })
        let queen = this.data.queen;
        queen.push({
          "username": server_msg.username,
          "time": server_msg.time
        })
        this.setData({
          queen
        })
      }
      if (server_msg.status === 611) {
        let user_score = this.data.user_score
        user_score.push({
          "username": server_msg.username,
          "score": server_msg.score
        })
        this.setData({
          user_score
        })
        // 排序
        if (this.data.queen.length == 0) {

        } else {
          console.log(user_score.sort(this.compare))
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


  endRound: function (options) {
    let datas = JSON.stringify({
      'message': "END!",
      "status": 610
    })
    if (this.data.wxst.readyState == this.data.wxst.OPEN) {
      this.data.wxst.send({
        data: datas,
        success: () => {
          console.info('客户端发送成功');
          this.setData({
            is_end: true
          })
        }
      });
    } else {
      console.error('连接已经关闭');
    }
  },
  judgeScore: function (options) {
    let type = options.currentTarget.dataset.type;
    console.log(type)
    let type1 = type == '0' ? "错误" : "正确";
    let datas = JSON.stringify({
      'message': this.data.queen[0].username + "回答：" + type1,
      "status": 603,
      "username": this.data.queen[0].username,
      "is_true": type
    })
    if (this.data.wxst.readyState == this.data.wxst.OPEN) {
      this.data.wxst.send({
        data: datas,
        success: () => {
          console.info('客户端发送成功');
          this.setData({
            queen: []
          })
          this.setData({
            canIJudge: false
          })
        }
      });
    } else {
      console.error('连接已经关闭');
    }
  },
  //发送内容
  sendOne: function () {
    let datas = JSON.stringify({
      'message': "王臻说:" + "hello （" + utils.formatTime(new Date()) + "）",
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
  //关闭连接
  closeOne: function () {
    this.data.wxst.close();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let room = options.room;
    console.log(options);
    this.setData({
      room
    })
    this.startConnect();
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

  sendResponder: function (options) {
    let datas = JSON.stringify({
      'message': "organier1发布了抢答",
      "status": 600
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