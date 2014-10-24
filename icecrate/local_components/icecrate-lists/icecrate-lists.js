'use strict';

var __icecrate_lists = angular.module(
  'icecrate.lists',
  [
    'ngRoute',
    'icecrate.store'
  ]);

__icecrate_lists.config(function ($routeProvider) {
  $routeProvider.when('/lists', {
    "controller": "ShoppingLists",
    "templateUrl": "/static/local/icecrate/templates/list-shopping.html"
  });
});


__icecrate_lists.controller('ShoppingLists', function($scope, IcecrateDB, $routeParams) {
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

__icecrate_lists.controller('NewShoppingList', function ($scope, $timeout, IcecrateDB, $routeParams) {
  $scope.new_list = {
    "type": "shopping-list",
    "household": $routeParams.household_id || undefined,
    "name": undefined,
    "items": []};

  IcecrateDB.all_households().then(function (data) {
    $scope.households = data;
  })

  $scope.create_new_list = function (listdata) {
    console.log("creating new shopping list.");
    IcecrateDB.update_shopping_list(listdata).then(function (data) {
      console.log("new list saved to database.");
    });
  };
});

__icecrate_lists.controller('ShoppingListDetail', function ($scope, IcecrateDB, $routeParams) {
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
