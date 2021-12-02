const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser");
const squoosh = require("gulp-libsquoosh");
const webp = require("gulp-webp");
const del = require("del");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const svgstore = require('gulp-svgstore');


// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), csso]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const devStyles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

exports.devStyles = devStyles;

//HTML
const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"))
}

exports.html = html;

//Scrits
const scripts = () => {
  return gulp.src("source/js/script.js")
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest("build"))
}

exports.scripts = scripts;

//Images
const optimizeImage = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(squoosh())
    .pipe(gulp.dest("build/img"))
}

exports.optimizeImage = optimizeImage;

const copyImage = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(gulp.dest("build/img"))
}

exports.copyImage = copyImage;

//Webp
const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality:90}))
    .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;

//Sprite
const sprite = () => {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

//Copy
const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.svg",
    "!source/img/icons/*.svg"
  ],{
    base: "source"
  })
  .pipe(gulp.dest("build"))

  done();
}

exports.copy = copy;


//Clean
const clean = async (done) => {
  await del(["build"]);
  done();
}

exports.clean = clean;


// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("devStyles"));
  gulp.watch("source/js/script.js", gulp.series("scripts"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

const build = gulp.series(
  clean,
  copy,
  optimizeImage,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp)
);

exports.build = build;


exports.default = gulp.series(
  clean,
  copy,
  copyImage,
  gulp.parallel(
    devStyles,
    html,
    scripts,
    sprite,
    createWebp),
    gulp.series(
      server,
      watcher
    )
);
