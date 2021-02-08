const gulp = require('gulp');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const sass = require("gulp-sass");

function bundle () {
	return webpackStream(webpackConfig, webpack).pipe(gulp.dest('./dist'));
}

function compileSass() {
  // style.scssファイルを取得
  return gulp
      .src("src/sass/style.scss")
      // Sassのコンパイルを実行
      .pipe(sass())
      // cssフォルダー以下に保存
      .pipe(gulp.dest("./dist"));
}

function compileHtml() {
  return gulp
      .src("src/html/index.html")
      .pipe(gulp.dest("./dist"));
}

// 監視用タスク
function watch() {
	gulp.watch('./src/**/*', gulp.series(bundle, compileSass, compileHtml));
}

// 実行時、bundleしてから監視開始
exports.default = gulp.series(bundle, compileSass, compileHtml, watch);