const path = require('path');

module.exports = {
  mode: "development",
  entry: "./main.tsx",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "."),
    filename: "./bundle.js",
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: "ts-loader",
    }, {
      test: /\.scss?$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: () => [require('autoprefixer')]
          }
        }
      }, {
        loader: 'sass-loader'
      }]
    }]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".scss", ".js", ".sass"]
  },
  stats: {
    errorDetails: true
  }
}

