'use strict';

var __icecrate_households = angular.module(
  'icecrate.households',
  [
    'ngRoute',
    'icecrate.store',
    'icecrate.user'
  ]
);

__icecrate_households.config(function ($routeProvider) {
  $routeProvider.when('/households', {
    "controller":  "HouseholdList",
    "templateUrl": "/static/local/icecrate-households/templates/list-households.html"
  });
  $routeProvider.when('/households/:household_id', {
    "controller":  "DetailHousehold",
    "templateUrl": "/static/local/icecrate-households/templates/detail-household.html"
  });

  $routeProvider.when('/households/:household_id/:subpage', {
    "controller":  "DetailHousehold",
    "templateUrl": "/static/local/icecrate-households/templates/detail-household.html"
  });

  $routeProvider.when('/households/:household_id/items/:item_upc', {
    "controller":  "DetailItem",
    "templateUrl": "/static/local/icecrate-items/templates/detail-item.html"
  });

  $routeProvider.when('/households/:household_id/lists/:list_id', {
    "controller": "ShoppingListDetail",
    "templateUrl": "/static/local/icecrate-lists/templates/detail-list.html"
  });
});

__icecrate_households.controller('HouseholdList', function ($scope, IcecrateDB, UserService) {
  $scope.user = UserService;
  IcecrateDB.all_households().then(function (data) {
    $scope.households = data;
  });
});

__icecrate_households.controller('DetailHousehold', function($scope, IcecrateDB, $routeParams, UserService) {
  $scope.user = UserService;
  $scope.household = undefined;

  $scope.subpage = $routeParams.subpage || "items";

  $scope.update_household = function () {
    IcecrateDB.update_household($scope.household).then(function (data) {
      console.log("success!");
    });
  };

  $scope.remove_guest = function (user_id) {
    $scope.household.guests.splice($scope.household.guests.indexOf(user_id), 1);
    $scope.update_household();
  };

  IcecrateDB.get_household_by_id($routeParams.household_id).then(function (data) {
    $scope.household = data;
  });
});

__icecrate_households.controller('NewHousehold', function($scope, IcecrateDB, UserService) {
  $scope.new_household = {
    "type": "household",
    "name": undefined,
    "members": [UserService.get_email()],
    "guests": [],
  };

  $scope.create = function () {
    console.log("making new house.")
    IcecrateDB.update_household($scope.new_household).then(function (data) {
      console.log("new household saved to local database.")
    });
  };
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
