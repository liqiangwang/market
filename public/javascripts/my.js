var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies', 'angularGrid']);

// routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/sheets', {
            templateUrl: 'pages/my/sheets.html',
            controller: 'SheetsController'
        })
        .when('/sheet', {
            templateUrl: 'pages/my/sheet.html',
            controller: 'SheetController'
        })
        .when('/sheet/:id', {
            templateUrl: 'pages/my/sheet.html',
            controller: 'SheetController'
        })
        .when('/sheetView/:id', {
            templateUrl: 'pages/my/sheetView.html',
            controller: 'SheetViewController'
        })
        .when('/published', {
            templateUrl: 'pages/my/published.html',
            controller: 'PublishedController'
        })
        .when('/auctions', {
            templateUrl: 'pages/my/auctions.html',
            controller: 'AuctionsController'
        })
        .when('/deals', {
            templateUrl: 'pages/my/deals.html',
            controller: 'DealsController'
        })
        .when('/offers', {
            templateUrl: 'pages/my/offers.html',
            controller: 'OffersController'
        })
        .when('/profile', {
            templateUrl: 'pages/my/profile.html',
            controller: 'ProfileController'
        })
        .when('/saved', {
            templateUrl: 'pages/my/saved.html',
            controller: 'savedController'
        })
        .otherwise({
            // when all else fails
            templateUrl: 'pages/routeNotFound.html',
            controller: 'notFoundController'
        });
});

// services
app.factory('AssetSheet', ['$resource', function ($resource) {
    return $resource('/api/assetSheets/:id', null, {
        'update': { method: 'PUT' }
    });
}]);

app.factory('Offer', ['$resource', function ($resource) {
    return $resource('/api/Offers/:id', null, {
        'update': { method: 'PUT' }
    });
}]);



app.controller('savedController', function ($scope) {

});


app.controller('notFoundController', function ($scope, $location) {
    $scope.message = 'There seems to be a problem finding the page you wanted';
    $scope.attemptedPath = $location.path();
});

app.controller('UserController', function ($scope, $cookieStore, $window, $rootScope) {
    $scope.init = function () {
        var user = $cookieStore.get("user");
        if (user) {
            $scope.user = user;
            $rootScope.user = user;
            $scope.isLogin = true;
        }
        else {
            // redirect to index.html
            //$window.location.href = "index.html";
        }
    }
})