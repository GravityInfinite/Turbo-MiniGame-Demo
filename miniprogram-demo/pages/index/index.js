// index.js
var turbo = require("../../utils/turbo.min.js");
Page({
  onLoad() {},
  data: {},
  handleRegister() {
    turbo
      .register({
        name: "your_name",
        channel: "your_channel",
        version: 123,
        click_id: "your_click_id",
        wx_openid: "your_wx_openid",
        wx_unionid: "your_wx_unionid",
      })
      .then(() => {
        wx.showToast({
          title: "handleRegister successfully",
        });
      });
  },
  handleUpdateData() {
    turbo
      .updateData({
        click_id: "your_click_id",
        wx_openid: "your_wx_openid",
        wx_unionid: "your_wx_unionid",
      })
      .then(() => {
        wx.showToast({
          title: "handleUpdateData successfully",
        });
      });
  },
  handleEvent() {
    turbo
      .handleEvent({
        event_type: "pay",
        properties: {
          amount: 100,
          real_amount: 200,
        },
        timestamp: 1000,
      })
      .then(() => {
        wx.showToast({
          title: "handleEvent successfully",
        });
      });
  },
  handleConsumerEvent() {
    turbo
      .consumerEvent({
        event_type: "START",
        ts: 1,
        amount: 1,
        real_amount: 2,
      })
      .then(() => {
        wx.showToast({
          title: "handleConsumerEvent successfully",
        });
      });
  },
  handleQueryUser() {
    turbo.queryUser().then((data) => {
      console.log(data);
      wx.showToast({
        title: "queryUser successfully",
      });
    });
  },
});
