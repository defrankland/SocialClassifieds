var mainModule = angular.module('mainModule', ['userProfileModule',
                                               'loginModule',
                                               'adModule',
                                               'contactModule',
                                               'datatables',
                                               'datatables.bootstrap']);

mainModule.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('main', {
        url: '/main',
        templateUrl: 'views/main.html',
        controller: 'mainController'
    });
    

    $urlRouterProvider.otherwise('/main');

    //$locationProvider.html5Mode(true);
});


mainModule.controller('mainController', ['$scope', '$http', '$sce' , '$window', '$state', 'userDataMain', function($scope, $http, $sce, $window, $state, userDataMain) {
  
  $scope.userName = $window.localStorage['userName'];
  $scope.classifieds = {};

  function updateClassifiedsList(str) {
    $scope.htmlString = $sce.trustAsHtml("<ul>" + str + "</ul>");
  };

  $scope.get = function() {
    return userDataMain.get();
  };
  
  $scope.logout = function(){
      $window.localStorage.clear();
      userDataMain.clear();
      $scope.userName = "";
      $state.transitionTo('login');
    };
    
  $scope.login = function(){
    $state.transitionTo('login');
  };
  
  $scope.getAllClassifieds = function() {
    var request = {};
    request.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
    $http.get('https://sweng500api.saltosk.com/api/1/ad/all/')
      .then(function(response,httpStatus){
        var res = angular.fromJson(response.data);

        if (typeof res !== "undefined") {
          for (var i = 0; i < res["classifieds"].length; i++) {
            var ad = {};
            ad.adId     = res["classifieds"][i].AD_ID;
            ad.user     = res["classifieds"][i].USERNAME;
            ad.adType   = res["classifieds"][i].AD_TYPE;
            ad.title    = res["classifieds"][i].TITLE;
            ad.body     = res["classifieds"][i].BODY;
            ad.created  = res["classifieds"][i].CREATED;
            ad.expires  = res["classifieds"][i].EXPIRES;
            ad.quantity = res["classifieds"][i].QUANTITY;
            ad.rate     = res["classifieds"][i].RATE;
            $scope.classifieds[i] = ad;
          }
        }
      });
  };
  
  $scope.getLoginState = function() {
    $scope.userData = userDataMain.get();
    if ($window.localStorage['userId'] === "" || typeof($window.localStorage['userId']) === "undefined"){
      return false;
    } else {
      return true;
    }
  };

  // function someClickHandler(info) {
  //     vm.message = info.id + ' - ' + info.firstName;
  // }
  
  // // function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
  // //     // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
  // //     $('td', nRow).unbind('click');
  // //     $('td', nRow).bind('click', function() {
  // //         $scope.$apply(function() {
  // //             vm.someClickHandler(aData);
  // //         });
  // //     });
  // //     return nRow;
  // // }

}]);

mainModule.factory("userDataMain", function(userData) {
    var userDataMain = {};

    userDataMain.get = function() {
       return userData.get();
    };

    userDataMain.reset = function(userID) {
      return userData.reset(userID);
    };

    userDataMain.update = function() {
      return userData.update();
    };
    
    userDataMain.clear = function() {
      return userData.clear();
    };

    return userDataMain;
});