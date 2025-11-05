const path = require("path");

module.exports = {
  mode: "production",
  entry: "./server.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        type: "json",
        parser: {
          parse: JSON.parse,
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    mainFields: ["main", "module"],
  },
  resolveLoader: {
    modules: ["node_modules"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  optimization: {
    minimize: false, // Desabilita minificação para facilitar debug, mas você pode ativar se quiser
  },
};
