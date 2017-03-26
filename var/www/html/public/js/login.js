var loginModule = angular.module('loginModule', ['hash', 'userProfileModule']);

loginModule.config(function($stateProvider, $urlRouterProvider) {
    
  $stateProvider
      .state('login', {
          url: '/login',
          templateUrl: 'views/login.html',
          controller: 'LoginController'
  });
});

loginModule.controller('LoginController', ['$sce', '$window', '$http', '$scope', '$state', 'userDataLogin', function($sce, $window, $http, $scope, $state, userDataLogin) {

    $scope.display = function () {
      console.log($scope.form.loginForm);
    };

    $scope.login = function(user){
      addLoginMessage("");
      user.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
      $http.post('https://sweng500api.saltosk.com/api/1/user/login/', user).then(function(response, httpStatus) {
          var res = angular.fromJson(response.data);
          if(res.message === 'User authenticated'){
            $window.localStorage['userId'] = res.userID;
            $window.localStorage['userName'] = user.userName;
            userDataLogin.reset();
            $state.transitionTo('main');
          }
          else if(  (res.message === 'user not found') 
                 || (res.message === 'Incorrect password') ){
            addLoginMessage('Username or password incorrect.\nPlease try again.');
          }

      }, function() {
            addLoginMessage('Error attempting login.\nPlease try again.');
      });

    };
    
    function addLoginMessage (str) {
      $scope.loginMessage = $sce.trustAsHtml("<pre>" + str + "</pre>");
    };
    
}]);

loginModule.factory('userDataLogin', function(userData){
  var userDataLogin = {};

  userDataLogin.reset = function(userID) {
    return userData.reset(userID);
  };

  return userDataLogin;
});