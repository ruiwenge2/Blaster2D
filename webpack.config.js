const path = require("path");
const webpack = require("webpack");

const config = {
  entry: "./src/main.js",
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "public"),
  },
  mode: "production"
};

const compiler = webpack(config, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(stats.toString({
    chunks: false,
    colors: true
  }));
});