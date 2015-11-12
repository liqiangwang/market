var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies', 'angularGrid'])

// routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/index/sheets.html',
            controller: 'SheetsController'
        })
        .when('/saved', {
            templateUrl: 'pages/index/saved.html',
            controller: 'SavedController'
        })
        .when('/:id', {
            templateUrl: 'pages/index/sheet.html',
            controller: 'SheetController'
        })
        .when('/email', {
            templateUrl: 'pages/index/email.html',
            controller: 'MessageController'
        })
        .otherwise({
            // when all else fails
            templateUrl: 'pages/routeNotFound.html',
            controller: 'NotFoundController'
        });
});

// Services
app.factory('Users', ['$resource', function ($resource) {
    return $resource('/api/users/:id', null, {
        'update': { method: 'PUT' }
    });
}]);

app.factory("errors", function ($rootScope) {
    return {
        catch: function (message) {
            return function (reason) {
                $rootScope.addError({ message: message, reason: reason })
            };
        }
    };
});

app.factory('AssetSheet', ['$resource', function ($resource) {
    return $resource('/api/assetSheets/:id', null, {
        'update': { method: 'PUT' }
    });
}]);

app.factory('Offer', ['$resource', function ($resource) {
    return $resource('/api/offers/:id', null, {
        'update': { method: 'PUT' }
    });
}]);

app.factory('Message', ['$resource', function ($resource) {
    return $resource('/api/messages/:id', null, {
        'update': { method: 'PUT' }
    });
}]);


// Controllers
app.controller('UserController', ['$scope', 'Users', '$cookieStore', '$rootScope', '$route', '$window', function ($scope, Users, $cookieStore, $rootScope, $route, $window) {

    $scope.init = function () {
        var user = $cookieStore.get("user");
        if (user) {
            $scope.user = user;
            $rootScope.user = user;
            $scope.isLogin = true;
        }
    }

    $scope.register = function () {
        if (!$scope.alias || !$scope.password) return;
        var user = new Users({ alias: $scope.alias, password: $scope.password });

        user.$save(function () {
            $scope.user = user;
            $rootScope.user = user;
            $cookieStore.put("user", user);
            $window.location.reload();
        },
        function (error) {
            alert(error.statusText + '(' + error.status + ')\r\n\r\n' + error.data);
        });
    }

    $scope.login = function () {
        Users.query({ alias: $scope.alias, password: $scope.password}
            //Users.query({ alias: $scope.alias, password: $scope.password, status: $scope.status}
             , function (users) {
                 if (users.length == 0) {
                     //if (users.length == 0 || users[0].status !=1) {
                     $scope.loginFailed = true;
                 }
                 else if (users[0].status != 1)
                 {
                     $scope.userLocked = true;
                 }
                 else {
                     $scope.loginFailed = false;
                     $cookieStore.put("user", users[0]);
                     $scope.user = users[0];
                     //$rootScope.user = $scope.user;
                     //$route.reload(); //load content in ng-view page
                     $window.location.reload();
                 }
             }
             , function (error) {
                 alert(error.statusText + '(' + error.status + ')\r\n\r\n' + error.data);
             }
             );
    }

    $scope.logout = function () {
        $scope.isLogin = false;
        $scope.user = null;
        $cookieStore.remove('user');
    }

    $scope.show = function (show) {
        $scope.show = show;
    }
}]);



app.controller('SavedController', function ($scope) {

});

app.controller('MessageController', function ($scope) {

});

app.controller('NotFoundController', function ($scope, $location) {
    $scope.message = 'There seems to be a problem finding the page you wanted';
    $scope.attemptedPath = $location.path();
});
