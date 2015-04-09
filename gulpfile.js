var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var cp = require('child_process');
var runSequence = require('run-sequence');

var paths = {
  styles: ['src/styles/**/*.scss'],
  docs: ['src/**/*.html', 'src/**/*.md', 'templates/*.html']
};

gulp.task('styles', function() {
  browserSync.notify('<span style="color: grey">Running:</span> styles');

  gulp.src('./src/styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./build/css'))
    .pipe(reload({stream:true}));

});

gulp.task('browser-sync', function(){
  browserSync({
    host: '*',
    port: 9000,
    server: {
      baseDir: './build'
    }
  });
});

gulp.task('browser-sync:reload', function(){
  browserSync.notify('<span style="color: grey">Running:</span> rebuild');
  browserSync.reload();
});

gulp.task('sync', function(){
  runSequence('build','styles','browser-sync');
});

gulp.task('watch', function(){
  gulp.watch(paths.docs, ['rebuild']);
  gulp.watch(paths.styles, ['styles']);
});

gulp.task('serve', function(){
  gulp.start('sync', 'watch');
});

gulp.task('rebuild', function(){
  runSequence('build','styles','browser-sync:reload');
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