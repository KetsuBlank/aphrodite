const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');

// Объединение и минификация CSS
gulp.task('styles', function() {
    return gulp.src([
        'src/css/style.css'
    ])
    .pipe(concat('all.min.css'))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});

// Объединение и минификация JS
gulp.task('scripts', function() {
    return gulp.src([
        'src/js/main.js'
    ])
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

// Копирование HTML
gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

// Копирование JS файлов как есть (страховка)
gulp.task('copy-js', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('dist/js'));
});

// Сборка проекта
gulp.task('build', gulp.parallel('styles', 'scripts', 'html', 'copy-js'));