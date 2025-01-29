// Default plugins
import gulp from "gulp";
const { src, dest, watch, task, series, parallel } = gulp;
import fs from "fs";
import concat from "gulp-concat";
import clean from "gulp-clean";
import map from "gulp-sourcemaps";
import size from "gulp-size";
import change from "gulp-changed";
import plumber from "gulp-plumber";
import { exec } from "child_process";

// Plugins for styles
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
const scss = gulpSass(dartSass);
import cleanCss from "gulp-clean-css";
import autoprefixer from "gulp-autoprefixer";

// Plugins for HTML
import htmlmin from "gulp-htmlmin";
import notify from "gulp-notify";
import fileinclude from "gulp-file-include";

//Plugins for images
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin";
import webp from "gulp-webp";
import webpHTML from "gulp-webp-html";
import webpCSS from "gulp-webp-css";

import browserSync from "browser-sync";
const bs = browserSync.create();

/* import svgSprite from "gulp-svg-sprite"; */

import fonter from "gulp-fonter";
import ttf2woff2 from "gulp-ttf2woff2";

const buildFolder = "./app";
const srcFolder = "./src";

const path = {
  build: {
    html: buildFolder,
    css: `${buildFolder}/css`,
    images: `${buildFolder}/img/`,
    fonts: `${buildFolder}/fonts/`,
    svg: `${buildFolder}/sprite/`,
    additionalCss: `${buildFolder}/css/`,
  },
  src: {
    html: `${srcFolder}/index.html`,
    css: `${srcFolder}/assets/scss/main.scss`,
    images: `${srcFolder}/img/**/*`,
    fonts: `${srcFolder}/assets/fonts/`,
    svg: `${srcFolder}/assets/sprite/*.svg`,
    additionalCss: `${srcFolder}/css/*.css`,
  },
};

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

function html() {
  return src(path.src.html)
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(
      fileinclude({
        basepath: "@file",
      })
    )
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(webpHTML())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(plumber.stop())
    .pipe(dest(path.build.html))
    .pipe(bs.stream());
}

function styles() {
  return (
    src(path.src.css)
      .pipe(change("app/css"))
      .pipe(plumber(plumberNotify("SCSS")))
      .pipe(map.init())
      .pipe(
        size({
          showFiles: true,
        })
      )
      .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 8 versions"],
          cascade: false,
        })
      )
      /*  .pipe(webpCSS()) */
      .pipe(cleanCss())
      .pipe(concat("styles.min.css"))
      .pipe(
        size({
          showFiles: true,
        })
      )
      .pipe(map.write("."))
      .pipe(plumber.stop())
      .pipe(dest(path.build.css))
      .pipe(bs.stream())
  );
}

function images() {
  return src(path.src.images)
    .pipe(change("app/img/"))
    .pipe(webp())
    .pipe(dest(path.build.images))

    .pipe(src(path.src.images))
    .pipe(change("app/img/"))
    .pipe(
      imagemin(
        [
          gifsicle({ interlaced: true, optimizationLevel: 2 }),
          mozjpeg({ quality: 75, progressive: true }),
          optipng({ optimizationLevel: 5 }),
          svgo({
            plugins: [
              {
                name: "removeViewBox",
                active: true,
              },
              {
                name: "cleanupIDs",
                active: false,
              },
            ],
          }),
        ],
        { verbose: true }
      )
    )
    .pipe(dest(path.build.images));
}

function otfToTtf() {
  return src(`${path.src.fonts}*.otf`)
    .pipe(plumber(plumberNotify("otfToTtf")))
    .pipe(
      fonter({
        formats: ["ttf"],
      })
    )
    .pipe(dest(path.build.fonts));
}

function ttfToWoff() {
  return src(`${path.src.fonts}*.ttf`)
    .pipe(plumber(plumberNotify("ttfToWoff")))
    .pipe(
      fonter({
        formats: ["woff"],
      })
    )
    .pipe(dest(path.build.fonts))

    .pipe(src(`${path.src.fonts}*.ttf`))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

function loadWoff2() {
  return src(`${path.src.fonts}*.woff2`).pipe(dest(path.build.fonts));
}

function svgBuild() {
  return src(path.src.svg).pipe(dest(path.build.svg)).pipe(bs.stream());
}

function server() {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
    notify: false,
  });
}

function watchFiles() {
  watch(["./src/index.html", "./src/html/*.html"], html);
  watch(["./src/assets/scss/**/*.scss"], styles);
}

task("clean", function (done) {
  if (fs.existsSync("./app/")) {
    return src("./app/", { read: false }).pipe(clean());
  }
  done();
});

function additionalCss() {
  return src(path.src.additionalCss)
    .pipe(cleanCss())
    .pipe(dest(path.build.additionalCss));
}

const fonts = series(otfToTtf, ttfToWoff, loadWoff2);

gulp.task("webpack", function (cb) {
  exec(
    "npx webpack --config webpack.config.js",
    function (err, stdout, stderr) {
      console.log(stdout);
      console.error(stderr);
      cb(err);
    }
  );
});

task(
  "default",
  series(
    "clean",
    fonts,
    parallel(html, styles, additionalCss, images, svgBuild),
    "webpack",
    parallel(watchFiles, server)
  )
);

export { styles, html, images, server, watchFiles, additionalCss };
