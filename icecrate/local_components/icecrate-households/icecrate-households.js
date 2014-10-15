'use strict';

var __icecrate_households = angular.module(
  'icecrate.households',
  [
    'ngRoute',
    'icecrate.store'
  ]
);

__icecrate_households.config(function ($routeProvider) {
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
});

__icecrate_households.controller('HouseholdList', function ($scope, IcecrateDB) {
  IcecrateDB.all_households().then(function (data) {
    $scope.households = data;
  });
});

__icecrate_households.controller('DetailHousehold', function($scope, IcecrateDB, $routeParams) {
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

__icecrate_households.controller('LocationList', function($scope, IcecrateDB, $routeParams) {
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
