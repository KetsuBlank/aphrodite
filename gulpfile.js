const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('styles', function() {
    return gulp.src([
        'src/css/components/*.css',
        'src/css/style.css'
    ])
    .pipe(concat('all.min.css'))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function() {
    return gulp.src([
        'src/js/modules/*.js',
        'src/js/main.js'
    ])
    .pipe(concat('all.min.js'))
    .pipe(minify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/css/**/*.css', gulp.series('styles'));
    gulp.watch('src/js/**/*.js', gulp.series('scripts'));
    gulp.watch('src/*.html', gulp.series('html'));
});

gulp.task('build', gulp.parallel('styles', 'scripts', 'html'));

gulp.task('default', gulp.series('build', 'watch'));