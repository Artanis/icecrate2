'use strict';

var Icecrate = angular.module(
  'icecrate.core',
  [
    'ngRoute',
    'ui.bootstrap',
    'ZXing',
    'icecrate.store',
    'icecrate.sync',
    'icecrate.ui',
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
    "templateUrl": "/static/local/icecrate-households/templates/list-households.html"
  });
});

Icecrate.run(function($rootScope, $location, IcecrateDB, IcecrateDBSync) {
  IcecrateDB.open();

  var any = function (iterable) {
    var e;
    for (e in iterable) {
      if (iterable[e]) {
        return true;
      }
    }
    return false;
  };

  var all = function(iterable) {
    var e;
    for (e in iterable) {
      if (!iterable[e]) {
        return false;
      }
    }
    return true;
  };

  var locfilter = function (element) {
    var query = $rootScope.query.location;
    var result = [];

    var e;
    if (!any(query)) {
      console.log("no filter");
      return true;
    } else {
      for (e in query) {
        if (query[e]) {
          var r = element.location[e] !== undefined && element.location[e] > 0;
          console.log("filter", element.name, r);
          result.push(r);
        }
      }
      return all(result);
    }
  };

  var params = $location.search();
  $rootScope.query = {
    "upc": params.upc || "",
    "name": params.name || "",
    "location": {},
    "locfilter": locfilter};
});
