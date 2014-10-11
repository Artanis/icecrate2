var IcecrateUser = angular.module('icecrate.user', []);

IcecrateUser.service('UserService', function ($http, $window) {
  console.log("UserService!");
  var openid_url = "https://accounts.google.com/o/oauth2/auth";

  var user = {
    "logged_in": false
  };

  this.name = function () {
    return user.fullname || user.nickname || user.email || "Unregistered User";
  }

  this.is_logged_in = function () {
    return user.logged_in;
  }

  this.login = function () {
    $http.post("/auth/verify", {"openid": {"url": openid_url}}).then(function (data) {
      $window.location.href = data.data;
    });
  };

  this.logout = function () {
    user = {
      "logged_in": false
    };
  };
});

IcecrateUser.controller('UserController', function ($scope, UserService) {
  $scope.user = UserService;
});

IcecrateUser.directive('userSignin', function (UserService) {
  var template = undefined;
  if (UserService.is_logged_in() === true) {
    template = "Logged in as {{user.name()}} (<a href='' ng-click='user.logout();'>Sign out</a>)";
  } else {
    template = "<a href='' ng-click='user.login();'>Sign in with Google</a>";
  }

  return {
    "template": template,
    "controller": 'UserController'
  };
});
