app.controller("Login", ["$scope", "userService", "$cookies", function($scope, userService, $cookies) {
    $scope.user = {
        userName: "",
        password: "",
        loggedIn: "",
        message: ""
    };

    $scope.login = function() {
        userService.login($scope.user.userName, $scope.user.password)
            .success(function(data) {
                if (data.status == "ok") {
                    $scope.user.loggedIn = true;
                    $cookieObject = {
                        id: data.userID
                    };

                    $cookies.putObject("_scuser", $cookieObject);
                }
                $scope.user.message = data.message;
            })
            .error(function(data) {
                $scope.user.message = data;
            });
    }
}]);