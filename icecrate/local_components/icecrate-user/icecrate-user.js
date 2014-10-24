var IcecrateUser = angular.module('icecrate.user', []);

IcecrateUser.service('UserService', function ($http, $window) {
  var user = {};

  $http.get("/auth/info").then(function (data) {
    user = data.data;
  });

  this.get_name = function () {
    return user.nickname || user.name || user.email || "Unregistered User";
  };

  this.get_email = function () {
    return user.email;
  };

  this.is_logged_in = function () {
    return user.email !== undefined;
  };
});

IcecrateUser.controller('UserController', function ($scope, UserService) {
  $scope.user = UserService;
});

IcecrateUser.directive('userSignin', function (UserService) {
  // var template = undefined;
  // if (UserService.is_logged_in() === true) {
  //   template = "Logged in as {{user.get_name()}} (<a href='/auth/logout'>Sign out</a>)";
  // } else {
  //   template = "<a href='/auth/login'>Sign in with Google+</a>";
  // }

  return {
    "controller": 'UserController',
    "templateUrl": "static/local/icecrate-user/templates/sign-in.html"
  };
});
