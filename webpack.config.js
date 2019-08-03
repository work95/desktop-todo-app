const path = require("path");
const nodeExternals = require("webpack-node-externals");

const config = {
  entry: "./app/js/index.js",
  mode: "development",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "main.js",
    sourceMapFilename: "main.map"
  },
  devtool: "#source-map",
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
				test: /\.css$/,
				use: ["style-loader", "css-loader", {
					loader: "postcss-loader",
					options: {
						plugins: () => [require("autoprefixer")]
					}
				}]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/"
            }
          }
        ]
      }
    ]
  }
};

module.exports = config;
