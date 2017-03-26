// user profile module
var userProfileModule = angular.module('userProfileModule', ['ui.router', 'ngMessages', 'hash', 'ngTagsInput']);

userProfileModule.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider
        .state('userHome', {
            url: '/userHome',
            templateUrl: 'views/userProfile-Home.html',
            controller: 'userProfileController'
          })
          .state('userTags', {
            url: '/userTags',
            templateUrl: 'views/userProfile-tags.html',
            controller: 'userProfileController'
          })
          .state('userProfile', {
            url: '/userProfile',
            templateUrl: 'views/userProfile-Profile.html',
            controller: 'userProfileController'
          })
          .state('profileView', {
            url: '/profileView',
            params: {
              user: null,
              userId: null
            },
            templateUrl: 'views/userProfile-View.html',
            controller: 'profileController'
          })
        .state('userProfileForm', {
            url: '/form',
            templateUrl: 'views/userProfile-Form.html',
            controller: 'userProfileController'
        })
        .state('userProfileForm.account', {
            url: '/account',
            templateUrl: 'views/userProfile-account.html'
        })
        .state('userProfileForm.contact', {
            url: '/contact',
            templateUrl: 'views/userProfile-contact.html'
        })
        .state('userProfileForm.payments', {
            url: '/payments',
            templateUrl: 'views/userProfile-payments.html'
        });
       
    // catch all route
    $urlRouterProvider.otherwise('/userProfile/account');
});
        
//controller
userProfileModule.controller('userProfileController', function($sce, $window, $http, $scope, $state, userData) {
    $scope.user = userData.get();
    $scope.user.tags = [];
    $scope.photo = {};
    $scope.user.id       = $window.localStorage['userId'];
    $scope.user.userName = $window.localStorage['userName'];
  
	function addMessage (str) {
        $scope.loginMessage = $sce.trustAsHtml("<pre>" + str + "</pre>");
    };

    $scope.get = function() {
        return userData.get();
    };
  
    $scope.userHasImage = function() {
        if (typeof $scope.user.profileImage === 'undefined') {
            return false;
        }

        return true;
    };

    $scope.isLoggedIn = function() {
        if ($window.localStorage['userId'] === "" || typeof($window.localStorage['userId']) === "undefined") {
            return false;
        }

        return true;
    };

    $scope.updateBio = function() {
        var user    = {
            userId: $window.localStorage["userId"],
            bio: $scope.user.bio,
            api_key: ""
        };

        $http.put("https://sweng500api.saltosk.com/api/1/user/profile/", user)
            .then(function(response, httpStatus) {
            var res = angular.fromJson(response.data);
            if (res["status"] === "ok") {
                $scope.bioSuccessMessage = $sce.trustAsHtml("Update Success");
            } else {
                $scope.bioFailMessage = $sce.trustAsHtml("Update Failed");
            }

            userData.reset();
        });
    };

    $scope.uploadPhoto = function() {
        var userID = $window.localStorage['userId'];
        var formData = new FormData();
        if (typeof $scope.photo.filename === 'undefined') {
            return false;
        }

        formData.append('file', $scope.photo.filename);
        formData.append("userID", userID);
        
        $http.post('https://sweng500api.saltosk.com/api/1/user/photo/', formData, {
            transformRequest: angular.identity,
            headers: {'Content-type': undefined}
        }).then(function(response, httpStatus) {
            var res = angular.fromJson(response.data);
            $scope.user.profileImage = res["link"];
            $scope.photo.filename = undefined;

            $("#photoForm")[0].reset();
            $("#photoForm input").val("");
            $("#photoForm span").html("");

            userData.reset();
        });
    };

    $scope.getUserInfo = function() {
        var usr = {};
        usr.userId = $window.localStorage['userId'];
        usr.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
        $http.get('https://sweng500api.saltosk.com/api/1/user/' + usr.userId + '/').then(function(response){
            var res = angular.fromJson(response.data);
            if(res[0] !== undefined){
                res[0].zip = parseInt(res[0].zip,0);
                res[0].phone = parseInt(res[0].phone,0);
                $scope.user = angular.copy(res["0"]);
            }
        });
    };
  
    $scope.addTag = function($tag) {
        var tag = {};
        tag.tag = $tag.text;
        tag.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
        tag.userId = $window.localStorage['userId'];
        $http.post('https://sweng500api.saltosk.com/api/1/user/tag/', tag);
    };
  
    $scope.removeTag = function($tag) {
        var tag = {};
        tag.tag = $tag.text;
        tag.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
        tag.userId = $window.localStorage['userId'];
        $http.post('https://sweng500api.saltosk.com/api/1/user/removeTag/', tag);
    };
  
    $scope.getUserTags = function() {
        var usr = {};
        usr.userId = $window.localStorage['userId'];
        usr.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';

        $http.get('https://sweng500api.saltosk.com/api/1/user/tag/' + usr.userId + '/').then(function(response){
            var res = angular.fromJson(response.data);
          
            if(res["0"] !== undefined){
                var tagsToAdd = new Array(res["0"].length);
                for(var i = 0; i < res["0"].length; i++){
                $scope.user.tags[i] = {text: res["0"][i]};
                }
            }
        });
    };

    $scope.createUser = function(user){
        if ($scope.isLoggedIn()) {
            return $scope.updateUser(user);
        }
        
        addMessage("");
        user.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
        $http.put('https://sweng500api.saltosk.com/api/1/user/', user).then(function(response, httpStatus) {
            var res = angular.fromJson(response.data);
            if(res.message === 'success'){
                $state.transitionTo('login');
                userData.clear();
            } else if(res.message === 'user already exists') {
                addMessage('User name is taken.\nPlease try again.');
            }
        }, function() {

        });
    };

    $scope.updateUser = function(user){
        addMessage("");
        user.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
        $http.post('https://sweng500api.saltosk.com/api/1/user/' + user.id + '/', user).then(function(response, httpStatus) {
            userData.reset();
            $scope.user = userData.get();
            $state.transitionTo("userHome");
        }, function() {

        });
    };
    
    $scope.deleteUser = function(user){
      $http.delete('https://sweng500api.saltosk.com/api/1/user/' + $window.localStorage['userId'] + '/').then(function(response, httpStatus) {
            userData.clear();
      });
    };
});

/**
 * [description]
 *
 * @param {[type]} $http    [description]
 * @param {Object} $window  [description]
 *
 * @return {[type]} [description]
 */
userProfileModule.factory("userData", ["$http", "$window", function($http, $window) {
    var userData = {};
    userData.user = {};

    userData.template = function() {
        return {
            userName:     $window.localStorage['userName'],
            firstName:    undefined,
            middleName:   undefined,
            lastName:     undefined,
            email:        undefined,
            address1:     undefined,
            address2:     undefined,
            city:         undefined,
            state:        undefined,
            zip:          undefined,
            phone1:       undefined,
            bio:          undefined,
            profileImage: undefined
        };
    };

    userData.getUserData = function(userID) {
        var newUserData = {};

        $http.get("https://sweng500api.saltosk.com/api/1/user/" + userID + "/").then(function(response, httpStatus){
            var res = angular.fromJson(response.data);
            if (typeof(res.user['firstName']) == 'undefined') {
                return newUserData;
            }

            newUserData.userID       = res.user["id"];
            newUserData.userName     = res.user['userName'];
            newUserData.firstName    = res.user['firstName'];
            newUserData.lastName     = res.user['lastName'];
            newUserData.middleName   = res.user['middleName'];
            newUserData.email        = res.user['email'];
            newUserData.city         = res.user['city'];
            newUserData.state        = res.user['state'];
            newUserData.address1     = res.user['address1'];
            newUserData.address2     = res.user['address2'];
            newUserData.zip          = parseInt(res.user['zip'], 10);
            newUserData.phone1       = parseInt(res.user['phone'], 10);
            newUserData.bio          = res.user['bio'];
            newUserData.profileImage = res.user['imgPath'];

            return userData.getDistance(newUserData.zip, userData.get().zip);
        })
        .then(function(distance) {
            newUserData.location = distance;

            return userData.getTags(newUserData.userID);
        })
        .then(function(tags) {
            newUserData.tags = tags;

            return userData.getClassifieds(newUserData.userID);
        })
        .then(function(classifieds) {
            newUserData.classifieds = classifieds;
        });

        return newUserData;
    };

    userData.getDistance = function(zip1, zip2) {
        return $http.get("https://sweng500api.saltosk.com/api/1/fun/distance/" + zip1 + "/" + zip2 + "/")
        .then(function(response, httpStatus) {
            var res = angular.fromJson(response.data);

            return res["distance"];
        });
    };

    userData.getTags = function(userID) {
        return $http.get('https://sweng500api.saltosk.com/api/1/user/tag/' + userID + '/').then(function(response){
            var res = angular.fromJson(response.data);
            var tags = {};
            if (res["0"] !== undefined) {
                var tagsToAdd = new Array(res["0"].length);
                    for(var i = 0; i < res["0"].length; i++){
                    tags[i] = {text: res["0"][i]};
                }
            }

            return tags;
        });
    };

    userData.getClassifieds = function(userID) {
        return $http.get('https://sweng500api.saltosk.com/api/1/user/ad/' + userID + '/')
            .then(function(response,httpStatus){
            var ads = {};
            var res = angular.fromJson(response.data.classifieds);
            
            if (typeof res === "undefined") {
                return {};
            }
            for(var i = 0; i < res.length; i++){
                var ad = {};
                ad.id         = res[i].ID;
                ad.adId       = res[i].AD_ID;
                ad.user       = res[i].USERNAME;
                ad.title      = res[i].TITLE;
                ad.body       = res[i].BODY;
                ad.created    = res[i].CREATED;
                ad.expiration = res[i].EXPIRES;
                ad.price      = parseFloat(res[i].RATE);
                ad.postType   = res[i].AD_TYPE;
                ad.quantity   = parseInt(res[i].QUANTITY);
                ad.address1   = res[i].ADDRESS1;
                ad.address2   = res[i].ADDRESS2;
                ad.city       = res[i].CITY;
                ad.state      = res[i].STATE;
                ad.zip        = parseInt(res[i].ZIP);
                ad.phone      = parseInt(res[i].PHONE);
                ad.email      = res[i].EMAIL;
                ad.image      = res[i].PATH;
                ads[i] = ad;
            }

            return ads;
        });
    }

    userData.reset = function() {
        userData.user = userData.template();
        if ($window.localStorage['userId'] === "" || typeof $window.localStorage['userId'] === "undefined") {
            return false;
        }

        var userID = $window.localStorage['userId'];
        $http.get("https://sweng500api.saltosk.com/api/1/user/" + userID + "/").then(function(response, httpStatus){
            var res = angular.fromJson(response.data);
            if (typeof(res.user['firstName']) == 'undefined') {
                return 0;
            }

            $window.localStorage['userData'] = angular.toJson(res);
            userData.user.userName     = res.user['userName'];
            userData.user.firstName    = res.user['firstName'];
            userData.user.lastName     = res.user['lastName'];
            userData.user.middleName   = res.user['middleName'];
            userData.user.email        = res.user['email'];
            userData.user.city         = res.user['city'];
            userData.user.state        = res.user['state'];
            userData.user.address1     = res.user['address1'];
            userData.user.address2     = res.user['address2'];
            userData.user.zip          = parseInt(res.user['zip'], 10);
            userData.user.phone1       = parseInt(res.user['phone'], 10);
            userData.user.bio          = res.user['bio'];
            userData.user.profileImage = res.user['imgPath'];
        });
    };

    userData.update = function() {
        userData.user = userData.template();
        console.log("UPDATING");
        var res = angular.fromJson($window.localStorage['userData']);
        if (typeof res !== 'undefined') {
            userData.user.userName     = res.user['userName'];
            userData.user.firstName    = res.user['firstName'];
            userData.user.lastName     = res.user['lastName'];
            userData.user.email        = res.user['email'];
            userData.user.lastName     = res.user['lastName'];
            userData.user.middleName   = res.user['middleName'];
            userData.user.city         = res.user['city'];
            userData.user.state        = res.user['state'];
            userData.user.address1     = res.user['address1'];
            userData.user.address2     = res.user['address2'];
            userData.user.zip          = parseInt(res.user['zip'], 10);
            userData.user.phone1       = parseInt(res.user['phone'], 10)
            userData.user.bio          = res.user['bio'];
            userData.user.profileImage = res.user['imgPath'];
        } else {
            console.log("UNDEFINED" + $window.localStorage['userData']);
        }
    };

    userData.get = function() {
        console.log("TRYING");

        if (typeof $window.sessionStorage["userUpdated"] === "undefined" ||
            false == $window.sessionStorage["userUpdated"]) {
            userData.reset();
            $window.sessionStorage["userUpdated"] = true;
        }

        if (typeof userData.user.firstName === "undefined") {
            userData.update();
        }

        return userData.user;
    };

    userData.clear = function() {
        userData.user = userData.template();
        $window.localStorage.removeItem('userData');
        $window.localStorage.removeItem('userId');
        $window.localStorage.removeItem('userName');
        $window.sessionStorage.removeItem("userUpdated");
    };

    return userData;
}]);


userProfileModule.controller('profileController', function($sce, $window, $http, $scope, $state, $stateParams, userData) {
  $scope.currentUser = {};
  //$scope.currentUser.tags = [];
  
  $scope.setCurrentUser = function(user) {
      $scope.currentUser = user;
  };
  
  $scope.getCurrentUser = function() {
    if($stateParams.user !== null){
      $scope.currentUser = $stateParams.user;
    } else if ($stateParams.userId !== null) {
        $scope.currentUser = userData.getUserData($stateParams.userId);
    } else{
      $state.transitionTo('main');
    }

    if ($scope.currentUser.length === 0) {
        $state.transitionTo('main');
    }
  };
  
});

//password verify directive 
userProfileModule.directive("passwordVerify", function() {
   return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
            }                    
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== md5(viewValue)) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
});

//username check availability
userProfileModule.directive('usernameAvailable', function($timeout, $http, $window) {
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, model) { 
        model.$asyncValidators.usernameExists = function() {
          var userData = {};
          
          userData.api_key = '49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
          userData.userName = model.$viewValue;

          return $http.get('https://sweng500api.saltosk.com/api/1/user/' + userData.userName + '/').then(function(response){+
            $timeout(function(){
                var res = angular.fromJson(response.data);
                if (res.message === "user not found") {
                    model.$setValidity('usernameExists', true); 
                } else {
                    model.$setValidity('usernameExists', false);
                }
                
                if (  ($window.localStorage['userName'] != undefined)
                   && (res.user['userName'] != undefined)
                   && ($window.localStorage['userName'] === res.user['userName']) ) {
                    model.$setValidity('usernameExists', true);   
                }
            }, 500);
          });
        };
      }
    } 
});

userProfileModule.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                  
                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

userProfileModule.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});