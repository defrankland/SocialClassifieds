app.controller("User", ["$scope", "userService", "$cookies", "$location", function($scope, userService, $cookies, $location) {
    $scope.user = {};

    $scope.register = function() {

    }

    $scope.isLoggedIn = function() {
        $scope.user = userService.getUser();
        return $scope.user.loggedIn;
    };


    $scope.checkCookie = function() {
        userService.updateUserFromCookie("_scuser");
        $scope.user = userService.getUser();
    };

    /**
     * [login description]
     *
     * @return {[type]} [description]
     */
    $scope.login = function() {
        userService.login($scope.user.userName, $scope.user.password);
    }

    /**
     * [logout description]
     *
     * @return {[type]} [description]
     */
    $scope.logout = function() {
        userService.logout();
    };

    $scope.checkCookie();
}]);