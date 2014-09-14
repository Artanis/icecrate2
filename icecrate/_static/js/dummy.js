'use strict';

Icecrate.factory('Items', function ($http, $q) {
  var deferred = $q.defer();

  $http.get('data/dummy/items.json', {'cache': true}).success(function (data) {
    deferred.resolve(data);
  });

  return deferred.promise;
});

Icecrate.factory('Households', function ($http, $q) {
  var deferred = $q.defer();

  $http.get('data/dummy/households.json', {'cache': true}).success(function (data) {
    deferred.resolve(data);
  });

  return deferred.promise;
});
