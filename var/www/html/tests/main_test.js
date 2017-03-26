 describe('mainController', function() {
  var $httpBackend, $window, $sce, $state, $rootScope, $controller, createController, authRequestHandler;
  
  beforeEach(module('mainModule'));

  beforeEach(inject(function($injector){
    $httpBackend = $injector.get('$httpBackend');
    $http = $injector.get('$http');
    $rootScope = $injector.get('$rootScope');
    $controller = $injector.get('$controller');
    $window = $injector.get('$window');
    $window.localStorage['userId'] = 1;
    $state = $injector.get('$state');
    $sce = $injector.get('$sce');
    
    createController = function() {
       return $controller('mainController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
  
   describe('$scope.logout', function(){
     it('clears the user session', function(){
      var controller = createController();
                           
      
      $httpBackend.expectGET('views/login.html')
                    .respond(200, {message: 'success'});
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      
      expect($window.localStorage['userId']).toBe('1');
      
      $rootScope.logout();
      $httpBackend.flush();
      
      expect($window.localStorage['userId']).toBe(undefined);
     });  
   });
   describe('$scope.getLoginState', function(){
     it('returns true when user session is set', function(){
      var controller = createController();
                           
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $httpBackend.flush();
      
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/1/')
                    .respond(200, {message: 'whatever', user: ""});
                    
      
      expect($rootScope.getLoginState()).toBe(true);
      
      $httpBackend.flush();
     });  
     it('returns false when user session is empty', function(){
      var controller = createController();
                           
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $httpBackend.flush();
      
      $window.localStorage['userId'] = "";
      
      expect($rootScope.getLoginState()).toBe(false);
     }); 
     it('returns false when user session is undefined', function(){
      var controller = createController();
                           
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $httpBackend.flush();
      
      $window.localStorage.clear();
      
      expect($rootScope.getLoginState()).toBe(false);
     }); 
   });
});