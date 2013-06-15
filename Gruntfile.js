var path = require("path");

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');

  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    webpack: {
      options: {
        entry: "./src/webpack.js",
        module: {
          preLoaders: [
            {
              test: /\.js$/,
              include: pathToRegExp(path.join(__dirname, 'src', 'js')),
              loader: "jshint-loader"
            }
          ]
        },
        output: {
          path: "build/js/",
          library: "barry"
        },
        cache: true,
        jshint: {
          "validthis": true,
          "laxcomma" : true,
          "laxbreak" : true,
          "browser"  : true,
          "eqnull"   : true,
          "debug"    : true,
          "devel"    : true,
          "boss"     : true,
          "expr"     : true,
          "asi"      : true,
          "sub"      : true
        }
      },
      release: {
        output: {
          filename: "<%= pkg.name %>.min.js"
        },
        optimize: {
          minimize: true
        }
      },
      debug: {
        output: {
          filename: "<%= pkg.name %>.js"
        },
        debug: true,
        devtool: 'eval'
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'src/**/*.js'],
        tasks: ['webpack:release', 'webpack:debug'],
        options: { nospawn: true }
      }
    }
  });

  grunt.registerTask('default', ['webpack']);
};

// Helpers
function escapeRegExpString(str) { return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); }
function pathToRegExp(p) { return new RegExp("^" + escapeRegExpString(p)); }
