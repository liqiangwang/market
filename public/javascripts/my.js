var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies', 'angularGrid', 'ngDialog']);

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
        .when('/saved', {
            templateUrl: 'pages/my/saved.html',
            controller: 'SavedController'
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
        .when('/auctionsSaved', {
            templateUrl: 'pages/my/auctionsSaved.html',
            controller: 'SavedController'
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
        //.otherwise({
        //    // when all else fails
        //    templateUrl: 'pages/routeNotFound.html',
        //    controller: 'NotFoundController'
    //});
       .otherwise({
           templateUrl: 'pages/my/profile.html',
           controller: 'ProfileController'
       });
});

// Set default values for all dialogs
//app.config(['ngDialogProvider', function (ngDialogProvider) {
//    ngDialogProvider.setDefaults({
//        className: 'ngdialog-theme-default',
//        plain: false,
//        showClose: true,
//        closeByDocument: true,
//        closeByEscape: true,
//        appendTo: false,
//        preCloseCallback: function () {
//            console.log('default pre-close callback');
//        }
//    });
//}]);

// services
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

app.factory('User', ['$resource', function ($resource) {
    return $resource('/api/users/:id', null, {
        'update': { method: 'PUT' }
    });
}])


app.controller('SavedController', function ($scope) {

});


app.controller('NotFoundController', function ($scope, $location) {
    $scope.message = 'There seems to be a problem finding the page you wanted';
    $scope.attemptedPath = $location.path();
});

app.controller('UserController', function ($scope, $cookieStore, $window, $rootScope, $location) {
    $scope.init = function (target) {
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

        $('.nav li a[href="#' + $location.url().substr(1) + '"]').parent().addClass('active');
        $('.nav li a').on('click', function () {
            $(this).parent().parent().find('.active').removeClass('active');
            $(this).parent().addClass('active');
        });
    }

    $scope.logout = function () {
        $scope.isLogin = false;
        $scope.user = null;
        $cookieStore.remove('user');
    }

})

