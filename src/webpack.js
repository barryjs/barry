var barry = module.exports = require('./barry').Barry;

// Angular.js Integration
if (angular) {
  var barryModule = angular.module('barry', []);

  barryModule.provider('$barry', function () {
    var defaultEndpoint = '/';

    this.setDefaultEndpoint = function (ep) {
      defaultEndpoint = ep;
    };

    this.$get = function () {
      return barry.endpoint(defaultEndpoint);
    };
  });

  barry.Consumer.prototype.toScope = function ($scope, key) {
    var self = this;

    self.init();

    function updateMeta() {
      $scope["$barry"] = $scope["$barry"] || {};
      $scope["$barry"][key] = {
        url: self.url,
        loaded: self.loaded
      };
    }

    self.on('update', function (model) {
      function processUpdate() {
        $scope[key] = model;
        updateMeta();
      }
      if ($scope.$$phase) processUpdate();
      else $scope.$apply(processUpdate);
    });
    self.on('beforeload', function () {
      updateMeta();
    });

    $scope.$on('$destroy', function () {
      self.unsubscribe();
    });

    return this;
  };
}

