## turbo-sdk-miniprogram

本文档为**微信小程序/小游戏**接入 [turbo 引力引擎](https://gravity-engine.com/)的技术接入方案，具体 Demo 请参考[GitHub](https://github.com/GravityInfinite/Turbo-MiniProgram-Demo)或者[Gitee](https://gitee.com/GravityInfinite/Turbo-MiniProgram-Demo)开源项目（国内用户推荐Gitee）。

目前支持以下买量平台跳转微信小程序/小游戏

1. 巨量引擎
2. 磁力引擎
3. 广点通

#### 引入

去上述开源代码仓库中下载 `turbo.min.js`文件并引入到工程中。

```javascript
var turbo = require("./utils/turbo.min.js");
```

#### init 初始化

```javascript
/**
 * 此方法会初始化Turbo需要的基础参数（需要确保每次启动都必须要调用）
 * @param {string} accessToken    项目通行证，在：网站后台-->管理中心-->应用列表中找到Access Token列 复制（首次使用可能需要先新增应用）
 * @param {string} client_id      用户唯一标识，如微信小程序/小游戏的openid
 */
turbo.init("your_access_token", "your_client_id");
```

#### register 用户注册

```javascript
/**
 * 在用户注册或者可以获取到用户唯一性信息时调用，推荐首次安装启动时调用
 * 后续其他接口，均需要等register接口完成之后才能继续调用
 * @param {string} name         用户名（必填）
 * @param {string} channel      用户注册渠道（必填）
 * @param {number} version      用户注册的程序版本（必填）
 * @param {string} click_id     用户点击广告id 微信小程序/小游戏选填
 * @param {string} wx_openid    微信open id (微信小程序和小游戏必填)
 * @param {string} wx_unionid   微信union id（微信小程序和小游戏选填）
 */

turbo
  .register({
    name: "user_name",
    channel: "user_channel",
    version: 123,
    click_id: "user_click_id",
    wx_openid: "user_wx_openid",
    wx_unionid: "user_wx_unionid",
  })
  .then(() => {
    // 在这之后继续做其他的方法调用
    wx.showToast({
      title: "register successfully",
    });
  });
```


#### handleEvent 埋点事件上报

```javascript
/**
 * 埋点事件上报
 * @param {string} event_type 埋点事件类型 分为
    activate                          激活
    register                          注册
    pay                               付费
    twice                             次留
    key_active                        关键行为
    start                             程序启动 每次启动结束之后都调用一次
 * @param properties          event_type=pay时必填，结构体，包含以下字段
    amount:                           原价金额,单位为分
    real_amount:                      实际付款金额,单位为分
 * @param {number} timestamp  事件发生时间 毫秒时间戳
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


#### queryUser 查询用户信息

```javascript
/**
 * 查询用户信息，包括
 * 1. client_id       用户ID
 * 2. channel         用户渠道
 * 3. click_company   用户买量来源，枚举值 为：tencent、bytedance、kuaishou  为空则为自然量用户
 * 4. aid             广告计划ID
 * 5. cid             广告创意ID
 * 6. advertiser_id   广告账户ID
 *
 * 返回示例如下，具体可以打印返回的data查看
 * "user_list": [
      {
        "create_time": "2022-09-09 14:50:04",
        "client_id": "Bn2RhTcU",
        "advertiser_id": "12948974294275",
        "channel": "wechat_mini_game",
        "click_company": "gdt",
        "aid": "65802182823",
        "cid": "65580218538"
      },
    ]
 */
turbo.queryUser().then((data) => {
  wx.showToast({
    title: "queryUser successfully",
  });
});
```


#### updateData 用户数据更新

```javascript
/**
 * 用户数据更新
 * @param {string} click_id       用户点击广告id 微信小程序/小游戏传入选填
 * @param {string} wx_openid      用户wxopenid 微信小程序/小游戏传入
 * @param {string} wx_unionid     微信union_id 微信小程序/小游戏选填
 */

turbo
  .updateData({
    click_id: "user_click_id",
    wx_openid: "user_wx_openid",
    wx_unionid: "user_wx_unionid",
  })
  .then(() => {
    wx.showToast({
      title: "updateData successfully",
    });
  });
```

#### consumerEvent 消费事件

```javascript
/**
 * 消费事件
 * @param {string} event_type   消费事件类型 分为
    START                         小程序启动
    CLICK_SURVEY                  点击开始填写问卷
    SUBMIT_SURVEY                 提交问卷
    CLICK_RECOMMEND_COMMODITY     点击查看推荐商品
    ADD_TO_CART                   加入购物车
    PRIVILEGE                     礼遇
    SETTLEMENT                    结算
    PAY                           支付
 * @param {number} ts           事件发生时间 毫秒时间戳
 * @param {number} amount       原价金额 单位为分 event_type=PAY时需要
 * @param {number} real_amount  实际付款金额 单位为分 event_type=PAY时需要
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
