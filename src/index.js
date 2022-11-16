import { register, handleEvent, queryUser } from "./lib/customEvent";
import { autoTrackCustom } from "./lib/metaEvent";
import { header, batch_send_default } from "./lib/config";
import { getStorageSync, logger, extend2Lev, isObject } from "./utils/tools";
import { eventProperty } from "./lib/eventProperty";

const turbo = {};

turbo.register = register;
turbo.handleEvent = handleEvent;
turbo.queryUser = queryUser;

turbo._autoTrackCustom = autoTrackCustom;
turbo._globalData = {
  access_token: "",
  client_id: "",
};
turbo._batch_send_default = batch_send_default;
turbo._is_first_launch = false;
turbo._current_scene = null;
turbo._store = {
  storageInfo: null,
  mem: {
    mdata: [],
    getLength: function () {
      return this.mdata.length;
    },
    add: function (data) {
      this.mdata.push(data);
    },
    clear: function (len) {
      this.mdata.splice(0, len);
    },
    getMultList: function (arr) {
      const p = [];
      for (let item of arr) {
        const index = p.findIndex((i) => i[0] && i[0].type === item.type);
        if (index === -1) {
          p.push([item]);
        } else {
          p[index].push(item);
        }
      }
      const end = [];
      const commonProps = eventProperty.getProperties();
      for (let item of p) {
        const type = item.length ? item[0]?.type : "track";
        end.push({
          client_id: turbo._globalData.client_id,
          type,
          event_list: item.map((subitem) => {
            const properties = {};
            // 加入预定义属性
            Object.keys(subitem.properties).forEach((key) => {
              properties[key] = subitem.properties[key];
            });
            // 加入带$的公共属性
            if (type !== "profile") {
              Object.keys(commonProps).forEach((key) => {
                properties[key] = commonProps[key];
              });
            }

            return {
              event: subitem.event,
              time: subitem.time,
              properties,
            };
          }),
        });
      }
      return end;
    },
  },
  getStorage: function () {
    if (this.storageInfo) {
      return this.storageInfo;
    } else {
      this.storageInfo = getStorageSync(turbo._para.storage_store_key) || "";
      return this.storageInfo;
    }
  },
  init: function () {
    const info = this.getStorage();
    if (!info) {
      turbo._is_first_launch = true;
      wx.setStorageSync(turbo._para.storage_store_key, true);
      turbo.profileSetOnce({
        $first_visit_time: new Date()
          .toLocaleString("cn", {
            hour12: false,
          })
          .replaceAll("/", "-"),
      });
    }
  },
};
turbo._para = {
  name: "Gravity Engine",
  server_url:
    "https://turbo.api.plutus-cat.com/event_center/api/v1/eventv2/collect/",
  autoTrack: {
    appLaunch: true, // 默认为 true，false 则关闭 $MPLaunch 事件采集
    appShow: true, // 默认为 true，false 则关闭 $MPShow 事件采集
    appHide: true, // 默认为 true，false 则关闭 $MPHide 事件采集
  },
  // 是否允许控制台打印查看埋点数据(建议开启查看)
  show_log: false,
  storage_store_key: "turbo2022_wechat",
};
turbo._meta = {
  life_state: {
    app_launched: false,
  },
};

function initAppProxy() {
  // miinprogram: wx.onAppShow
  if (turbo?._para?.autoTrack?.appShow) {
    wx.onShow(function (para) {
      if (!turbo._meta.life_state.app_launched) {
        if (turbo?._para?.autoTrack?.appLaunch) {
          const option = wx.getLaunchOptionsSync() || {};
          turbo._autoTrackCustom.appLaunch(option);
        }
      }
      turbo._autoTrackCustom.appShow(para);
    });
  }
  if (turbo?._para?.autoTrack?.appHide) {
    // miinprogram: wx.onAppHide
    wx.onHide(function () {
      turbo._autoTrackCustom.appHide();
    });
  }
}
function checkAppLaunch() {
  if (!turbo._meta.life_state.app_launched) {
    const option = wx.getLaunchOptionsSync() || {};
    turbo._meta.life_state.app_launched = true;
    turbo._current_scene = option.scene;
    turbo._autoTrackCustom.appLaunch(option);
  }
}

turbo.setPara = function (para) {
  turbo._para = extend2Lev(turbo._para, para);
  // 防改参数
  turbo._para.server_url =
    "https://turbo.api.plutus-cat.com/event_center/api/v1/eventv2/collect/";
};

turbo.init = function (access_token = "", client_id = "") {
  if (!access_token) {
    throw new Error("access_token must be required.");
  }

  if (!client_id) {
    throw new Error("client_id must be required.");
  }
  eventProperty.infoInit();
  turbo._globalData.access_token = access_token;
  turbo._globalData.client_id = client_id;
  turbo._store.init();
  initAppProxy();
  sendStrategy.init();
  checkAppLaunch();
};

const sendStrategy = {
  dataHasSend: true,
  dataHasChange: false,
  syncStorage: false,
  failTime: 0,
  is_first_batch_write: true,
  init: function () {
    sendStrategy.batchInterval(); //定时器
  },
  send: function (data, callback) {
    if (turbo._store.mem.getLength() >= 500) {
      logger.info("数据量存储过大，有异常");
      turbo._store.mem.mdata.shift();
    }
    if (data) {
      turbo._store.mem.add(data);
      callback && callback();
    }
    if (turbo._store.mem.getLength() >= turbo._batch_send_default.max_length) {
      this.batchSend();
    }
  },
  requestAll: function (parmas) {
    return new Promise((resolve, reject) => {
      wx.request({
        url:
          turbo._para.server_url +
          `?access_token=${turbo._globalData.access_token}`,
        method: "POST",
        header,
        data: parmas,
        success: function () {
          resolve("");
        },
        fail: function () {
          reject("");
        },
      });
    });
  },
  wxrequest: function (option) {
    const data = turbo._store.mem.getMultList(option.data) || [];

    if (!option?.data?.length) {
      option.success(option.len);
      return;
    }

    const stack = [];
    for (let params of data) {
      stack.push(this.requestAll(params));
    }
    Promise.all(stack)
      .then(() => {
        option.success(option.len);
      })
      .catch(() => {
        option.fail();
      });
  },
  batchSend: function () {
    if (!turbo._globalData.client_id) {
      sendFail();
      return;
    }
    const data = turbo._store.mem.mdata;
    if (!data.length) {
      return;
    }
    this.wxrequest({
      data: data,
      len: data.length,
      success: this.batchRemove.bind(this),
      fail: this.sendFail.bind(this),
    });
  },
  sendFail: function () {
    this.dataHasSend = true;
    this.failTime++;
  },
  batchRemove: function (len) {
    turbo._store.mem.clear(len);
    this.dataHasSend = true;
    this.dataHasChange = true;
    this.batchWrite();
    this.failTime = 0;
  },
  batchWrite: function () {
    const me = this;
    if (this.dataHasChange) {
      if (this.is_first_batch_write) {
        this.is_first_batch_write = false;
        setTimeout(function () {
          me.batchSend();
        }, 1000);
      }
      this.dataHasChange = false;
    }
  },
  // ↓ 初始化的时候调用，interval batch
  batchInterval: function () {
    const _this = this;
    function loopWrite() {
      setTimeout(function () {
        _this.batchWrite();
        loopWrite();
      }, 500);
    }

    function loopSend() {
      setTimeout(function () {
        _this.batchSend();
        loopSend();
      }, turbo._batch_send_default.send_timeout * Math.pow(2, _this.failTime));
    }
    loopWrite();
    loopSend();
  },
};

const turboEvent = {
  send: function (data, callback) {
    // 1154：朋友圈内打开“单页模式”
    if (
      turbo._current_scene &&
      turbo._current_scene === 1154 &&
      !turbo._para.preset_events.moments_page
    ) {
      return false;
    }
    if (data) {
      logger.info(data);
      sendStrategy.send(data, callback);
    } else {
      logger.info("error: 数据异常 ", data);
    }
  },
};

turbo.track = function (event, properties, callback) {
  turboEvent.send(
    {
      type: "track",
      event,
      properties,
      time: Date.now(),
    },
    callback
  );
};

turbo.profileSet = function (properties, callback) {
  turboEvent.send(
    {
      type: "profile",
      event: "profile_set",
      properties,
      time: Date.now(),
    },
    callback
  );
};
turbo.profileSetOnce = function (properties, callback) {
  turboEvent.send(
    {
      type: "profile",
      event: "profile_set_once",
      properties,
      time: Date.now(),
    },
    callback
  );
};
turbo.profileIncrement = function (properties, callback) {
  turboEvent.send(
    {
      type: "profile",
      event: "profile_increment",
      properties,
      time: Date.now(),
    },
    callback
  );
};
turbo.profileDelete = function (callback) {
  turboEvent.send(
    {
      type: "profile",
      event: "profile_delete",
      properties: {},
      time: Date.now(),
    },
    callback
  );
};
turbo.profileAppend = function (properties, callback) {
  turboEvent.send(
    {
      type: "profile",
      event: "profile_append",
      properties,
      time: Date.now(),
    },
    callback
  );
};
turbo.profileUnset = function (key, callback) {
  turboEvent.send(
    {
      type: "profile",
      event: "profile_unset",
      properties: {
        [key]: null,
      },
      time: Date.now(),
    },
    callback
  );
};

turbo.registerApp = function (obj = {}) {
  if (!isObject(obj)) {
    logger.info("error: registerApp 参数必须是对象");
    return;
  }
  eventProperty.getRegisterProperties(obj);
};

turbo.registerEvent = function () {
  turbo.track("$MPRegister", {});
};

turbo.loginEvent = function () {
  turbo.track("$MPLogin", {});
};
turbo.logoutEvent = function () {
  turbo.track("$MPLogout", {});
};

export default turbo;
