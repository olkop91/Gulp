const gulp = require('gulp')
const less = require('gulp-less')
const del = require('del')
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const newer = require('gulp-newer')
const browserSync = require('browser-sync').create();
const gulppug = require('gulp-pug')
const sass = require('gulp-sass')(require('sass'));
const ts = require('gulp-typescript')
const coffee = require('gulp-coffee');
//Пути к файлам назначения
const paths = {
  pug: {
    src: 'src/*.pug',
    dest: 'dist/'
  },
  html: {
    src: 'src/*.html',
    dest: 'dist/'
  },
  styles: {
    src: ['src/styles/**/*.sass','src/styles/**/*.scss','src/styles/**/*.less'],
    dest: 'dist/css/'
  },
  scripts: {
    src: ['src/scripts/**/*.ts','src/scripts/**/*.js','src/scripts/**/*.coffee'],
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/*',
    dest: 'dist/img'
  }
}

function clean() {
  return del(['dist/*', '!dist/img'])

};


function pug() {
  return gulp.src(paths.pug.src)
    .pipe(gulppug())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browserSync.stream())
}

function html() {
  return gulp.src(paths.html.src)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream())
}

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(less())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
};

function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(coffee({bare:true}))
    //Typescript
  //   .pipe(ts({
  //     noImplicitAny: true,
  //     outFile: 'main.min.js'
  // }))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
}

function img() {
  return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.images.dest))
}

function watch() {
  browserSync.init({
    server: {
        baseDir: "./dist"
    }
});
  gulp.watch(paths.html.src).on('change', browserSync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img)
}

const build = gulp.series(clean, html, gulp.parallel(styles, img, scripts), watch)

exports.clean = clean
exports.html = html
exports.pug = pug
exports.img = img
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build