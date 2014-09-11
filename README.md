Gulp config for AngularJS
=========================

A reusable gulp config that builds js and css files, including test files.

# Overview

The main purpose of this config is to:

- Concatenates and minifies javascript into a 2 files: app-vendor-build.js and app-build.js
- Finds all test files and concatenates them into a single file
- build sass files into a single css file

## Figuring out which js files to use

The config will grab all .js files in /app and build it into a file located in /app/build, with the following exceptions:

- /app/build will be ignored
- any file ending in _test.js will be build into a seperate js file in /test/build
- files inside /app/vendor will be built in a separate js file

## Including the built files in your project

You should include /app/build/app-vendor-build.js before /app/build/app-build.js so your libraries load before your custom code.

## What makes this an AngularJS specific config?

- The config tries to include /app/vendor/angular.js first
- The basic folder structure works well in an angularJS environment
- Building out a single concatenated test file works well with Jasmine

# Console commands

In addition to the defualt gulp task, there are a few other commands that can be run

    gulp watch   // auto run when a js or scss file is changed 
    gulp test    // run the tests without compressing files for production 
    gulp notest  // concat files without testing - quickest (and most dangerous) way to gulp
    gulp testall // unit test in IE8, IE9, IE10, IE11, FF, Chrome, Phantom
    gulp styles  // only build styles 

# Folder structure

Place all your js files into /app and all your scss files into /styles. Files will be built into /app/build for js files, /test/build for test files and /styles/build for css files

    |-- app // all js files will be found in this folder, see gulp task concatApp for exclusions
       |-- build
           |-- app-build.js
           |-- app-vendor-build.js
           |-- app-build.min.js
           |-- app-vendor-build.min.js
       |-- prefix // these files will be placed first in the app-build.js
       |-- vendor // js files will be added to app-vendor-build.js
           |-- lib
               |-- angular.js // placed first in app-vendor-build.js
     |-- test
         |-- build
             |-- test-build.js // finds all *_test.js files in /app and concats them here
     |-- styles
         |-- local // finds all .scss files
         |-- components // finds all .scss files
         |-- build
             |-- build.css
             |-- build.min.css

