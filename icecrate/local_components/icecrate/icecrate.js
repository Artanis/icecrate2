'use strict';

var Icecrate = angular.module(
  'icecrate.core',
  [
    'ngRoute',
    'ZXing',
    'icecrate.store',
    'icecrate.sync',
    'icecrate.user',
    'icecrate.households',
    'icecrate.lists',
    'icecrate.items'
  ]
);

Icecrate.config(function ($routeProvider) {
  // Household-scoped routes
  $routeProvider.when('/', {
    "controller":  "HouseholdList",
    "templateUrl": "/static/local/icecrate/templates/list-households.html"
  });
});

Icecrate.run(function($rootScope, $location, IcecrateDB, IcecrateDBSync) {
  IcecrateDB.open();

  var params = $location.search();
  $rootScope.query = {
    "upc": params.upc || "",
    "name": params.name || "",
    "location": {}
  };
});
