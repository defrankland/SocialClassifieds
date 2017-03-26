var contactModule = angular.module('contactModule', ['userProfileModule'])

  .config(function($stateProvider, $urlRouterProvider) {
      
      $stateProvider
          .state('contactHome', {
            url: '/contactHome',
            templateUrl: 'views/contact-Home.html',
            controller: 'ContactController'
          });
  })

  .controller('ContactController', 
    ['$sce','$window', '$http', '$scope', '$state', 'userDataContact', 
    function($sce, $window, $http, $scope, $state, userDataContact) {
    
    $scope.suggestedContacts = [];
    $scope.myContacts = [];
    $scope.contactRequests = [];

    var getContactTags = function(contactID) {
        var usr = {};
        var tags = {};
        usr.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';

        $http.get('https://sweng500api.saltosk.com/api/1/user/tag/' + contactID + '/').then(function(response){
            var res = angular.fromJson(response.data);
          
            if (res["0"] !== undefined) {
                var tagsToAdd = new Array(res["0"].length);
                    for(var i = 0; i < res["0"].length; i++){
                    tags[i] = {text: res["0"][i]};
                }
            }
        });

        return tags;
    };

    var getContactClassifieds = function(contactID) {
        var classifieds = {};

        $http.get('https://sweng500api.saltosk.com/api/1/user/ad/' + contactID + '/')
            .then(function(response,httpStatus){
            var res = angular.fromJson(response.data.classifieds);
            
            if (typeof res !== "undefined") {
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
                    ad.userData   = {};
                    classifieds[i] = ad;
                }
            }
        });

        return classifieds;
    };

    $scope.rejectContactRequest = function(user) {
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key = '';
      $http.put('https://sweng500api.saltosk.com/api/1/user/friends/reject/' + user.userId + '/', request)
        .then(function(response, httpStatus) {
          $scope.getMyContacts();
          $scope.getContactRequests();
          $scope.getSuggestedContacts();
        });
    };

    $scope.acceptContactRequest = function(user) {
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key = '';
      $http.put('https://sweng500api.saltosk.com/api/1/user/friends/' + user.userId + '/', request)
        .then(function(response, httpStatus) {
          $scope.getMyContacts();
          $scope.getContactRequests();
          $scope.getSuggestedContacts();
        });
    };

    $scope.sendContactRequest = function(user){
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key = '';
      $http.put('https://sweng500api.saltosk.com/api/1/user/friends/requests/' + user.userId + '/', request)
        .then(function(response, httpStatus) {
          $scope.getMyContacts();
          $scope.getContactRequests();
          $scope.getSuggestedContacts();
        });
    };

    $scope.cancelContactRequest = function(user){
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key = '';
      $http.delete('https://sweng500api.saltosk.com/api/1/user/friends/requests/' + user.userId + '/', {params: request})
        .then(function(response, httpStatus) {
          $scope.getMyContacts();
          $scope.getContactRequests();
          $scope.getSuggestedContacts();
        });
    };

    $scope.removeContact = function(user){
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key = '';
      $http.delete('https://sweng500api.saltosk.com/api/1/user/friends/' + user.userId + '/', {params: request})
        .then(function(response, httpStatus) {
          $scope.getMyContacts();
          $scope.getContactRequests();
          $scope.getSuggestedContacts();
        });
    };

    $scope.getContactRequests = function() {
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
      $http.get('https://sweng500api.saltosk.com/api/1/user/friends/pending/' + request.userId + '/')
        .then(function(response,httpStatus){
          $scope.classifieds = angular.fromJson(response.data);
          
          var res = angular.fromJson(response.data);
          
          var str = "";
          $scope.contactRequests = {};
          for(var i = 0; i < res["friends"].length; i++){
            var user = {};
            user = {};
            user.requestType  = res["friends"][i].requestType;
            user.name         = res["friends"][i].user;
            user.location     = res["friends"][i].distance;
            user.userId       = res["friends"][i].userID;
            user.address1     = res["friends"][i].ADDRESS1;
            user.address2     = res["friends"][i].ADDRESS2;
            user.city         = res["friends"][i].CITY;
            user.state        = res["friends"][i].STATE;
            user.zip          = res["friends"][i].ZIP;
            user.phone        = res["friends"][i].PHONE1;
            user.email        = res["friends"][i].EMAIL;
            //user.userData     = userDataContact.getUserData(user.userId);
            //user.profileImage = user.userData.profileImage;
            user.tags         = getContactTags(user.userId);
            user.classifieds  = getContactClassifieds(user.userId);

            $scope.contactRequests[i] = user;
          }
        });
    };
    
    $scope.getMyContacts = function(){
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
      $http.get('https://sweng500api.saltosk.com/api/1/user/friends/' + request.userId + '/', request)                         
        .then(function(response,httpStatus){
          $scope.classifieds = angular.fromJson(response.data);
          
          var res = angular.fromJson(response.data);
          
          var str = "";
          $scope.myContacts = {};
          for(var i = 0; i < res["friends"].length; i++){
            var user = {};
            user = {};
            user.name         = res["friends"][i].user;
            user.location     = res["friends"][i].distance;
            user.userId       = res["friends"][i].userID;
            user.address1     = res["friends"][i].ADDRESS1;
            user.address2     = res["friends"][i].ADDRESS2;
            user.city         = res["friends"][i].CITY;
            user.state        = res["friends"][i].STATE;
            user.zip          = res["friends"][i].ZIP;
            user.phone        = res["friends"][i].PHONE1;
            user.email        = res["friends"][i].EMAIL;
            //user.profileImage = userDataContact.getUserData(user.userId).profileImage;
            user.tags         = getContactTags(user.userId);
            user.classifieds  = getContactClassifieds(user.userId);


            $scope.myContacts[i] = user;
          }
        });
    };
    
    $scope.getSuggestedContacts = function(){
      var request = {};
      request.userId = $window.localStorage['userId'];
      request.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
      $http.get('https://sweng500api.saltosk.com/api/1/user/findFriends/' + request.userId + '/', request)                         
        .then(function(response,httpStatus){
          $scope.classifieds = angular.fromJson(response.data);
          
          var res = angular.fromJson(response.data);
          
          var str = "";
          $scope.suggestedContacts = {};
          for(var i = 0; i < res["friends"].length; i++){
            var user = {};
            user          = {};
            user.name         = res["friends"][i].user;
            user.location     = res["friends"][i].distance;
            user.userId       = res["friends"][i].userID;
            user.address1     = res["friends"][i].ADDRESS1;
            user.address2     = res["friends"][i].ADDRESS2;
            user.city         = res["friends"][i].CITY;
            user.state        = res["friends"][i].STATE;
            user.zip          = res["friends"][i].ZIP;
            user.phone        = res["friends"][i].PHONE1;
            user.email        = res["friends"][i].EMAIL;
            user.matchCount   = res["friends"][i].matchCount;
            //user.profileImage = userDataContact.getUserData(user.userId).profileImage;
            user.tags         = getContactTags(user.userId);
            user.classifieds  = getContactClassifieds(user.userId);


            $scope.suggestedContacts[i] = user;
          }
        });
    };
  }]);

contactModule.factory("userDataContact", function(userData) {
    var userDataMain = {};

    userDataMain.getUserData = function(userID) {
      return userData.getUserData(userID);
    };

    return userDataMain;
});