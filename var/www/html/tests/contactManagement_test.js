describe('ContactController', function() {
  var $httpBackend, $window, $sce, $state, $rootScope, $controller, createController, authRequestHandler;
  
  beforeEach(module('mainModule'));
  beforeEach(module('contactModule'));

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
       return $controller('ContactController', {'$scope' : $rootScope });
     };
  }));
   
    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
  
   describe('$scope.getSuggestedContacts', function(){
     it('gets suggested contacts for the current user', function(){
      var controller = createController();
      var testPassed = true;
      var fakeFriends = {"friends":[
                          {user: 'homerSimpson',
                          distance: '5'},
                          {user: 'bartSimpson',
                          distance: '20'}
                       ]};
                           
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/findFriends/' 
                             + $window.localStorage['userId']
                             + '/')
                  .respond(200, fakeFriends);
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/tag/undefined/')
                  .respond(200, {message: "junk"});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/undefined/')
                  .respond(200, {message: "junk"});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/tag/undefined/')
                  .respond(200, {message: "junk"});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/undefined/')
                  .respond(200, {message: "junk"});
      $rootScope.getSuggestedContacts();
      $httpBackend.flush();
      
      for(var i = 0; i < fakeFriends["friends"].length; i++){
        if(   ($rootScope.suggestedContacts[i].name != fakeFriends["friends"][i].user)
          ||  ($rootScope.suggestedContacts[i].location != fakeFriends["friends"][i].distance) ){
          
            testPassed = false;
        }
      }
      expect(testPassed).toBe(true);
     });  
   
   });
   
   describe('$scope.getMyContacts', function(){
     it('gets contacts for the current user', function(){
      var controller = createController();
      var testPassed = true;
      var fakeFriends = {"friends":[
                          {user: 'homerSimpson',
                          distance: '5'},
                          {user: 'bartSimpson',
                          distance: '20'}
                       ]};
                           
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/friends/' 
                             + $window.localStorage['userId']
                             + '/')
                  .respond(200, fakeFriends);
      $httpBackend.expectGET('views/main.html')
                    .respond(200, {message: 'success'});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/tag/undefined/')
                  .respond(200, {message: "junk"});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/undefined/')
                  .respond(200, {message: "junk"});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/tag/undefined/')
                  .respond(200, {message: "junk"});
      $httpBackend.expectGET('https://sweng500api.saltosk.com/api/1/user/ad/undefined/')
                  .respond(200, {message: "junk"});
      $rootScope.getMyContacts();
      $httpBackend.flush();
      
      for(var i = 0; i < fakeFriends["friends"].length; i++){
        if(   ($rootScope.myContacts[i].name != fakeFriends["friends"][i].user)
          ||  ($rootScope.myContacts[i].location != fakeFriends["friends"][i].distance) ){
          
            testPassed = false;
        }
      }
      expect(testPassed).toBe(true);
     }); 
   }); 
});