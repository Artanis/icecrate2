'use strict';

var Icecrate = angular.module('Icecrate', ['ngRoute', 'ZXing', 'icecrate.db', 'icecrate.user', 'icecrate.items']);

Icecrate.run(function($rootScope, $location, IcecrateDB, IcecrateDBSync) {
  IcecrateDB.open();

  var params = $location.search();
  $rootScope.query = {
    "upc": params.upc || "",
    "name": params.name || "",
    "location": {}
  };
});

Icecrate.filter('sumvals', function () {
  return function (data) {
    var sum = 0;
    for (var key in data) {
      sum = sum + data[key];
    }
    return sum;
  };
});

Icecrate.controller('HouseholdList', function ($scope, IcecrateDB) {
  IcecrateDB.all_households().then(function (data) {
    $scope.households = data;
  });
});

Icecrate.controller('DetailHousehold', function($scope, IcecrateDB, $routeParams) {
  IcecrateDB.get_household_by_id($routeParams.household_id).then(function (data) {
    $scope.household = data;
    $scope.update_household = function () {
      IcecrateDB.update_household($scope.household).then(function (data) {
        console.log("success!");
      });
    };
    $scope.remove_guest = function (user_id) {
      household.guests.splice(household.guests.indexOf(user_id), 1);
    }
  });
});

Icecrate.controller('LocationList', function($scope, IcecrateDB, $routeParams) {
  IcecrateDB.get_items_by_household($routeParams.household_id).then(function (data) {
    $scope.locations = {};
    for (var i in data) {
      var item = data[i];

      for (var j in item.location) {
        if ($scope.locations[j] === undefined) {
          $scope.locations[j] = item.location[j];
        }
      }
    }
  });
});

Icecrate.controller('ShoppingLists', function($scope, IcecrateDB, $routeParams) {
  if ($routeParams.household_id === undefined) {
    // All Shopping lists
    IcecrateDB.all_shopping_lists().then(function (data) {
      $scope.shopping = data;
    });
  } else {
    // Restrict to household
    var req = IcecrateDB.get_shopping_lists_by_household($routeParams.household_id);
    req.then(function (data) {
      $scope.shopping = data;
    });
  }
});

Icecrate.controller('ShoppingListDetail', function ($scope, IcecrateDB, $routeParams) {
  $scope.items = {}
  $scope.list = undefined;
  $scope.household = undefined;

  var req = IcecrateDB.get_shopping_list_by_id($routeParams.list_id);
  req.then(function (data) {
    $scope.list = data;
  });
  req.then(function (data) {
    var items = {};
    for (var i in data.items) {
      IcecrateDB.get_item_by_id(data.items[i]).then(function (item) {
        items[item._id] = item;
      });
    }
    $scope.items = items;
  });
  IcecrateDB.get_household_by_id($routeParams.household_id).then(function (data) {
    $scope.household = data;
  });
});

Icecrate.controller('SyncState', function ($scope, IcecrateLocal, IcecrateDBSync) {
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

Icecrate.config(function ($routeProvider) {
  // Household-scoped routes
  $routeProvider.when('/', {
    "controller":  "HouseholdList",
    "templateUrl": "/static/local/icecrate/templates/list-households.html"
  });
  $routeProvider.when('/households', {
    "controller":  "HouseholdList",
    "templateUrl": "/static/local/icecrate/templates/list-households.html"
  });
  $routeProvider.when('/households/:household_id', {
    "controller":  "DetailHousehold",
    "templateUrl": "/static/local/icecrate/templates/detail-household.html"
  });
  $routeProvider.when('/households/:household_id/items/:item_upc', {
    "controller":  "DetailItem",
    "templateUrl": "/static/local/icecrate/templates/detail-item.html"
  });
  $routeProvider.when('/households/:household_id/lists/:list_id', {
    "controller": "ShoppingListDetail",
    "templateUrl": "/static/local/icecrate/templates/detail-shopping.html"
  });


  $routeProvider.when('/lists', {
    "controller": "ShoppingLists",
    "templateUrl": "/static/local/icecrate/templates/list-shopping.html"
  });
});
