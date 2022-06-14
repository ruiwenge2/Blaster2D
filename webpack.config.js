import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  entry: "./src/main.js",
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "public"),
  },
  mode: "production"
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