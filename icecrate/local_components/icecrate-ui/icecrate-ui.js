var __icecrate_ui = angular.module('icecrate.ui', []);

// https://www.pointblankdevelopment.com.au/blog/getting-the-bootstrap-3-navbar-and-angularjs-to-play-nicely-together
__icecrate_ui.controller('NavController', function ($scope, $location) {
    $scope.isCollapsed = true;
    $scope.$on('$routeChangeSuccess', function () {
        $scope.isCollapsed = true;
    });
});
