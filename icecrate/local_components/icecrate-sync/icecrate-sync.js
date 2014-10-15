'use strict';

var __icecrate_sync = angular.module(
  'icecrate.sync',
  [
    'icecrate.store'
  ]
);

__icecrate_sync.controller('SyncState', function ($scope, IcecrateLocal, IcecrateDBSync) {
  $scope.sync = {};
  $scope.sync.last_sync = parseInt(IcecrateLocal.get('icecrate.sync.lastsync'));

  $scope.sync.pull_changes = function () {
    IcecrateDBSync.pull().then(function (data) {
      $scope.sync.last_sync = new Date().getTime();
      IcecrateLocal.set('icecrate.sync.lastsync', $scope.sync.last_sync)
    });
  };

  $scope.sync.push_changes = function () {
    IcecrateDBSync.push();
  };
});
