app.factory("userService", ["$http", "$cookies", function($http, $cookies) {
    var userService = {};
    var user = {};
    var userCookie = "_scuser";

    /**
     * [initUser description]
     *
     * @return {[type]} [description]
     */
    userService.initUser = function() {
        var user = {
            name: "",
            age: "",
            id: "",
            email: "",
            loggedIn: false,
            userName: "",
            password: "",
            message: ""      
        }

        return user;
    };

    /**
     * [login description]
     *
     * @param {[type]} userName [description]
     * @param {[type]} password [description]
     *
     * @return {[type]} [description]
     */
    userService.login = function(userName, password) {
        $http.post("https://sweng500api.saltosk.com/api/1/user/login/", {userName: userName, password: password})
            .success(function(data) {
                if (data.status == "ok") {
                    $cookieObject = {
                        id: data.userID
                    };

                    $cookies.putObject(userCookie, $cookieObject);
                    userService.updateUserFromCookie(userCookie);
                    userService.setLogin(true);
                }
                user.message = data.message;
            })
            .error(function(err) {
                user.message = err.message;
            });
    };
    /**
     * [logout description]
     *
     * @return {[type]} [description]
     */
    userService.logout = function() {
        $cookies.remove(userCookie);
        userService.setLogin(false);
        user = userService.initUser();
    };

    /**
     * [getInfo description]
     *
     * @param {[type]} id [description]
     *
     * @return {[type]} [description]
     */
    userService.getInfo = function(id) {
        return $http.get("https://sweng500api.saltosk.com/api/1/user/" + id)
            .success(function(data) {
                return data;
            })  
            .error(function(err) {
                return err;
            });
    };
    
    /**
     * [isLoggedIn description]
     *
     * @return {Boolean} [description]
     */
    userService.isLoggedIn = function() {
        return user.loggedIn;
    };

    /**
     * [setLogin description]
     *
     * @param {[type]} data [description]
     */
    userService.setLogin = function(data) {
        user.loggedIn = data;
    };

    /**
     * [updateUser description]
     *
     * @param {[type]} newUser [description]
     *
     * @return {[type]} [description]
     */
    userService.updateUser = function(newUser) {
        user = newUser;
    };

    /**
     * [getUser description]
     *
     * @return {[type]} [description]
     */
    userService.getUser = function() {
        return user;
    };

    /**
     * [updateUserFromCookie description]
     *
     * @param {[type]} cookieName [description]
     *
     * @return {[type]} [description]
     */
    userService.updateUserFromCookie = function(cookieName) {
        if (typeof($cookies.get(cookieName)) !== "undefined") {
            user.id = $cookies.getObject(cookieName).id;
            userService.getInfo(user.id).success(function(data) {
                user.name = data.user.name;
                user.email = data.user.email;
            });

            userService.setLogin(true);
        } else {
            user = userService.initUser();
        }
    };

    user = userService.initUser();

    return userService;
}]);