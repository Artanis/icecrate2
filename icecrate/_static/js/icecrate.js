'use strict';

var Icecrate = angular.module('Icecrate', ['ngRoute', 'ZXing', 'icecrate.db']);

Icecrate.run(function($rootScope, $location, IcecrateDB, IcecrateDBSync) {
  IcecrateDB.open().then(IcecrateDBSync.pull.apply(IcecrateDBSync));

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

Icecrate.controller('ItemList', function($scope, IcecrateDB, $routeParams) {
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

Icecrate.controller('DetailItem', function($scope, IcecrateDB, $routeParams) {
  console.log($routeParams);
  var req = IcecrateDB.get_item_by_household_and_upc($routeParams.household_id, $routeParams.item_upc);
  req.then(function (data) {
    console.log(data);
    $scope.item = data;
  });
  // Items.then(function(data) {
  //   for (var key in data) {
  //     var item = data[key];
  //     if(item.upc === $routeParams.item_upc && item.household === $routeParams.household_id) {
  //       $scope.item = item;
  //       break;
  //     }
  //   }
  // })
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
