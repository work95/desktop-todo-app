const path = require("path");
const nodeExternals = require("webpack-node-externals");

/* For the controller. */
const config1 = {
  entry: "./app/js/boot.js",
  mode: "development",
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "boot.js"
  },
  target: "node",
  externals: [nodeExternals()],
  node: {
    __dirname: false,
    __filename: false
  },
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

/* For the view. */
const config2 = {
  entry: "./app/js/index.js",
  mode: "development",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "start.js",
    sourceMapFilename: "start.map"
  },
  devtool: "#source-map",
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

module.exports = [config1, config2];