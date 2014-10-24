'use strict';

var __icecrate_items = angular.module(
  "icecrate.items",
  [
    'ngRoute',
    'icecrate.store'
  ]
);

__icecrate_items.config(function ($routeProvider) {
  $routeProvider.when('/items', {
    "controller":  "ItemList",
    "templateUrl": "/static/local/icecrate/templates/list-items.html"
  });
});

__icecrate_items.filter('sumvals', function () {
  return function (data) {
    var sum = 0;
    for (var key in data) {
      sum = sum + data[key];
    }
    return sum;
  };
});

__icecrate_items.directive('newItem', function() {
  return {
    "templateUrl": "static/local/icecrate-items/templates/new-item.html",
    "controller": "NewItemController"
  };
});

__icecrate_items.controller('NewItemController', function ($scope, $location, $routeParams, IcecrateDB) {
  var params = $location.search();

  var empty_item_data = function () {
    return {
      "type": "item",
      "household": $routeParams.household_id || undefined,
      "upc": params.upc || undefined,
      "name": params.name || undefined,
      "size": {"units": undefined, "scalar": undefined},
      "location": {}}
  };

  $scope.new_item = empty_item_data();

  IcecrateDB.all_households().then(function (data) {
    $scope.households = data;
  });

  $scope.create_new_item = function (new_item) {
    console.log("creating new item.");
    IcecrateDB.update_item(new_item).then(function (data) {
      console.log("item saved to local database.");
      $scope.new_item = empty_item_data();
    });
  };
});

__icecrate_items.controller('ItemList', function($scope, IcecrateDB, $routeParams) {
  var items = null;

  if ($routeParams.household_id !== undefined) {
    items = IcecrateDB.get_items_by_household($routeParams.household_id);
  } else {
    items = IcecrateDB.all_items();
  }

  items.then(function (data) {
    $scope.items = data;
  });
});

__icecrate_items.controller('DetailItem', function($scope, IcecrateDB, $routeParams) {
  var req = IcecrateDB.get_item_by_household_and_upc($routeParams.household_id, $routeParams.item_upc);
  req.then(function (data) {
    $scope.item = data;
    $scope.update_item = function () {
      // remove empty locations
      var item = $scope.item;
      for (var i in item.location) {
        if (item.location[i] < 1) {
          delete item.location[i];
        }
      }

      IcecrateDB.update_item(item);
    };
    $scope.add_location = function () {
      var new_loc = $scope.new_loc;

      if (new_loc !== "" && new_loc !== undefined && new_loc !== null) {
        $scope.item.location[new_loc.toLocaleLowerCase()] = $scope.new_qty || 0;
        $scope.new_loc = "";
        $scope.new_qty = "";
      }
    };
  });
});
