const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const path = require("path");

module.exports = {
  mode: "production",
  target: "web",
  entry: {
    contentScript: "./src/content/index.ts",
    background: "./src/background/index.ts",
    react: "./src/react/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "manifest.json"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    new Dotenv(),
    new webpack.DefinePlugin({
        'process.env.AZURE_CLIENT_ID': JSON.stringify(process.env.AZURE_CLIENT_ID),
        'process.env.AZURE_AUTHORITY': JSON.stringify(process.env.AZURE_AUTHORITY),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx"],
  },
};
