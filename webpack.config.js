const path = require("path");
const webpack = require("webpack");

const config = {
  entry: {
    game: "./src/main.js",
    skins: "./src/skins.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public"),
  },
  mode: "production" // currently working on stuff
};

const compiler = webpack(config, (err, stats) => {
  if(err) {
    console.error(err);
    return;
  }

  console.log(stats.toString({
    chunks: false,
    colors: true
  }));
});