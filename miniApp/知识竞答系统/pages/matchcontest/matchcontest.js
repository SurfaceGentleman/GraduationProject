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
    status: 'success',
    timer_id: 0,
    length: 0,
    chosen: false,
    is_ranked: false,
    user_record: []
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

    if (this.data.percent === 20) {
      this.setData({
        status: 'active'
      });
    }

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
          that.data.wrong_list.push(
            {
              'question': that.data.questions[that.data.index].id,
              'user': that.data.user_id
            }
          )
          that.setData({
            right_info: "",
            wrong_info: "未作答❌",

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
  get_question: function (options) {
    let datas = JSON.stringify({
      "status": 300,
      "question_list_id": 1
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

    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8000/api/user_wrong/' + this.data.user_id + '/',
      method: 'post',
      data: that.data.wrong_list,
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
      let score = (1 - percent / 100.0) * this.data.questions[this.data.index].score;
      this.setData({
        score: this.data.score + score
      })
    }
    else {
      console.log("回答错误");
      this.data.wrong++;
      this.data.wrong_list.push(
        {
          'question': this.data.questions[this.data.index].id,
          'user': this.data.user_id
        }
      )
      this.setData({
        right_info: "",
        wrong_info: "错误❌"
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
      "score": is_true ? (1 - percent / 100.0) * this.data.questions[this.data.index].score : 0
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
      this.get_question();
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
        if (server_msg.user_id == this.data.user_id) {
          this.startTime()
        }

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
        //无组织者
        if (this.data.user_record.length == this.data.user_list.length) {
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


  compare: function (x, y) {
    if (x.score < y.score) {
      return 1;
    } else if (x.score > y.score) {
      return -1;
    } else {
      return 0;
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
    this.data.wxst.close();
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