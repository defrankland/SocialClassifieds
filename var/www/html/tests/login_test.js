describe('LoginController', function() {
  var $httpBackend, $window, $sce, $state, $rootScope, $controller, createController, authRequestHandler;
  
  beforeEach(module('mainModule'));
  beforeEach(module('loginModule'));

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
       return $controller('LoginController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
  
   describe('$scope.login', function(){
     it('will login the user if backend responds user authenticated', function(){
      var controller = createController();
      
      var fakeUser = {};
      fakeUser.userName = 'fred123';
      fakeUser.firstName = 'fred';
      
      $httpBackend.expectPOST('https://sweng500api.saltosk.com/api/1/user/login/')
                  .respond(200, {message: "User authenticated", userID: $window.localStorage['userId']});
      $httpBackend.expectGET('views/main.html')
                  .respond(200, {message: 'success'});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/' + $window.localStorage['userId'] + '/')
                  .respond(200, {message: "success", user: fakeUser});

      $rootScope.login(fakeUser);
      $httpBackend.flush();
      
      expect($window.localStorage['userName']).toBe(fakeUser.userName);
     });  
     it('sets an error message if user not found', function(){
      var controller = createController();
      
      var fakeUser = {};
      fakeUser.userName = 'fred123';
      fakeUser.firstName = 'fred';
      
      $httpBackend.expectPOST('https://sweng500api.saltosk.com/api/1/user/login/')
                  .respond(200, {message: "user not found", userID: $window.localStorage['userId']});
      $httpBackend.expectGET('views/main.html')
                  .respond(200, {message: 'success'});

      $rootScope.login(fakeUser);
      $httpBackend.flush();
      
      expect($sce.getTrustedHtml($rootScope.loginMessage)).toContain('Username or password incorrect');
     });
     it('sets an error message if user password is incorrect', function(){
      var controller = createController();
      
      var fakeUser = {};
      fakeUser.userName = 'fred123';
      fakeUser.firstName = 'fred';
      
      $httpBackend.expectPOST('https://sweng500api.saltosk.com/api/1/user/login/')
                  .respond(200, {message: "Incorrect password", userID: $window.localStorage['userId']});
      $httpBackend.expectGET('views/main.html')
                  .respond(200, {message: 'success'});

      $rootScope.login(fakeUser);
      $httpBackend.flush();
      
      expect($sce.getTrustedHtml($rootScope.loginMessage)).toContain('Username or password incorrect');
     });
   });
});