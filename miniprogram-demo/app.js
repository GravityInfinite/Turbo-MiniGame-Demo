// app.js
var turbo = require('./utils/turbo.min.js');
App({
  onLaunch() {
    turbo.init('your_access_token', "your_client_id");
  },
  globalData: {}
})