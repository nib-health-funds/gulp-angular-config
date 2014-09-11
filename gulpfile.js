
var gulp = require('gulp');
var concat = require('gulp-concat');
var karma = require('karma').server;
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var minify  = require('gulp-minify-css');
var prefix  = require('gulp-autoprefixer');
var jshint  = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sequence= require('run-sequence');

// Cleans the build folder, ready to receive the new build files
gulp.task('cleanScripts', function(){
  return gulp.src('app/build', {read: false})
    .pipe(clean());
});
gulp.task('cleanStyles', function(){
  return gulp.src('styles/build/*', {read: false})
    .pipe(clean());
});

// Concatenate all app files into 1
gulp.task('concatApp', [], function(){
  return gulp.src([
    'app/prefix/index.js',
    'app/**/*.js', // grab all the js files
    '!app/build/**/*.js', // except the build files
    '!app/vendor/**/*.js', // and ignore the vendor files
    '!app/**/*_test.js' // and don't grab the test files either
  ])
    .pipe(concat('app-build.js', {newLine: '\n'})) // concat into a single file
    .pipe(gulp.dest('app/build')); // and place in the correct folder
});

// Concatenate all vendor files into 1
gulp.task('concatVendor', [], function(){
  return gulp.src([
    'app/vendor/lib/angular.js', // grab angular first so it loads first
    'app/vendor/**/*.js' // gulp is smart enough to not include angular a 2nd time
  ])
    .pipe(concat('app-vendor-build.js', {newLine: '\n'} )) // concat into a single file
    .pipe(gulp.dest('app/build')); // and place in the correct folder
});

// Create a .min.js version of each file created in the build folder
gulp.task('compress', [], function(){
  return gulp.src('app/build/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/build/'))
});

// Concatenate all test files into 1. Grabs any files in the app folder ending in _test.js
gulp.task('concatTest', [], function(){
  return gulp.src('app/**/*_test.js')
    .pipe(concat('test-build.js')) // concat into a single file
    .pipe(gulp.dest('test/build')); // and place in the correct folder
});

//check the scripts
gulp.task('check-scripts', function() {
  return gulp.src('app/build/app-build.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    ;
});


gulp.task('compileStyles', function() {

  return gulp.src([
    'styles/components/*/*.scss',
    'styles/local/*/*.scss'
  ])
    .pipe(sass({style: 'compressed'}))
    .pipe(concat('build.css'))
    .pipe(prefix('last 2 versions', 'ie 8', 'ff 10'))
    .pipe(gulp.dest('styles/build'));
});

gulp.task('compressStyles', function(){
  gulp.src('styles/build/build.css')
    .pipe(minify({keepBreaks:false}))
    .pipe(rename("build.min.css"))
    .pipe(gulp.dest('styles/build'))
});

// Run karma test runner.
// Runs karma manually without a gulp plugin as the gulp-karma plugin has issues.
//  I'm unable to use the karma.conf.js file this way, so we need to specify all settings here.
gulp.task('run-test', [], function(cb){
  karma.start({
    frameworks: ['jasmine'],
    files: [
      'app/build/app-vendor-build.js',
      'test/angular/angular-mocks.js',
      'app/build/app-build.js',
      'test/build/test-build.js'
    ],

    browsers: ['PhantomJS'],
    singleRun: true,
    autoWatch: false
//     ,logLevel: this.LOG_INFO // Useful for debugging
  }, function (exitCode) {
    if(exitCode) {
      console.log('Karma has exited with ' + exitCode);
    }
    cb(null);
    // Not a good solution but karma refuses to stop without this.
    process.exit(exitCode);

  });
});

// test more browsers
gulp.task('testall', [], function(cb){
  karma.start({
    frameworks: ['jasmine'],
    files: [
      'app/build/app-vendor-build.js',
      'test/angular/angular-mocks.js',
      'app/build/app-build.js',
      'test/build/test-build.js'
    ],
    customLaunchers: {
      IE10: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE10'
      },
      IE9: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE9'
      },
      IE8: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE8'
      }
    },
    browsers: ['PhantomJS', 'Chrome', 'Firefox','IE', 'IE10','IE9', 'IE8'],
    singleRun: true,
    autoWatch: false
//     ,logLevel: this.LOG_INFO // Useful for debugging
  }, function (exitCode) {
    if(exitCode) {
      console.log('Karma has exited with ' + exitCode);
    }
    cb(null);
    // Not a good solution but karma refuses to stop without this.
    process.exit(exitCode);

  });
});

// Default task (as used by poshbuild)
  gulp.task('default', function(cb) {
    sequence(
      ['cleanScripts','cleanStyles'],
      ['concatApp', 'concatVendor', 'concatTest', 'compileStyles'],
      ['compress', 'compressStyles', 'run-test', 'check-scripts'],
      'finishMsg',
      cb
    );

  });

gulp.task('finishMsg', function(){
  console.log(
      '\nThank you for using gulp. Did you know you can also run some more specific commands?: \n' +
      'gulp watch   - auto run when a js or scss file is changed \n' +
      'gulp test    - run the tests without compressing files for production \n' +
      'gulp notest  - concat files without testing - quickest (and most dangerous) way to gulp\n' +
      'gulp testall - unit test in IE8, IE9, IE10, IE11, FF, Chrome, Phantom \n' +
      'gulp styles  - only build styles \n'
  );
});

// Watch
gulp.task('watch', function() {
  //watch and re-build scripts

  gulp.watch(['app/**/*.js', '!app/build/**/*.js'], function(event) {
    console.log(
      '\nChange found at ' + event.path +
      '\nLast change made at ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
    );
    sequence( ['concatApp', 'concatVendor', 'concatTest']);
  });
  gulp.watch('styles/**/*.scss', function(event) {
    console.log(
        '\nChange found at ' + event.path +
        '\nLast change made at ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
    );
    sequence('cleanStyles','compileStyles', 'compressStyles');
  });

});

// tests, no compress
gulp.task('test', function(cb) {
  sequence(
    'cleanScripts',
    ['concatApp', 'concatVendor', 'concatTest'],
    ['run-test', 'check-scripts'],
    cb
  );
});
// no tests
gulp.task('notest', function(cb) {
  sequence(
    ['cleanScripts', 'cleanStyles'],
    ['concatApp', 'concatVendor', 'concatTest'],
    ['compileStyles',],
    cb
  );
});

// Styles only
gulp.task('styles', function(cb) {
  sequence(
    ['cleanStyles'],
    'compileStyles',
    'compressStyles',
    cb
  );
});