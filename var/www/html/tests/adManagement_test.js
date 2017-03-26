describe('adViewController', function() {
  var $httpBackend, $window, $rootScope, $controller, $state, $stateParams, $sce, createController;
  
  beforeEach(module('mainModule'));
  beforeEach(module('adModule'));

  beforeEach(inject(function($injector){
    $httpBackend = $injector.get('$httpBackend');
    $http = $injector.get('$http');
    $rootScope = $injector.get('$rootScope');
    $controller = $injector.get('$controller');
    $window = $injector.get('$window');
    $window.localStorage['userId'] = 1;
    $state = $injector.get('$state');
    $stateParams = $injector.get('$stateParams');
    $sce = $injector.get('$sce');
    
    createController = function() {
       return $controller('adViewController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
   
   describe('$scope.getUserClassifieds', function(){
     it('gets the current user classifieds', function(){
      var passedTest = true;
      var controller = createController();
      var fakeAds = {classifieds:
                      [
                        {TITLE: 'fakeAd1', BODY: 'fake body 1', CREATED: 'date1', EXPIRES: 'exp1', PRICE: 1},
                        {TITLE: 'fakeAd2', BODY: 'fake body 2', CREATED: 'date2', EXPIRES: 'exp2', PRICE: 1}
                      ]
                    };
        
        $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/'
                                + $window.localStorage['userId']
                                + '/'
                               )
                    .respond(200, fakeAds);
        $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
         $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/ad/tag/undefined/')
                      .respond(200, {tags: ""});        
         $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/ad/tag/undefined/')
                      .respond(200, {tags: ""});                          
        $rootScope.getUserClassifieds();
        $httpBackend.flush();
        
        for(var i = 0; i < fakeAds.length; i++){
          if(   ($rootScope.myAds.title != fakeAds.TITLE)
             || ($rootScope.myAds.body != fakeAds.BODY)
             || ($rootScope.myAds.created != fakeAds.CREATED)
             || ($rootScope.myAds.expiration != fakeAds.EXPIRES)
             || ($rootScope.myAds.price != fakeAds.PRICE)
            ) {
              passedTest = false;
            }
        }
        expect(passedTest).toEqual(true);
     });  
     
     it('stores service ads with rate instead of price', function(){
      var passedTest = true;
      var controller = createController();
      var fakeAds = {classifieds:
                      [
                        {TITLE: 'fakeAd1', BODY: 'fake body 1', CREATED: 'date1', EXPIRES: 'exp1', RATE: 1}
                      ]
                    };
     
        $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/'
                                        + $window.localStorage['userId']
                                        + '/'
                                       )
                            .respond(200, fakeAds);
        $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
        $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/ad/tag/undefined/')
            .respond(200, {tags: ""});        

        $rootScope.getUserClassifieds();
        $httpBackend.flush();
        
        for(var i = 0; i < fakeAds.length; i++){
          if(   ($rootScope.myAds.title != fakeAds.TITLE)
             || ($rootScope.myAds.body != fakeAds.BODY)
             || ($rootScope.myAds.created != fakeAds.CREATED)
             || ($rootScope.myAds.expiration != fakeAds.EXPIRES)
             || ($rootScope.myAds.rate != fakeAds.RATE)
            ) {
              passedTest = false;
            }
        }
        expect(passedTest).toEqual(true);     
     });
   });

   describe('$scope.setCurrentAd', function(){
    it('sets the current user ad', function(){
      var controller = createController();
      var fakeAd = {title: 'fakeAd1', body: 'fake body 1', created: 'date1', expiration: 'exp1', price: 1};
      
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
                    
      $rootScope.setCurrentAd(fakeAd);
      $httpBackend.flush();
      
      expect($rootScope.currentAd).toBe(fakeAd);
    });
   });
   
   describe('$scope.getCurrentAd', function(){
    it('gets the current user ad', function(){
      var controller = createController();
      var fakeAd = {title: 'fakeAd1', body: 'fake body 1', created: 'date1', expiration: 'exp1', price: 1};
      
      $stateParams.ad = fakeAd;
      
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
                                
      $rootScope.getCurrentAd();
      $httpBackend.flush();
      
      expect($rootScope.currentAd).toBe(fakeAd);
    });
    it('goes to main view if current ad is not set', function(){
      var controller = createController();
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});   
      $rootScope.getCurrentAd();
      $httpBackend.flush();
      
      expect($state.current.name).toBe('main');
    });
   });
   
});


describe('adManagementController', function() {
  var $httpBackend, $window, $rootScope, $controller, $state, $stateParams, createController;
  
  beforeEach(module('mainModule'));
  beforeEach(module('adModule'));

  beforeEach(inject(function($injector){
    $httpBackend = $injector.get('$httpBackend');
    $http = $injector.get('$http');
    $rootScope = $injector.get('$rootScope');
    $controller = $injector.get('$controller');
    $window = $injector.get('$window');
    $window.localStorage['userId'] = 1;
    $state = $injector.get('$state');
    $stateParams = $injector.get('$stateParams');
    
    createController = function() {
       return $controller('adManagementController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
   
   describe('$scope.setAdType', function(){
    it('sets the Cost member of the ad to Rate when postType is Service', function(){
      var controller = createController();
      
      $rootScope.ad.postType = 'Service';
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $rootScope.setAdType();
      $httpBackend.flush();
      expect($rootScope.Cost).toBe('Rate');
    });
    it('sets the Cost member of the ad to Price when postType is Product', function(){
      var controller = createController();
      
      $rootScope.ad.postType = 'Product';
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $rootScope.setAdType();
      $httpBackend.flush();
      expect($rootScope.Cost).toBe('Price');
    });
   });
   
   describe('$scope.initExpiration', function(){
    it('inits the expiry date to 30 days from now', function(){
      var controller = createController();
      var testExpiry = new Date();
      testExpiry.setDate(testExpiry.getDate() + 30);
      
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $rootScope.initExpiration();
      $httpBackend.flush();
      expect($rootScope.ad.expiration).not.toBeLessThan(testExpiry);
    });
   });
   
   describe('$scope.submitForm', function(){
    it('sends a PUT request & transitions to adHome on success', function(){
      var controller = createController();
      var fakeAd = {title: 'fakeAd1', body: 'fake body 1', created: 'date1', expiration: 'exp1', price: 1};
      $httpBackend.expectPUT('https://sweng500api.saltosk.com/api/1/user/ad/')
                    .respond(200, {message: 'success'});
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $httpBackend.expectGET('views/adManagement-Home.html')
                    .respond(200, {message: 'success'});
      $rootScope.submitForm(fakeAd);
      $httpBackend.flush();
      expect($state.current.name).toBe('adHome');
    });
    it('adds an error message on fail', function(){
      var controller = createController();
      var fakeAd = {title: 'fakeAd1', body: 'fake body 1', created: 'date1', expiration: 'exp1', price: 1};
      $httpBackend.expectPUT('https://sweng500api.saltosk.com/api/1/user/ad/')
                    .respond(200, {message: 'nything but success'});
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $rootScope.submitForm(fakeAd);
      $httpBackend.flush();
      expect($rootScope.successMessage).not.toBe('');
    });
   });
 });