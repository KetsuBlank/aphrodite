const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('styles', () =>
    gulp.src(['src/css/style.css'])
        .pipe(concat('styles.css'))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/'))
);

gulp.task('scripts', () =>
    gulp.src(['src/js/main.js'])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'))
);

gulp.task('html', () =>
    gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'))
);

gulp.task('build', gulp.parallel('styles', 'scripts', 'html'));
