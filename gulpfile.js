const gulp = require('gulp');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const sass = require("gulp-sass");
const browserSync = require("browser-sync");

function server(done) {
	browserSync({
		server: {
			baseDir: './dist/'
		}
	});
	done();
}

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
  const browserReload = (done) => {
	    browserSync.reload();
	    done();
	  };
	gulp.watch('./src/**/*', gulp.series(gulp.parallel(bundle, compileSass, compileHtml), browserReload));
}

// 実行時、bundleしてから監視開始
exports.default = gulp.series(gulp.parallel(bundle, compileSass, compileHtml), gulp.series(server, watch));