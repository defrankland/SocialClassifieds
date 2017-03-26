app.directive("userInfo", function() {
    return {
        restrict: "E",
        scope: {
            user-info: "="
        },
        templateUrl: "templates/"
    }
});

app.directive("userMenu", function() {
    return {
        restrict: "E",
        scope: {
            user-menu: "="
        },
        templateUrl: "templates/user-menu.html"
    }
});