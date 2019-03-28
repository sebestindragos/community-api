'use strict';

const argv = require('yargs').argv;
const gulp = require('gulp');
const typescript = require('gulp-typescript');
const gulpTslint = require('gulp-tslint');
const tslint = require('tslint');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const mocha = require('gulp-mocha');
const rm = require('gulp-rimraf');

// determine build environment (development | production).
let env = argv.env || 'development';

/**
 * Define tasks.
 */
gulp.task('clean', () => {
  return gulp.src(['build/'], { read: false }).pipe(rm());
});

gulp.task('tslint', () => {
  const program = tslint.Linter.createProgram("./tsconfig.json");
  return gulp.src(['src/**/*.ts'])
    .pipe(gulpTslint({
      configuration: 'tslint.json',
      program: program,
      formatter: 'stylish'
    }))
    .pipe(gulpTslint.report({
      summarizeFailureOutput: true
    }));
});

const serverCompiler = typescript.createProject('./tsconfig.json');
gulp.task('compile', () => {
  return gulp.src(['src/**/*.ts'])
    .pipe(gulpIf(env === 'development', sourcemaps.init()))
    .pipe(serverCompiler())
    .pipe(gulpIf(env === 'development', sourcemaps.write('.', {
      sourceRoot: (file) => {
        return file.cwd + '/src'
      }
    })))
    .pipe(gulp.dest('build/'));
});

gulp.task('watch', () => {
  gulp.watch(['src/**/*.ts'], ['compile']);
});

gulp.task('test', () => {
  return gulp.src([
    'build/tests/**/*.js'
  ])
  .pipe(mocha({
    allowEmpty: true
  }));
});

/**
 * Register tasks.
 */
gulp.task('build', gulp.series([
  'tslint',
  'compile',
  'test'
]));

gulp.task('release', (callback) => {
  env = argv.env || 'production';
  gulp.series([
    'clean',
    'tslint',
    'compile',
    'test',
    callback
  ]);
});

gulp.task('default', gulp.series(['build']));
