var adModule = angular.module('adModule', [])

  .config(function($stateProvider, $urlRouterProvider) {
      
      $stateProvider
          .state('adHome', {
            url: '/adHome',
            templateUrl: 'views/adManagement-Home.html',
            controller: 'adViewController'
          })
          .state('adView', {
            url: '/adView',
            params: {
              ad: null,
              user: null,
              adId: null
            },
            templateUrl: 'views/adManagement-ViewAd.html',
            controller: 'adViewController'
          })
          .state('adManagementForm', {
              url: '/form',
              templateUrl: 'views/adManagement-Form.html',
              controller: 'adManagementController'
          })
          .state('adManagementForm.basicInfo', {
              url: '/basicInfo',
              templateUrl: 'views/adManagement-BasicInfo.html',
          })
          .state('adManagementForm.contactInfo', {
              url: '/contactInfo',
              templateUrl: 'views/adManagement-ContactInfo.html',
          })
          .state('adManagementForm.media', {
              url: '/media',
              templateUrl: 'views/adManagement-Media.html',
          });
  })

  .controller('adViewController', ['$sce', '$window', '$http', '$scope', '$state', '$stateParams', 'adData', function($sce, $window, $http, $scope, $state, $stateParams, adData) {
    
    $scope.myAds     = [];
    $scope.currentAd = {};
    $scope.Cost      = 'Price';
    $scope.user      = {};

    if($stateParams.user !== null){
        $scope.user = $stateParams.user;
    }

    var getClassifiedTags = function(adId) {
        var tags = {};
        $http.get('https://sweng500api.saltosk.com/api/1/ad/tag/' + adId + '/').then(function(response){
            var res = angular.fromJson(response.data);
          
            if (res["tags"] !== undefined) {
                var tagsToAdd = new Array(res["tags"].length);
                    for(var i = 0; i < res["tags"].length; i++){
                    tags[i] = {text: res["tags"][i]};
                }
            }
        });

        return tags;
    };
    
    $scope.getUserClassifieds = function() {
        var request = {};
        
        adData.clear();
        $scope.myAds = {};
        request.userId = $window.localStorage['userId'];
        request.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
        $http.get('https://sweng500api.saltosk.com/api/1/user/ad/' + request.userId + '/', request)                         
            .then(function(response,httpStatus){
            
            $scope.classifieds = angular.fromJson(response.data.classifieds);
            if (typeof(response.data.classifieds) !== "undefined") {
                var res = angular.fromJson(response.data.classifieds);
          
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
                    ad.tags       = getClassifiedTags(ad.adId);
                    $scope.myAds[i] = ad;
                }
            }
        });
    };
    
    $scope.setCurrentAd = function(ad) {
      $scope.currentAd = ad;
      adData.update(ad);
    };
    
    $scope.getCurrentAd = function() {
      
      if($stateParams.ad !== null){
        $scope.currentAd = $stateParams.ad;
      } else if ($stateParams.adId !== null) {
        $scope.currentAd = adData.getAdData($stateParams.adId);
      } else{
        $state.transitionTo('main');
      }

      if (  ($scope.currentAd !== undefined)
         && ($scope.currentAd.length === 0) ) {
       $state.transitionTo('main'); 
      }
    };

    $scope.setAdType = function(){
      if($scope.currentAd.type === 'Service'){
        $scope.Cost = 'Rate';
        $scope.currentAd.rate = $scope.currentAd.price;
      }
      else{
        $scope.Cost = 'Price';
      }
    };
    
    $scope.deleteAd = function(){
      $http.delete('https://sweng500api.saltosk.com/api/1/user/ad/' + $scope.currentAd.adId + '/', {params: {userId: $window.localStorage['userId']} })
        .then(function(response, httpStatus){
          $scope.getUserClassifieds();
          $state.transitionTo('adHome');
        });
    };

  }])
  
  .controller('adManagementController', ['$sce', '$window', '$http', '$scope', '$state', 'adData', 'userData', function($sce, $window, $http, $scope, $state, adData, userData) {
    
    $scope.ad = {};
    $scope.ad.image = {};
    $scope.Cost = 'Price';


    
    $scope.setAdType = function(){
      if($scope.ad.postType === 'Service'){
        $scope.Cost = 'Rate';
        //delete $scope.ad.price;
      }
      else{
        $scope.Cost = 'Price';
        //delete $scope.ad.rate;
      }
    };
    
    $scope.initExpiration = function(){
      var future = new Date();
      future.setDate(future.getDate() + 30);
      $scope.ad.expiration = future;
    }

    $scope.uploadPhoto = function() {
      alert(ad.images);
    };

    $scope.tempUpload = function() {
        var formData = new FormData();

        formData.append('file', $scope.ad.image.filename);
        formData.append("userID", $window.localStorage["userId"]);
        
        $http.post('https://sweng500api.saltosk.com/api/1/temp/photo/', formData, {
            transformRequest: angular.identity,
            headers: {'Content-type': undefined}
        }).then(function(response, httpStatus) {
            var res = angular.fromJson(response.data);
            $scope.ad.image.tempPath = res["link"];
        });
    };
    
    $scope.submitForm = function(ad){
      $scope.ad.streetAddress1 = $scope.ad.address1;
      $scope.ad.streetAddress2 = $scope.ad.address2;
      
      ad.api_key='49d741ef4cb7db73cf46ff133f76a927d2ab208482555642f7a8036840f5546d';
      ad.creationDate = new Date();
      ad.userId = $window.localStorage['userId'];
      $http.put('https://sweng500api.saltosk.com/api/1/user/ad/', ad)
        .then(successCallback, errorCallback);
    };
    
    $scope.loadForm = function(){
      if(adData.getAd() != undefined){
        $scope.ad = adData.getAd();
      }
    };
    
    $scope.getProfileContactInfo = function(key){
      
      if($scope.ad.chkUseProfileAddress){
        var user = userData.get();
        $scope.ad.address1 = user.address1;
        $scope.ad.address2 = user.address2;
        $scope.ad.city = user.city;
        $scope.ad.state = user.state;
        $scope.ad.zip = user.zip;
        $scope.ad.phone = user.phone1;
        $scope.ad.email = user.email;
      }
      else{
        $scope.ad.address1 = '';
        $scope.ad.address2 = '';
        $scope.ad.city = '';
        $scope.ad.state = '';
        $scope.ad.zip = '';
        $scope.ad.phone = '';
        $scope.ad.email = '';
      }
      
    };
    
    $scope.cancelAd = function(){
      $state.transitionTo('adHome');
    };
    
    function successCallback(response,httpStatus){
      
      var res = angular.fromJson(response.data);
      if(res.message === 'success'){
        $state.transitionTo('adHome');
      }
      else{
        addSuccessMessage('Failed to post your ad.\nPlease try again.');
      }
    }
    
    function errorCallback(){
    }
    
    	function addSuccessMessage (str) {
        $scope.successMessage = $sce.trustAsHtml("<pre>" + str + "</pre>");
    };

   }]);   
  
  
adModule.factory("adData", ["$http", "$window", function($http, $window) {
  var adData = {};
  adData.ad = {};

  adData.update = function(ad) {
    adData.ad = ad;
    if(ad.rate != undefined){
      adData.ad.price = parseInt(ad.rate);
    }
    if(ad.price != undefined) {
      adData.ad.price = parseInt(ad.price);
    }
  };

  adData.getAdData = function(adId) {
    var adStuff = {};

    $http.get("https://sweng500api.saltosk.com/api/1/ad/" + adId + "/").then(function(response, httpStatus) {
      var res = angular.fromJson(response.data);
      if (typeof res == "undefined") {
        return adStuff;
      }
      res = res["ad"];
      adStuff.id         = res.ID;
      adStuff.adId       = res.AD_ID;
      adStuff.user       = res.USERNAME;
      adStuff.title      = res.TITLE;
      adStuff.body       = res.BODY;
      adStuff.created    = res.CREATED;
      adStuff.expiration = res.EXPIRES;
      adStuff.price      = parseFloat(res.RATE);
      adStuff.postType   = res.AD_TYPE;
      adStuff.quantity   = parseInt(res.QUANTITY);
      adStuff.address1   = res.ADDRESS1;
      adStuff.address2   = res.ADDRESS2;
      adStuff.city       = res.CITY;
      adStuff.state      = res.STATE;
      adStuff.zip        = parseInt(res.ZIP);
      adStuff.phone      = parseInt(res.PHONE);
      adStuff.email      = res.EMAIL;
      adStuff.image      = res.PATH;
      adStuff.tags       = {};

      return adData.getAdTags(adStuff.adId);
    })
    .then(function(tags) {
      adStuff.tags = tags;

      return adData.getDistance(adStuff.zip, $window.localStorage["userData"].zip);
    })
    .then(function(distance) {
      adStuff.location = distance;
    });

    return adStuff;
  };

  adData.getAdTags = function(adId) {
    return $http.get('https://sweng500api.saltosk.com/api/1/ad/tag/' + adId + '/').then(function(response){
        var res = angular.fromJson(response.data);
        var tags = {};
        if (res["tags"] !== undefined) {
            var tagsToAdd = new Array(res["tags"].length);
                for(var i = 0; i < res["tags"].length; i++){
                tags[i] = {text: res["tags"][i]};
            }
        }

        return tags;
    });
  };

  adData.getDistance = function(zip1, zip2) {
        return $http.get("https://sweng500api.saltosk.com/api/1/fun/distance/" + zip1 + "/" + zip2 + "/")
        .then(function(response, httpStatus) {
            var res = angular.fromJson(response.data);

            return res["distance"];
        });
    };

  adData.getAd = function() {
      return adData.ad;
  };

  adData.clear = function() {
      adData.ad = {};
  };

  return adData;
}]);
