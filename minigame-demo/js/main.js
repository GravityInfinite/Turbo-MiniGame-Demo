import turbo from "./utils/turbo.min"

export default class Main {
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
  }
  handleEvent() {
    turbo
      .handleEvent({
        event_type: "pay",
        properties: {
          amount: 100,
          real_amount: 200,
        },
        timestamp: 1000,
        use_client_time: true,
        trace_id: "test",
      })
      .then(() => {
        wx.showToast({
          title: "handleEvent successfully",
        });
      });
  }
  handleQueryUser() {
    turbo.queryUser().then((data) => {
      console.log(data);
      wx.showToast({
        title: "queryUser successfully",
      });
    });
  }

  //事件上报相关demo

  // 若某key已存在则覆盖,否则将自动创建并赋值
  handleProfileSet() {
    turbo.profileSet({
      $first_visit_time: new Date().toLocaleString('cn', {
        hour12: false
      }).replaceAll("/", "-"),
      friends_num: 1,
      arr: [1, 2],
      "$name": "your_value",
      "$gender": "x",
      $signup_time: new Date().toLocaleString('cn', {
        hour12: false
      }).replaceAll("/", "-")
    })
  }

  // 此事件在第一次$MPLaunch后会自动调用，若该key已存在则忽略，否则将自动创建并赋值
  handleProfileSetOnce() {
    turbo.profileSetOnce({
      "$first_visit_time": new Date().toLocaleString('cn', {
        hour12: false
      }).replaceAll("/", "-")
    })
  }

  // 增加或减少一个用户的某个NUMBER类型的Profile值
  handleProfileIncrement() {
    turbo.profileIncrement({
      friends_num: 2
    })
  }

  // 删除一个用户的整个 Profile
  handleProfileDelete() {
    turbo.profileDelete()
  }

  // 向某个用户的某个数组类型的Profile添加一个或者多个值,默认不去重
  handleProfileAppend() {
    turbo.profileAppend({
      arr: [3, 4]
    })
  }

  // 将某个用户的某些属性值设置为空
  handleProfileUnset() {
    turbo.profileUnset("arr")
  }

  // 设置所有事件都需要添加的属性
  handleRegisterApp() {
    turbo.registerApp({
      "test_register_app_key": "test_register_app_value"
    })
  }

  handleRegisterEvent() {
    turbo.registerEvent()
  }
  handleLoginEvent() {
    turbo.loginEvent()
  }
  handleLogoutEvent() {
    turbo.logoutEvent()
  }

  // 自定义track
  handleCustomTrack() {
    turbo.track("test", {
      $pay_type: "rmb"
    })
  }
}