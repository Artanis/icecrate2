'use strict';

var Icecrate = angular.module('Icecrate', ['ngRoute', 'angular-data.DSCacheFactory', 'ZXing']);

Icecrate.run(function ($http, DSCacheFactory) {

  DSCacheFactory('Icecrate', {'storageMode': 'localStorage'});

  $http.defaults.cache = DSCacheFactory.get('Icecrate');
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

Icecrate.controller('HouseholdList', function ($scope, Households) {
  Households.then(function (data) {
    $scope.households = data;
  });
});

Icecrate.controller('DetailHousehold', function($scope, Households, $routeParams) {
  Households.then(function(data) {
    for (var household in data) {
      if (data[household]._id === $routeParams.household_id) {
        $scope.household = data[household];
        break;
      }
    }
  });
});

Icecrate.controller('LocationList', function($scope, Items, $routeParams) {
  Items.then(function (data) {
    var results = {};

    for (var key in data) {
      var item = data[key];

      if (item.household === $routeParams.household_id) {
        for (var key in item.location) {
          var qty = item.location[key];
          if (results[key] === undefined) {
            results[key] = 0;
          }
          results[key] += qty
        }
      }
    }
    $scope.locations = results;
  }
)});

Icecrate.controller('ItemList', function($scope, Items, $routeParams) {
  Items.then(function (data) {
    $scope.items = data;
  });
});

Icecrate.controller('DetailItem', function($scope, Items, $routeParams) {
  Items.then(function(data) {
    for (var key in data) {
      var item = data[key];
      if(item.upc === $routeParams.item_upc && item.household === $routeParams.household_id) {
        $scope.item = item;
        break;
      }
    }
  })
});

Icecrate.config(function ($routeProvider) {
    // Household routes
  $routeProvider.when('/', {
    "controller":  "HouseholdList",
    "templateUrl": "templates/list-households.html"
  });
  $routeProvider.when('/households', {
    "controller":  "HouseholdList",
    "templateUrl": "templates/list-households.html"
  });
  $routeProvider.when('/households/:household_id', {
    "controller":  "DetailHousehold",
    "templateUrl": "templates/household.html"
  });
  $routeProvider.when('/households/:household_id/items/:item_upc', {
    "controller":  "DetailItem",
    "templateUrl": "templates/item.html"
  });

  // Item (global) routes
  $routeProvider.when('/items?upc=:item_upc', {
    "controller":  "ItemList",
    "templateUrl": "templates/list-items.html"
  });
  $routeProvider.when('/items', {
    "controller":  "ItemList",
    "templateUrl": "templates/list-items.html"
  });
  $routeProvider.when('/items/:item_upc', {
    "controller":  "DetailItem",
    "templateUrl": "templates/item.html"
  });
});
