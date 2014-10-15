var IcecrateUser = angular.module('icecrate.user', []);

IcecrateUser.service('UserService', function ($http, $window) {
  var user = {
    "logged_in": false
  };

  this.name = function () {
    return user.fullname || user.nickname || user.email || "Unregistered User";
  }

  this.is_logged_in = function () {
    return user.logged_in;
  }
});

IcecrateUser.controller('UserController', function ($scope, UserService) {
  $scope.user = UserService;
});

IcecrateUser.directive('userSignin', function (UserService) {
  var template = undefined;
  if (UserService.is_logged_in() === true) {
    template = "Logged in as {{user.name()}} (<a href='/auth/logout'>Sign out</a>)";
  } else {
    template = "<a href='/auth/login'>Sign in with Google+</a>";
  }

  return {
    "template": template,
    "controller": 'UserController'
  };
});
