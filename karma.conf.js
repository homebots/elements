// Karma configuration
// Generated on Tue Jun 16 2020 22:38:17 GMT+0200 (Central European Summer Time)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],

    files: [
      'src/**/*.ts',
      'test/**/*.ts',
    ],

    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },

    reporters: ['progress', 'karma-typescript'],
    autoWatch: true,
    browsers: ['ChromeHeadless'], // , 'Firefox'
    singleRun: false,
    concurrency: Infinity,

    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.spec.json'
    }
  })
}
