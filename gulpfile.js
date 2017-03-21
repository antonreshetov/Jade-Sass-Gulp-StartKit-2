var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var merge = require('merge-stream');
var htmlpretty = require('gulp-prettify');
var notify = require("gulp-notify");
var runSequence = require('run-sequence');
var staticHash = require('gulp-static-hash');
var sourcemaps = require('gulp-sourcemaps');

// Error Handler
function swallowError(error) {
    console.log(error.toString());
    this.emit('end')
}

// Browser Sync
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        browser: "google chrome",
        notify: false
    });
});

// Copy Assets File
gulp.task('copyfiles', function() {
    var img = gulp.src('src/assets/img/*')
        .pipe(gulp.dest('app/assets/img'));
    var fonts = gulp.src('src/assets/fonts/*')
        .pipe(gulp.dest('app/assets/fonts'));
    return merge(img, fonts);
});

// SCSS to CSS + Prefix
gulp.task('css', function() {
    return gulp.src('./src/assets/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 5 versions']
        }))
        .pipe(sourcemaps.init())
        .pipe(gulp.dest('./app/assets/css'))
        // compressed
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 5 versions']
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest('./app/assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Jade
gulp.task('jade', function() {
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
gulp.task('htmlpretty', function() {
    gulp.src('app/**/*.html')
        .pipe(htmlpretty({
            indent_size: 4,
            wrap_line_length: 0
        }))
        .pipe(gulp.dest('app'));
});

// JS
gulp.task('jsConcat', ['jsMain'], function () {
    return gulp.src([
        './src/assets/bower_components/jquery/dist/jquery.js'
    ])
        .pipe(sourcemaps.init())
        .pipe(concat("bundle.js"))
        .pipe(gulp.dest('./app/assets/js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest('./app/assets/js'));
});

gulp.task('jsMain', function() {
    return gulp.src('./src/assets/js/main.js')
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
gulp.task('lint', function() {
    return gulp.src('src/assets/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch('src/assets/scss/**/*.scss', ['css']);
    gulp.watch('src/jade/**/*.jade', ['jade']);
    gulp.watch('src/assets/js/main.js', ['jsMain']);
});

// Cache busting
gulp.task('cache', function() {
    return gulp.src('./app/**/*.html')
        .pipe(staticHash({
            exts: ['js', 'css'],
            asset: './app'
        }))
        .pipe(gulp.dest('./app'))
});

// Clean app
gulp.task('clean', function() {
    return gulp.src('app', {
            force: true
        })
        .pipe(clean());
});

// Build App
gulp.task('build', function(){
    runSequence('clean', 'css', 'jade', 'jsConcat', 'copyfiles');
});

// Run Default
gulp.task('default', ['browserSync', 'css', 'jade', 'jsConcat', 'copyfiles', 'watch']);