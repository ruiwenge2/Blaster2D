const path = require("path");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "public"),
  },
  mode: "development"
};