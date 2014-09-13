'use strict';

Icecrate.controller('HouseholdList', function ($scope, $http) {
  console.log("(Icecrate) Loading households.");
  $http.get('data/dummy/households.json').success(function (data) {
    console.log("(Icecrate) Loading households successful.");
    $scope.households = data;
  });
});

Icecrate.controller('ItemList', function($scope, $http) {
  console.log("(Icecrate) Loading items.");
  $http.get('data/dummy/items.json').success(function (data) {
    console.log("(Icecrate) Loading items successful.");
    $scope.items = data;
  });
});
