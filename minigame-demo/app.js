// app.js
import turbo from "./utils/turbo.min.js"
App({
  onLaunch() {
    turbo.setPara({
      autoTrack: {
        appShow: true
      },
      show_log: true
    })
    turbo.init('h8djf2K9adp3FHQESLbsjqmXk7pgsaAm', "your_client_id");
  },
  globalData: {}
})