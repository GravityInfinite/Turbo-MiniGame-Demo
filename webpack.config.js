const path = require("path");

module.exports = {
  entry: "./src/index.js",
  resolve: {
    extensions: [".js"],
  },
  output: {
    // path: path.resolve(__dirname, "minigame-demo/utils"),
    path: path.resolve(__dirname, "dist"),
    filename: "turbo.min.js",
    library: {
      name: "turbo.min",
      type: "umd",
    },
  },
};
