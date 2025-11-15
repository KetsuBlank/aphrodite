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
    .pipe(concat('styles.css'))  // ← ИМЯ БЕЗ .min
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/'));   // ← В КОРЕНЬ dist
});

// Объединение и минификация JS  
gulp.task('scripts', function() {
    return gulp.src([
        'src/js/main.js'
    ])
    .pipe(concat('main.js'))     // ← ИМЯ БЕЗ .min
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));   // ← В КОРЕНЬ dist
});

// Копирование HTML
gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'));
});

// Сборка проекта
gulp.task('build', gulp.parallel('styles', 'scripts', 'html'));