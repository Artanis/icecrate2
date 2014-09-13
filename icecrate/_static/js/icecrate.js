'use strict';

var Icecrate = angular.module('Icecrate', ['ngRoute']);

Icecrate.filter('sumvals', function () {
  return function (data) {
    var sum = 0;
    for (var key in data) {
      sum = sum + data[key];
    }
    return sum;
  };
});

Icecrate.config(function ($routeProvider) {
  $routeProvider.when('/households/:household_id', {
    controller:"HouseholdList",
    templateUrl: "templates/household.html"
  });
  $routeProvider.when('/items/:item_upc', {
    controller: "ItemList",
    templateUrl: "templates/itemlist.html"
  });
});
