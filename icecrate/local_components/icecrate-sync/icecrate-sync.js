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

IcecrateDB.service('IcecrateDBSync', function ($rootScope, $q, $http, IcecrateDB) {
  var households_url    = '/households';
  var shopping_list_url = '/lists';
  var items_url         = '/items';

  this.pull = function () {
    return $q.all(
      this.pull_items(),
      this.pull_households(),
      this.pull_shopping_lists());
  };

  this.pull_items = function () {
    return $http.get(items_url).then(function (data) {
      var items = data.data.items;
      for (var i in items) {
         var item = items[i];
         IcecrateDB.update_item(item);
       }
    });
  };

  this.pull_households = function () {
    return $http.get(households_url).then(function (data) {
      var households = data.data.households;
      for (var i in households) {
        var household = households[i];
        IcecrateDB.update_household(household);
      }
    });
  };

  this.pull_shopping_lists = function () {
    return $http.get(shopping_list_url).then(function (data) {
      var lists = data.data.lists;
      for (var i in lists) {
        var list = lists[i];
        IcecrateDB.update_shopping_list(list);
      }
    });
  };

  this.push = function () {
    return $q.all(
      this.push_items(),
      this.push_households(),
      this.push_shopping_lists());
  };

  this.push_items = function () {
    return IcecrateDB.all_items().then(function (data) {
      $http.post(items_url, {'items': data}).then(function (data) {
        console.log(data);
      });
    });
  };

  this.push_households = function () {
    return IcecrateDB.all_households().then(function (data) {
      $http.post(households_url, {'households': data}).then(function (data) {
        console.log(data);
      });
    });
  };

  this.push_shopping_lists = function () {
    return IcecrateDB.all_shopping_lists().then(function (data) {
      $http.post(shopping_list_url, {'lists': data}).then(function (data) {
        console.log(data);
      });
    });
  };
});
