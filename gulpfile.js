const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const concat = require("gulp-concat");
const minify = require("gulp-minify");
const browserSync = require("browser-sync").create(); // Added BrowserSync
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");

// Define source and destination paths
const paths = {
   styles: {
      src: "assets/scss/**/*.scss",
      dest: "assets/css/",
   },
   scripts: {
      src: "assets/js/**/*.js",
      dest: "assets/js/",
   },
   images: {
      src: "assets/img/**/*.{jpg,jpeg,png,gif}",
      dest: "assets/img/op",
   },
   html: {
      src: "**/*.html", // You can specify more specific HTML paths if needed
   },
   php: {
      src: "**/*.php", // You can specify more specific PHP paths if needed
   },
};

function minimage() {
   return gulp
      .src(paths.images.src) // Change the source path according to your file structure
      .pipe(imagemin([imagemin.mozjpeg({ quality: 75, progressive: true }), imagemin.optipng({ optimizationLevel: 7 })]))
      .pipe(gulp.dest(paths.images.dest)); // Change the destination path according to your file structure
}

// Compile SASS, apply sourcemaps, and minify CSS
function styles() {
   return gulp
      .src(paths.styles.src)
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss([autoprefixer()]))
      .pipe(gulp.dest(paths.styles.dest)) // create non-minified version
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(sourcemaps.write("."))
      .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream()); // Reload BrowserSync after changes
}

// Concatenate and minify JS files
function scripts() {
   return gulp
      .src(paths.scripts.src)
      .pipe(concat("scripts.js"))
      .pipe(
         minify({
            noSource: true,
            ext: {
               min: ".min.js",
            },
         })
      )
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(browserSync.stream()); // Reload BrowserSync after changes
}

// Watch for changes in SASS, JS, HTML, and PHP files
function watch() {
   browserSync.init({ server: "./" });
   gulp.watch(paths.styles.src, gulp.series("styles"));
   gulp.watch(paths.scripts.src, gulp.series("scripts"));
   gulp.watch(paths.html.src).on("change", browserSync.reload);
   gulp.watch(paths.php.src).on("change", browserSync.reload);
}

// Default task
// gulp.task("default", gulp.series("styles", "scripts", "watch"));
exports.default = gulp.series(styles, scripts, gulp.parallel(watch));
exports.build = gulp.series(styles, scripts, minimage);
exports.scripts = gulp.series(scripts);
exports.styles = gulp.series(styles);
exports.minimage = gulp.series(minimage);
