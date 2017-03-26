
var hash = angular.module('hash',[]);

hash.directive("hashInput", function(){
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      function doHash(str){
        return md5(str);
      };
      ngModel.$parsers.push(function(value) {
        return doHash(value);
      });   
    }
  };
});