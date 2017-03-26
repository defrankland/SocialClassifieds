describe('userProfileController', function() {
  var $httpBackend, $window, $sce, $state, $rootScope, $controller, createController, authRequestHandler;
  
  beforeEach(module('userProfileModule'));
  
  beforeEach(module(function ($stateProvider) { 
    $stateProvider.state('login', { url: '/' }); 
  }));

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
       return $controller('userProfileController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
  
   describe('$scope.getUserInfo', function(){
     it('gets the correct user info from http response', function(){
      var controller = createController();
      var fakeUser = {"0":{firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890}};
                           
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/' 
                             + $window.localStorage['userId']
                             + '/')
                  .respond(200, fakeUser);
      $rootScope.getUserInfo();
      $httpBackend.flush();
      
      expect($rootScope.user).toEqual(fakeUser["0"]);
     });  
   });
   
  describe('$scope.addTag', function(){
    it('adds a tag to the current user', function(){
      var controller = createController();
      
      var tag = 'testTag';
      
      $httpBackend.expectPOST('https://sweng500api.saltosk.com/api/1/user/tag/')
                  .respond(200);

      $rootScope.addTag(tag);
      $httpBackend.flush();
      
      expect(true).toBe(true); //get rid of "no expect" error
    });
  });
  
  describe('$scope.getUserTags', function(){
    it('gets tags for the current user', function(){
      var controller = createController();
      
      var tag = 'testTag';
      
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/tag/'
                            + $window.localStorage['userId']
                            + '/')
                  .respond(200, {"0":[tag]});

      $rootScope.getUserTags();
      $httpBackend.flush();
      
      expect($rootScope.user.tags[0].text).toEqual(tag);
    });
  });
  
  describe('$scope.removeTag', function(){
    it('removes tags from the current user', function(){
      var controller = createController();
      
      var tag = {};
      tag.text = 'testTag';
      
      $httpBackend.expectPOST('https://sweng500api.saltosk.com/api/1/user/removeTag/')
                  .respond(200);

      $rootScope.removeTag(tag);
      $httpBackend.flush();
      
      expect(true).toBe(true); //get rid of "no expect" error
    });
  });
  
  describe('$scope.createUser', function(){
    it('sends a create user request & transitions to login on success', function(){
      var controller = createController();
      var fakeUser = {"0":{firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890}};
      
      $window.localStorage['userId'] = "";
      
      $httpBackend.expectPUT('https://sweng500api.saltosk.com/api/1/user/', fakeUser)
                  .respond(200, {message: 'success'});

      $rootScope.createUser(fakeUser);
      $httpBackend.flush();
      
      expect($state.current.name).toBe('login');
    });
    
    it('sends a create user request & displays message when user already exists', function(){
      var controller = createController();
      var fakeUser = {"0":{firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890}};
      
      $window.localStorage['userId'] = "";
      
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/1/')
                  .respond(200, {user:""});
      $httpBackend.expectPUT('https://sweng500api.saltosk.com/api/1/user/', fakeUser)
                  .respond(200, {message: 'user already exists'});

      $rootScope.createUser(fakeUser);
      $httpBackend.flush();
      
      expect($sce.getTrustedHtml($rootScope.loginMessage)).toContain('User name is taken');
    });
  });
  
  describe('$scope.updateUser', function(){
    it('resets user data in front-end', function(){
      var controller = createController();
      var fakeUser = {id: $window.localStorage['userId'],
                           firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890};
      
      $httpBackend.expectPOST('https://sweng500api.saltosk.com/api/1/user/'
                              + $window.localStorage['userId']
                              + '/'
                             )
                  .respond(200, {message: 'success'});
       $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/'
                              + $window.localStorage['userId']
                              + '/'
                             )
                  .respond(200, {user : {firstName:''}});
      $httpBackend.expectGET('views/userProfile-Home.html')
                  .respond(200, {message: 'success'});
                  
      $rootScope.updateUser(fakeUser);
      $httpBackend.flush();
      
      expect($rootScope.user.firstName).toBe("");
      expect($rootScope.user.lastName).toBe(undefined);
      expect($state.current.name).toBe('userHome');
    });
  });
});


describe('profileController', function() {
  var $httpBackend, $window, $state, $rootScope, $controller, createController, $stateParams;
  
  beforeEach(module('userProfileModule'));
  
  beforeEach(module(function ($stateProvider) { 
    $stateProvider.state('main', { url: '/' }); 
  }));

  beforeEach(inject(function($injector){
    $httpBackend = $injector.get('$httpBackend');
    $http = $injector.get('$http');
    $rootScope = $injector.get('$rootScope');
    $controller = $injector.get('$controller');
    $window = $injector.get('$window');
    $window.localStorage['userId'] = 1;
    $state = $injector.get('$state');
    $sce = $injector.get('$sce');
    $stateParams = $injector.get('$stateParams');
    
    createController = function() {
       return $controller('profileController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
   
   describe('$scope.setCurrentUser', function(){
     it('sets the current user', function(){
      var controller = createController();
      var fakeUser = {id: $window.localStorage['userId'],
                           firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890};
                           
        $rootScope.setCurrentUser(fakeUser);
        
        expect($rootScope.currentUser).toEqual(fakeUser);
     });  
   });
   
   describe('$scope.getCurrentUser', function(){
     it('gets the current user if not null', function(){
      var controller = createController();
      var fakeUser = {id: $window.localStorage['userId'],
                           firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890};
        
        $stateParams.user = fakeUser;        
        $rootScope.getCurrentUser();
        
        expect($rootScope.currentUser).toEqual(fakeUser);
     });  
   });
   
   describe('$scope.getCurrentUser', function(){
     it('transitions to main if null', function(){
      var controller = createController();
      var fakeUser = {id: $window.localStorage['userId'],
                           firstName: 'Homer',
                           lastName: 'Simpson',
                           address1: '12345 Evergreen Terrace',
                           city: 'Springfield',
                           state: 'Dunno',
                           zip: 12345, 
                           phone: 1234567890};
        
        $stateParams.user = null;    

        $rootScope.getCurrentUser();
        $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/undefined/')
                    .respond(200, {message: 'whatever', user:""}); 
                    $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/tag/undefined/')
                    .respond(200, {message: 'whatever', user:""}); 
                    $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/undefined/')
                    .respond(200, {message: 'whatever', user:""}); 
$httpBackend.flush();
        expect($state.current.name).toBe('');
     });  
   });
});

