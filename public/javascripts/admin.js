var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/userManage', {
            templateUrl: 'pages/admin/userManage.html',
            controller: 'userManageController'
        })
        .when('/assetSheetManage', {
            templateUrl: 'pages/admin/assetManage.html',
            controller: 'assetSheetManageController'
        })
        .when('/offerManage', {
            templateUrl: 'pages/admin/offerManage.html',
            controller: 'offerManageController'
        })
        .when('/ticketManage', {
            templateUrl: 'pages/admin/ticketManage.html',
            controller: 'ticketManageController'
        })
        .when('/assetSheets/:id', {
            templateUrl: 'pages/admin/asset.html',
            controller: 'assetSheetDetailController'
        })
        .when('/offers/:id', {
            templateUrl: 'pages/admin/offerDetail.html',
            controller: 'offerDetailController'
        })
         .when('/offerItem/:id', {
             templateUrl: 'pages/admin/offerManage.html',
             controller: 'offerItemDetailController'
         })
        .otherwise({
            // when all else fails
            templateUrl: 'pages/routeNotFound.html',
            controller: 'notFoundController'
        });;
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

     .factory('Users', ['$resource', function ($resource) {
         return $resource('/api/users/:id', null, {
             'update': { method: 'PUT' }
         });
     }])

    .controller('userManageController', ['$scope', 'Users', function ($scope, Users) {
        $scope.users = Users.query(function (data) {
            $scope.users.forEach(function (value, index) {
                $scope.users[index].statusCode = $scope.users[index].status;
                _dicts.translateOne($scope.users[index], 'status', 'userStatus');
            });
        });

        $scope.DisableUser = function ($uid, $index) {
            var user = new Users({ status: 3 });
            Users.update({ id: $uid }, user);
            $scope.users = Users.query();
        }

        $scope.EnableUser = function ($uid, $index) {
            var user = new Users({ status: 1 });
            Users.update({ id: $uid }, user);
            $scope.users = Users.query();
            //$scope.users[$index].status = 1;
        }

        $scope.LockUser = function ($uid, $index) {
            var user = new Users({ status: 2 });
            Users.update({ id: $uid }, user);
            $scope.users = Users.query();
            //$scope.users[$index].status = 2;
        }
    }])

.factory('AssetSheets', ['$resource', function ($resource) {
    return $resource('/api/assetSheets/:id', null, {
        'update': { method: 'PUT' }
    });
}])

 .controller('assetSheetManageController', ['$scope', 'Users', 'AssetSheets', function ($scope, Users, AssetSheets) {
     $scope.assetSheets = AssetSheets.query(null, function (data) {
         for (i = 0; i < $scope.assetSheets.length; ++i) {
             var uid = $scope.assetSheets[i].createdById;
             $scope.assetSheets[i].user = Users.query({ _id: uid });
             $scope.assetSheets[i].statusCode = $scope.assetSheets[i].status;
             _dicts.translateOne($scope.assetSheets[i], 'status', 'sheetStatus');
         }
     });

     $scope.DisableAsset = function ($aid) {
         var asset = new Assets({ status: 4 });
         Assets.update({ id: $aid }, asset);
         $scope.assets = Assets.query();
     }

     $scope.EnableAsset = function ($aid) {
         var asset = new Assets({ status: 3 });
         Assets.update({ id: $aid }, asset);
         $scope.assets = Assets.query();
     }
 }])

 .controller('assetSheetDetailController', ['$scope', '$routeParams', 'AssetSheets', '$location', function ($scope, $routeParams, AssetSheets, $location) {
     $scope.assetSheet = AssetSheets.get({ id: $routeParams.id }, function (data) {
         $scope.assetSheet.assets.forEach(function (value, index) {
             _dicts.translateOne($scope.assetSheet.assets[index], 'category', 'assetCategory');
         });
     });
 }])

  .factory('Offers', ['$resource', function ($resource) {
      return $resource('/api/offers/:id', null, {
          'update': { method: 'PUT' }
      });
  }])

 .controller('offerManageController', ['$scope', 'Users', 'AssetSheets', 'Offers', function ($scope, Users, AssetSheets, Offers) {
     $scope.offers = Offers.query(null, function (data) {
         for (i = 0; i < $scope.offers.length; ++i) {
             var sid = $scope.offers[i].sheetId;
             $scope.offers[i].assetSheet = AssetSheets.query({ _id: sid });
             var uid = $scope.offers[i].createdById;
             $scope.offers[i].user = Users.query({ _id: uid });
             _dicts.translateOne($scope.offers[i], 'status', 'offerStatus');
         }
     });

     $scope.DisableBid = function ($offer) {
         var offer = new Offers({ status: 0 });
         Offers.update({ id: $offer }, offer);
         $scope.offers = Offers.query();
     }

     $scope.EnableBid = function ($offer) {
         var offer = new Offers({ status: 1 });
         Offers.update({ id: $offer }, offer);
         $scope.offers = Offers.query();
     }

 }])

.controller('offerDetailController', ['$scope', 'AssetSheets', '$routeParams', 'Offers', '$location', function ($scope, AssetSheets, $routeParams, Offers, $location) {
    $scope.offer = Offers.query({ _id: $routeParams.id }, function (data) {
        var sid = data[0].sheetId;
        $scope.offer.assetss = AssetSheets.query({ _id: sid }, function (data) {
            $scope.offer.assetss[0].assets.forEach(function (value, index) {
                _dicts.translateOne($scope.offer.assetss[0].assets[index], 'category', 'assetCategory');
            });
        });
    });
}])

.controller('offerItemDetailController', ['$scope', '$routeParams', 'Offers', '$location', function ($scope, $routeParams, Offers, $location) {
    $scope.offers = Offers.query({ _id: $routeParams.id });
}])

 .factory('Tickets', ['$resource', function ($resource) {
     return $resource('/api/tickets/:id', null, {
         'update': { method: 'PUT' }
     });
 }])

 .controller('ticketManageController', ['$scope', 'Tickets', function ($scope, Tickets) {
     $scope.closeTickets = Tickets.query({ status: 2 });
     $scope.pendingTickets = Tickets.query({ status: 1 });

     $scope.DisableTicket = function ($tid) {
         var ticket = new Tickets({ status: 2 });
         Tickets.update({ id: $tid }, ticket);
         $scope.closeTickets = Tickets.query({ status: 2 });
         $scope.pendingTickets = Tickets.query({ status: 1 });
     }

     $scope.EnableTicket = function ($tid) {
         var ticket = new Tickets({ status: 1 });
         Tickets.update({ id: $tid }, ticket);
         $scope.closeTickets = Tickets.query({ status: 2 });
         $scope.pendingTickets = Tickets.query({ status: 1 });
     }

 }])
