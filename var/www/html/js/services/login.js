app.factory("login", ["$http", function($http) {
    return {
        login: function(userName, password) {
            return $http.post("http://sweng500api.saltosk.com/api/1/user/login/", {userName: userName, password: password})
                .success(function(data) {
                    return data;
                })
                .error(function(err) {
                    return err;
                });
        },
        logout: function() {
            return "Logged out";
        }
    };
}]);