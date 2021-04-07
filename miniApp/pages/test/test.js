// pages/test/test.js
var util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    testid: 0,
    index: 0,
    list: [],
    checked: false,
    items: [],
    current: "",
    chosen: [],
    score: 0,
    wrongList: [],
    wrong: 0,
    record: [],
    total: 0
  },
  radioChange({ detail = {} }) {
    this.setData({
      current: detail.value
    });
  },
  handleIndex(options) {
    console.log(options.currentTarget.dataset.id)
  },
  handleClick() {
    this.setData({
      position: this.data.position.indexOf('left') !== -1 ? 'right' : 'left',
    });
  },
  handleDisabled() {
    this.setData({
      disabled: !this.data.disabled
    });
  },
  handleAnimalChange({ detail = {} }) {
    this.setData({
      checked: detail.current
    });
  },
  getId(options) {
    console.log(options.currentTarget.dataset.id)
  },
  radioChange(options) {
    console.log(options)
    this.data.chosen[this.data.index] = options.detail.value
    this.setData({
      current: options.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options);
    wx.setNavigationBarTitle({
      title: options.name,
    })
    //success回调this作用域更新不了外面的数据,所以保存当前this
    var that = this
    wx.request({
      url: 'http://127.0.0.1:8021/app01/question_lists/' + options.testid + "/",
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var question_lists = res.data;
        that.setData({
          list: question_lists.question_list,
          question_list: question_lists,
          //加载第一题
          index: 0
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
  nextQuestion: function (options) {
    // 如果没有选择
    if (this.data.chosen[this.data.index] == undefined || this.data.chosen[this.data.index].length == 0) {
      wx.showToast({
        title: '请选择至少一个答案!',
        icon: 'none',
        duration: 2000,
        success: function () {
          return;
        }
      })
      return;
    }


    console.log("选择了" + this.data.current)
    this.chooseError();
    this.setData({
      index: this.data.index + 1,
      chosen: [],
      current: ""
    })
  },
  getTotal() {
    for (let index = 0; index < this.data.list.length; index++) {
      this.data.total += this.data.list[index].score;
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

  },
  chooseError: function () {
    //正确选项
    var trueValue = [];
    let is_true;
    for (let i = 0; i < this.data.list[this.data.index].option_list.length; i++) {
      console.log("呵呵" + this.data.list[this.data.index])
      if (this.data.list[this.data.index].option_list[i].is_true) {
        trueValue.push(this.data.list[this.data.index].option_list[i].text)
      }
    }
    console.log("正确选项:" + trueValue)
    //已选选项
    var chooseVal = []
    chooseVal.push(this.data.current)
    console.log("已选:" + chooseVal)
    if (chooseVal.toString() != trueValue.toString()) {
      console.log("错了");
      is_true = false
      this.data.wrong++;
      this.data.wrongList.push(this.data.index);
    } else {
      this.data.score += this.data.list[this.data.index].score
      is_true = true
      console.log("对了")
    }
    this.data.record.push({ "question": this.data.list[this.data.index].id, "is_true": is_true })
  },
  submit: function (options) {
    var time = util.formatTime(new Date());
    this.getTotal();
    //let answer_info = JSON.parse(this.data.record)
    //console.log(answer_info)
    var that = this;
    wx.request({
      url: 'http://127.0.0.1:8021/app01/upload_test/',
      method: "POST",
      data: {
        "test_info": {
          "test_name": time.toString() + this.data.question_list.name,
          "user": 1,
          "score": this.data.score
        },
        "answer_info": this.data.record
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let t_id = res.data.记录id;
        wx.navigateTo({
          url: '/pages/end/end?' + "testid=" + t_id + "&total=" + that.data.total + "&score=" + that.data.score,
          //url: '/pages/end/end?' + "testid=" + t_id,
        })
      },
      fail(res) {
        console.log(res.data)
        wx.showToast({
          title: '请求失败',
        })
      }
    })
  }
})