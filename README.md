## turbo-sdk-miniprogram

本文档为**微信小程序/小游戏**接入 [turbo 引力引擎](https://gravity-engine.com/)的技术接入方案，具体 Demo 请参考[GitHub 开源项目](https://github.com/GravityInfinite/Turbo-MiniProgram-Demo)。

目前支持以下买量平台跳转微信小程序/小游戏

1. 巨量引擎
2. 磁力引擎
3. 广点通

#### 引入

下载`turbo.min.js`文件并引入到工程中，文件可以去[GitHub 开源项目](https://github.com/GravityInfinite/Turbo-MiniProgram-Demo)下载。

```javascript
var turbo = require("./utils/turbo.min.js");
```

#### init 初始化

```javascript
/**
 * 此方法会初始化Turbo需要的基础参数
 * @param {string} accessToken   项目通行证，在：网站后台-->管理中心-->应用列表中找到Access Token列 复制（首次使用可能需要先新增应用）
 * @param {string} client_id 用户唯一标识，如微信小程序/小游戏的openid
 */
turbo.init("your_access_token", "your_client_id");
```

#### register 用户注册

```javascript
/**
 * 在用户注册或者可以获取到用户唯一性信息时调用，推荐首次安装启动时调用
 * @param {string} name 用户名
 * @param {string} channel   用户注册渠道
 * @param {number} version   用户注册的程序版本
 * @param {string} click_id  用户点击广告id 微信小程序/小游戏选填
 * @param {string} media_type 投放的媒体类型
    bytedance 头条（巨量广告）
    kuaishou 快手广告
    tencent 腾讯广告
 * @param {string} wx_openid 用户wxopenid 微信小程序/小游戏必填
 * @param {string} wx_unionid 微信union_id 微信小程序/小游戏选填
 */

turbo
  .register({
    name: "your_name",
    channel: "your_channel",
    version: 123,
    click_id: "your_click_id",
    media_type: "bytedance",
    wx_openid: "your_wx_openid",
    wx_unionid: "your_wx_unionid",
  })
  .then(() => {
    wx.showToast({
      title: "register successfully",
    });
  });
```

#### updateData 用户数据更新

```javascript
/**
 * 用户数据更新
 * @param {string} click_id 用户点击广告id 微信小程序/小游戏传入选填
 * @param {string} wx_openid 用户wxopenid 微信小程序/小游戏传入
 * @param {string} wx_unionid 微信union_id 微信小程序/小游戏选填
 * @param {string} media_type 投放的媒体类型
    bytedance 头条（巨量广告）
    kuaishou 快手广告
    tencent 腾讯广告
 */

turbo
  .updateData({
    click_id: "your_click_id",
    wx_openid: "your_wx_openid",
    wx_unionid: "your_wx_unionid",
    media_type: "bytedance",
  })
  .then(() => {
    wx.showToast({
      title: "updateData successfully",
    });
  });
```

#### handleEvent 埋点事件报

```javascript
/**
 * 埋点事件上报
 * @param {string} event_type 埋点事件类型 分为
    activate 激活
    register 注册
    pay 付费
    twice 次留
    key_active 关键行为
 * @param properties event_type=pay时必填，结构体，包含以下字段
    amount: 原价金额,单位为分
    real_amount: 实际付款金额,单位为分
 * @param {number} timestamp 事件发生时间 毫秒时间戳
 */

turbo
  .handleEvent({
    event_type: "pay",
    properties: {
      amount: 200,
      real_amount: 180,
    },
    timestamp: 1663227655000,
  })
  .then(() => {
    wx.showToast({
      title: "handleEvent successfully",
    });
  });
```

#### consumerEvent 消费事件

```javascript
/**
 * 消费事件
 * @param {string} event_type 消费事件类型 分为
    START 小程序启动
    CLICK_SURVEY 点击开始填写问卷
    SUBMIT_SURVEY 提交问卷
    CLICK_RECOMMEND_COMMODITY 点击查看推荐商品
    ADD_TO_CART 加入购物车
    PRIVILEGE 礼遇
    SETTLEMENT 结算
    PAY 支付
 * @param {number} ts 事件发生时间 毫秒时间戳
 * @param {number} amount 原价金额 单位为分 event_type=PAY时需要
 * @param {number} real_amount 实际付款金额 单位为分 event_type=PAY时需要
 */

turbo
  .consumerEvent({
    event_type: "PAY",
    ts: 1000,
    amount: 1000,
    real_amount: 2000,
  })
  .then(() => {
    wx.showToast({
      title: "handleConsumerEvent successfully",
    });
  });
```

#### License

Under BSD license，you can check out the license file
