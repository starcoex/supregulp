import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-imagemin";
// import sass from "gulp-sass";
import gulpSass from "gulp-sass";
import nodeSass from "node-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

const sass = gulpSass(nodeSass);
sass.compiler = require("node-sass");
// const sass = require("gulp-sass")(require("node-sass"));

const routers = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

const pug = () =>
  gulp.src(routers.pug.src).pipe(gpug()).pipe(gulp.dest(routers.pug.dest));
const clean = () => del(["build/", ".publish"]);
const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

const styles = () =>
  gulp
    .src(routers.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ browsers: ["last 2 versions"] }))
    .pipe(miniCSS())
    .pipe(gulp.dest(routers.scss.dest));

const js = () =>
  gulp
    .src(routers.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routers.js.dest));

const gh = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routers.pug.watch, pug);
  gulp.watch(routers.img.src, img);
  gulp.watch(routers.scss.watch, styles);
  gulp.watch(routers.js.watch, js);
};
const img = () =>
  gulp.src(routers.img.src).pipe(image()).pipe(gulp.dest(routers.img.dest));
const prepare = gulp.series([clean, img]);
const assets = gulp.series([pug, styles, js]);
const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh, clean]);
