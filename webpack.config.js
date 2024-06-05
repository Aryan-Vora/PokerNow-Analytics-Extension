const path = require("path");

module.exports = {
  entry: {
    content: "./content.js",
    popup: "./popup.js",
    background: "./background.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  devtool: "cheap-module-source-map", // Add this line
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
