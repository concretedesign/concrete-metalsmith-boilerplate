var gulp = require('gulp');
var browserSync = require('browser-sync');
var browserify = require('gulp-browserify');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var cp = require('child_process');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var util = require('gulp-util');
var notifier = require('node-notifier');
var debowerify = require("debowerify");


var paths = {
  styles: ['src/styles/**/*.scss'],
  scripts: ['src/scripts/**/*.js'],
  docs: ['src/**/*.html', 'src/**/*.md', 'templates/*.html', 'templates/*.jade']
};

gulp.task('styles', function() {
  browserSync.notify('<span style="color: grey">Running:</span> styles');

  gulp.src('./src/styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./build/css'))
    .pipe(reload({stream:true}));
});

// Standard error handler
function standardHandler(err) {
  // Notification
  notifier.notify({
    message: 'Error: ' + err.message
  });
  // Log to console
  util.log(util.colors.red('Error'), err.message);
}

// Handler for browserify
function browserifyHandler(err) {
  standardHandler(err);
  this.end();
}

gulp.task('scripts', function() {
  var production = util.env.type === 'production';

  return gulp.src(['./src/scripts/app.js'])
    .pipe(browserify({
      debug: !production,
      paths: ['./node_modules','./app'],
      transform: [debowerify]
    }))
    .on('error', browserifyHandler)
    .pipe(gulpif(production, uglify())) // only minify if production
    .pipe(gulp.dest('./build/scripts/'));
});

gulp.task('scripts-watch', ['scripts'], browserSync.reload);

gulp.task('browser-sync', function(){
  browserSync({
    host: '*',
    port: 9000,
    open: false,
    server: {
      baseDir: './build'
    }
  });
});

gulp.task('browser-sync:reload', function(){
  browserSync.notify('<span style="color: grey">Running:</span> rebuild');
  browserSync.reload();
});

gulp.task('sync', function() {
  runSequence('build','styles', 'scripts','browser-sync');
});

gulp.task('watch', function() {
  gulp.watch(paths.docs, ['rebuild']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['scripts-watch']);
});

gulp.task('serve', function() {
  gulp.start('sync', 'watch');
});

gulp.task('rebuild', function() {
  runSequence('build','styles', 'scripts','browser-sync:reload');
});

gulp.task('build', function(done){
  var args = [
    'run',
    'build'
  ];

  return cp.spawn('npm', args, {stdio: 'inherit'})
    .on('close', done);
});

//gulp.task('default', ['server']);