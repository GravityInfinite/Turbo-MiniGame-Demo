function isNumber(a) {
  return "number" === typeof a
    ? 0 === a - a
    : "string" === typeof a && "" !== a.trim()
    ? Number.isFinite
      ? Number.isFinite(+a)
      : isFinite(+a)
    : !1;
}

var baseurl = "https://turbo.api.plutus-cat.com/event_center/api/v1";
var header = {
  "content-type": "application/json",
};

var globalData = {
  access_token: "",
  client_id: "",
};

var turbo = {};

/**
 * @name getQuery
 * @return {object} url query
 */
function getQuery() {
  return wx.getLaunchOptionsSync().query || {};
}

/**
 * @name getPlatForm
 * @return {string} platform name
 */
function getPlatForm() {
  var query = getQuery();
  if (query.ksUnitId || query.ksCampaignId || query.ksChannel) {
    return "kuaishou";
  } else if (
    query.clue_token ||
    query.ad_id ||
    query.creative_id ||
    query.request_id ||
    query.advertiser_id
  ) {
    return "bytedance";
  } else {
    return "";
  }
}

function globalChecked() {
  if (!globalData.access_token) {
    throw new Error("access_token is missing, you must call init first.");
  }
  if (!globalData.client_id) {
    throw new Error("client_id is missing, you must call init first.");
  }
}

/**
 * @name init
 * @param {string} access_token
 * @param {string} client_id
 */
turbo.init = function (access_token = "", client_id = "") {
  if (!access_token) {
    throw new Error("access_token must be required.");
  }

  if (!client_id) {
    throw new Error("client_id must be required.");
  }
  globalData.access_token = access_token;
  globalData.client_id = client_id;
};

turbo.register = function (e = {}) {
  globalChecked();
  if (!e?.name) {
    throw new Error("name must be required");
  }
  if (!e?.channel) {
    throw new Error("channel must be required");
  }
  if (!e?.version && e?.version !== 0) {
    throw new Error("version must be required");
  }
  if (!isNumber(e?.version) || typeof e?.version !== "number") {
    throw new Error("version must be type: Number");
  }
  var platform = getPlatForm();
  var data = {
    client_id: globalData.client_id,
    name: e.name,
    channel: e.channel,
    version: e.version,
    media_type: platform || "tencent",
    wx_openid: e?.wx_openid || "",
    wx_unionid: e?.wx_unionid || "",
    click_id: e?.click_id || "",
    ad_data: {},
  };
  var query = getQuery();
  if (platform === "kuaishou") {
    data.ad_data = {
      callback: query?.callback || "",
      ksCampaignId: query?.ksCampaignId || "",
      ksUnitId: query?.ksUnitId || "",
      ksCreativeId: query?.ksCreativeId || "",
      ksChannel: query?.ksChannel || "",
    };
  } else if (platform === "bytedance") {
    data.ad_data = {
      clue_token: query?.clue_token || "",
      ad_id: query?.ad_id || "",
      creative_id: query?.creative_id || "",
      advertiser_id: query?.advertiser_id || "",
      request_id: query?.request_id || "",
    };
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${baseurl}/user/register/?access_token=${globalData.access_token}`,
      method: "POST",
      header,
      data,
      success(res) {
        res.statusCode === 200 ? resolve(res.data) : reject(res);
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

turbo.updateData = function (e = {}) {
  globalChecked();
  var platform = getPlatForm();
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${baseurl}/user/update_data/?access_token=${globalData.access_token}&client_id=${globalData.client_id}`,
      method: "POST",
      header,
      data: {
        click_id: e?.click_id || "",
        wx_openid: e?.wx_openid || "",
        media_type: platform || e?.media_type || "tencent",
        wx_unionid: e?.wx_unionid || "",
      },
      success(res) {
        res.statusCode === 200 ? resolve(res.data) : reject(res);
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

turbo.handleEvent = function (e = {}) {
  globalChecked();
  if (!e?.event_type) {
    throw new Error("event_type must be required");
  }
  var data = {
    event_type: e?.event_type || "",
  };
  if (e?.properties) {
    data.properties = e?.properties;
  }
  if (e?.timestamp) {
    data.timestamp = e?.timestamp;
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${baseurl}/event/handle_event/?access_token=${globalData.access_token}&client_id=${globalData.client_id}`,
      method: "POST",
      header,
      data,
      success(res) {
        res.statusCode === 200 ? resolve(res.data) : reject(res);
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

turbo.consumerEvent = function (e = {}) {
  globalChecked();
  if (!e?.event_type) {
    throw new Error("event_type must be required");
  }
  if (!e?.ts && e?.ts !== 0) {
    throw new Error("ts must be required");
  }
  if (!isNumber(e?.ts)) {
    throw new Error("ts must be type: Number");
  }
  var data = {
    event_type: e?.event_type,
    ts: e?.ts,
  };
  if (e?.amount) {
    data.amount = e?.amount;
  }
  if (e?.real_amount) {
    data.real_amount = e?.real_amount;
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${baseurl}/event/consumer_event/?access_token=${globalData.access_token}&client_id=${globalData.client_id}`,
      method: "POST",
      header,
      data,
      success(res) {
        res.statusCode === 200 ? resolve(res.data) : reject(res);
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

turbo.queryUser = function () {
  globalChecked();
  var data = {
    user_list: [globalData.client_id],
  };
  return new Promise(function (resolve, reject) {
    wx.request({
      url: `${baseurl}/user/get/?access_token=${globalData.access_token}`,
      method: "POST",
      header,
      data,
      success(res) {
        res.statusCode === 200 ? resolve(res.data) : reject(res);
      },
      fail(err) {
        reject(err);
      },
    });
  });
};

module.exports = turbo;
