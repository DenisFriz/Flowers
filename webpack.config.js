import path from "path";

export default {
  mode: "production",
  entry: "./src/js/main.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve("app/js/"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join("app/js"),
    },
    compress: true,
    port: 9000,
    hot: true, // Включение горячей замены модулей
    open: true, // Автоматическое открытие браузера
    watchFiles: ["src/js/**/*"], // Наблюдение за изменениями в исходных файлах
  },
};
