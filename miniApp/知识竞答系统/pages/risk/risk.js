var utils = require('../../utils/util');
const { $Message } = require('../../dist/base/index');
// pages/chat/chat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 1,
    wxst: null,
    message_list: [],
    is_ready: false,
    is_all_ready: false,
    questions: [],
    question_list: null,
    index: 0,
    wrong_list: [],
    wrong: 0,
    record: [],
    total: 0,
    answered: false,
    right_info: "",
    wrong_info: "",
    is_all_answered: false,
    score: 0,
    CDstart: 0,//调用开启函数
    CDend: 0,//调用立即结束函数  
    CDinit: 0,//调用初始化函数
    room: 0,
    end: false,
    user_id: 1,
    user_name: "wz",
    percent: 0,
    status: 'wrong',
    timer_id: 0,
    length: 0,
    chosen: false,
    is_ranked: false
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
  //进度条
  handleAdd(timer_id) {
    if (this.data.percent >= 100) {
      console.log("时间到了")
      clearInterval(timer_id)
      return;
    }
    this.setData({
      percent: this.data.percent + 5
    });


  },
  endTime: function (options) {
    this.setData({
      percent: 100
    })
    clearInterval(this.data.timer_id);

  },
  startTime: function (option) {
    this.setData({
      percent: 0
    })
    let that = this
    let timer_id = setInterval(function (params) {
      that.handleAdd(timer_id);
      if (that.data.percent == 100) {
        console.log("时间id：" + timer_id)

        //warning
        //时间到，这块似乎有bug
        if (that.data.percent == 100 && that.data.chosen == false) {
          // 自定义组件触发事件时提供的detail对象
          console.log("👴将在此写函数");
          console.log("未作答");
          that.data.wrong++;
          that.data.wrong_list.push(that.data.questions[that.data.index].id)
          //扣分
          let score = that.data.questions[that.data.index].score
          that.setData({
            right_info: "",
            wrong_info: "未作答❌",
            score: that.data.score
          })
          let answer_info =
          {
            "question": that.data.questions[that.data.index].id,
            "is_true": false
          }

          let send_json = JSON.stringify({
            "status": 301,
            "message": answer_info,
            "user_id": that.data.user_id
          })
          console.log(send_json)
          that.data.wxst.send({
            data: send_json
          }
          )
          that.data.record.push({
            "question": that.data.questions[that.data.index].id,
            "is_true": false,
            "score": 0
          })
          if (that.data.record.length == that.data.questions.length) {
            that.setData({
              end: true
            })
            console.log("Timer提交的记录")
            //that.send_record();
            clearInterval(timer_id)
          }
        }



        clearInterval(timer_id);
      }

    }, 250)
    that.setData({
      timer_id
    })
  },

  returnToHome:function (params) {
    wx.switchTab({
      url: '../../pages/home/home',
    })
  },

  get_question: function (options) {
    let datas = JSON.stringify({
      "status": 300,
      "question_list_id": this.data.question_list
    })
    this.data.wxst.send({
      data: datas
    })
  },

  ready: function (options) {
    let datas = JSON.stringify({
      "status": 200
    })
    this.data.wxst.send({
      data: datas,
      success: () => {
        console.info('客户端发送成功');
        this.setData({
          is_ready: true
        })
      }
    }

    )
  },

  send_record: function () {
    let send_json = JSON.stringify({
      "status": 500,
      "data": this.data.record,
      "user_name": this.data.user_name
    });
    console.log(send_json);
    this.data.wxst.send({
      data: send_json
    })

    //这是错误记录，可以直接发送到服务器保存
    console.log(this.data.wrong_list)


  },

  judge: function (options) {
    this.setData({
      chosen: true
    })
    let percent = this.data.percent
    this.endTime();
    clearInterval(this.data.timer_id)
    console.log(options.currentTarget)
    console.log(options.currentTarget.dataset)
    let is_true = options.currentTarget.dataset.istrue;
    let answer_info = {}
    if (is_true === true) {
      console.log("回答正确");
      this.setData({
        right_info: "正确✔",
        wrong_info: ""
      })
      let score = this.data.questions[this.data.index].score;
      this.setData({
        score: this.data.score + score
      })
    }
    else {
      console.log("回答错误");
      this.data.wrong++;
      this.data.wrong_list.push(this.data.questions[this.data.index].id)
      //扣分
      let score = this.data.questions[this.data.index].score
      this.setData({
        right_info: "",
        wrong_info: "错误❌",
        score: this.data.score - score
      })
    }
    answer_info =
    {
      "question": this.data.questions[this.data.index].id,
      "is_true": is_true
    }

    let send_json = JSON.stringify({
      "status": 301,
      "message": answer_info,
      "user_id": this.data.user_id
    })
    console.log(send_json)
    this.data.wxst.send({
      data: send_json
    }
    )
    this.data.record.push({
      "question": this.data.questions[this.data.index].id,
      "is_true": is_true,
      "score": is_true ? this.data.questions[this.data.index].score : -this.data.questions[this.data.index].score
    })
    console.log("index" + this.data.index);
    if (this.data.index >= this.data.questions.length - 1) {
      this.setData({
        end: true
      })
    }

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
        this.handleJoin(server_msg.message)
      }

      if (server_msg.status === 103) {
        msg_list.push(server_msg.message)
        this.handleleave(server_msg.message)
      }
      if (server_msg.status === 200) {
        msg_list.push(server_msg.message)
      }
      if (server_msg.status === 210) {
        msg_list.push(server_msg.message)
        this.get_question();
        this.startTime();
      }
      if (server_msg.status === 300) {
        console.log("hehe")
        console.log(server_msg.data)
        this.setData({
          question_list: server_msg.data,
          questions: server_msg.data.question_list,
          length: server_msg.data.question_list.length
        })
      }
      if (server_msg.status === 401) {
        console.log(server_msg.message)
        this.data.is_all_answered = true
        this.startTime();
        if (this.data.index >= this.data.questions.length - 1) {
          console.log("已到最后一题")
          this.send_record();
          this.endTime();
          clearInterval(this.data.timer_id);
          return;
        }
        if (this.data.is_all_answered) {
          this.setData({
            index: this.data.index + 1,
            is_all_answered: false,
            chosen: false
          })
        }

      }
      if (server_msg.status === 502) {
        console.log("这是排名")
        console.log(server_msg.data)

        this.setData({
          rank: server_msg.data,
          is_ranked: true
        })
        console.log(this.data.rank)
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
    console.log(options.list);
    this.setData({
      room,
      question_list: options.list
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