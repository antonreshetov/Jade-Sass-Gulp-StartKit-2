const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const jade = require('gulp-jade');
const watch = require('gulp-watch');
const clean = require('gulp-clean');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const merge = require('merge-stream');
const htmlpretty = require('gulp-prettify');
const notify = require("gulp-notify");
const runSequence = require('run-sequence');
const staticHash = require('gulp-static-hash');
const sourcemaps = require('gulp-sourcemaps');

// Error Handler
function swallowError(error) {
    console.log(error.toString());
    this.emit('end')
}

// Browser Sync
gulp.task('browserSync', () => {
    browserSync({
        server: {
            baseDir: 'app'
        },
        browser: "google chrome",
        notify: false,
        open: false
    });
});

// Copy Assets File
gulp.task('copyfiles', () => {
    let img = gulp.src('src/assets/img/*')
        .pipe(gulp.dest('app/assets/img'));
    let fonts = gulp.src('src/assets/fonts/*')
        .pipe(gulp.dest('app/assets/fonts'));
    return merge(img, fonts);
});

// SCSS to CSS + Prefix
gulp.task('css', () => {
    return gulp.src('./src/assets/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        // .pipe(sourcemaps.init())
        .pipe(gulp.dest('./app/assets/css'))
        // compressed
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        // .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest('./app/assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Jade
gulp.task('jade', () => {
    return gulp.src('src/jade/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .on('error', swallowError)
        .on('error', notify.onError({
            message: 'Error: <%= error.message %>',
            sound: "Basso"
        }))
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// HTML Prettify
gulp.task('htmlpretty', () => {
    gulp.src('app/**/*.html')
        .pipe(htmlpretty({
            indent_size: 4,
            wrap_line_length: 0
        }))
        .pipe(gulp.dest('app'));
});

// JS
gulp.task('jsConcat', ['jsMain'], () => {
    return gulp.src([
        './src/assets/bower_components/jquery/dist/jquery.js'
    ])
        .pipe(sourcemaps.init())
        .pipe(concat("vendor.js"))
        .pipe(gulp.dest('./app/assets/js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest('./app/assets/js'));
});

gulp.task('jsMain', () => {
    return gulp.src('./src/assets/js/app.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('app/assets/js'))
        .pipe(uglify())
        .on('error', swallowError)
        .on('error', notify.onError({
            message: 'Error: <%= error.message %>',
            sound: "Basso"
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/assets/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// JsHint
gulp.task('lint', () => {
    return gulp.src('src/assets/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Watch
gulp.task('watch', () => {
    gulp.watch('src/assets/scss/**/*.scss', ['css']);
    gulp.watch('src/jade/**/*.jade', ['jade']);
    gulp.watch('src/assets/js/app.js', ['jsMain']);
});

// Cache busting
gulp.task('cache', () => {
    return gulp.src('./app/**/*.html')
        .pipe(staticHash({
            exts: ['js', 'css'],
            asset: './app'
        }))
        .pipe(gulp.dest('./app'))
});

// Clean app
gulp.task('clean', () => {
    return gulp.src('app', {
        force: true
    })
        .pipe(clean());
});

// Build App
gulp.task('build', () => {
    runSequence('clean', 'css', 'jade', 'jsConcat', 'copyfiles', 'cache');
});

// Run Default
gulp.task('default', ['browserSync', 'css', 'jade', 'jsConcat', 'copyfiles', 'watch']);