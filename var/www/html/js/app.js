var app = angular.module("SocialClassified", ["ngRoute", "ngCookies"]);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            controller: "User",
            templateUrl: "views/home.html"
        })
        .when("/login/", {
            controller: "User",
            templateUrl: "views/login.html"
        })
        .when("/register/", {
            controller: "User",
            templateUrl: "views/register.html"
        })
        .when("/user/", {
            controller: "User",
            templateUrl: "views/profile.html"
        })
        .otherwise({
            redirectTo: "/"
        });

    $locationProvider.html5Mode(true);
});