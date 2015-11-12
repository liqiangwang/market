var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/userManage', {
            templateUrl: 'pages/admin/userManage.html',
            controller: 'userManageController'
        })
        .when('/assetSheetManage', {
            templateUrl: 'pages/admin/assetSheetManage.html',
            controller: 'assetSheetManageController'
        })
        .when('/offerManage', {
            templateUrl: 'pages/admin/offerManage.html',
            controller: 'offerManageController'
        })
        .when('/orderManage', {
            templateUrl: 'pages/admin/orderManage.html',
            controller: 'orderManageController'
        })
        .when('/orders/:id', {
            templateUrl: 'pages/admin/orderDetail.html',
            controller: 'orderDetailController'
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
         .when('/users/:id', {
              templateUrl: 'pages/admin/userInfo.html',
              controller: 'userManageController'
          })
        //.otherwise({
        //    // when all else fails
        //    templateUrl: 'pages/routeNotFound.html',
        //    controller: 'notFoundController'
    //});;
        .otherwise({
            templateUrl: 'pages/admin/userManage.html',
            controller: 'userManageController'
        })
});

app.controller('UserController', ['$scope', 'Users', '$cookieStore', '$rootScope', '$route', '$window', function ($scope, Users, $cookieStore, $rootScope, $route, $window) {
    $scope.init = function () {
        var user = $cookieStore.get("user");
        if (user.isAdmin == 1) {
            $scope.user = user;
            $rootScope.user = user;
            $scope.isLogin = true;
        }
        else {
            // redirect to index.html
            //$window.location.href = "index.html";
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
        Users.query({ alias: $scope.alias, password: $scope.password }
             , function (users) {
                 if (users.length == 0) {
                     $scope.loginFailed = true;
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

app.factory('Users', ['$resource', function ($resource) {
    return $resource('/api/users/:id', null, {
        'update': { method: 'PUT' }
    });
}])

app.controller('userManageController', ['$scope', '$routeParams', 'Users', 'AssetSheets', 'Offers', function ($scope, $routeParams, Users, AssetSheets, Offers) {
    var condition = null;
    if ($routeParams.id) {
        condition = { _id: $routeParams.id };
    }
    $scope.users = Users.query(condition, function (data) {
        $scope.users.forEach(function (value, index) {
            $scope.users[index].statusCode = $scope.users[index].status;
            _dicts.translateOne($scope.users[index], 'status', 'userStatus');
            if (condition != null) {
                $scope.assetSheets = AssetSheets.query({ createdById: $scope.users[index]._id}, function (data) {
                    for (i = 0; i < $scope.assetSheets.length; ++i) {
                        var uid = $scope.assetSheets[i].createdById;
                        $scope.assetSheets[i].statusCode = $scope.assetSheets[i].status;
                        _dicts.translateOne($scope.assetSheets[i], 'status', 'sheetStatus');
                        _dicts.translateOne($scope.assetSheets[i], 'payMethod', 'payMethod');
                        _dicts.translateOne($scope.assetSheets[i], 'dealRule', 'dealRule');
                    }
                });

                $scope.offers = Offers.query({ createdById: $scope.users[index]._id}, function (data) {
                    for (i = 0; i < $scope.offers.length; ++i) {
                        var sid = $scope.offers[i].sheetId;
                        $scope.offers[i].assetSheet = AssetSheets.query({ _id: sid }, function (assets) {
                            assets.forEach(function (value, index) {
                                value.user = Users.query({ _id: value.createdById });
                            })
                        });
                        var uid = $scope.offers[i].createdById;
                        $scope.offers[i].user = Users.query({ _id: uid });
                        _dicts.translateOne($scope.offers[i], 'status', 'offerStatus');
                    }
                });
            }
        });
    });

    $scope.EnableUser = function ($uid, $index) {
        var user = new Users({ status: 1 });
        Users.update({ id: $uid }, user);
        var condition = null;
        if ($routeParams.id) {
            condition = { _id: $routeParams.id };
        }
        $scope.users = Users.query(condition, function (data) {
            $scope.users.forEach(function (value, index) {
                $scope.users[index].statusCode = $scope.users[index].status;
                _dicts.translateOne($scope.users[index], 'status', 'userStatus');
            });
        });
    };

    $scope.LockUser = function ($uid, $index) {
        var user = new Users({ status: 2 });
        Users.update({ id: $uid }, user);
        var condition = null;
        if ($routeParams.id) {
            condition = { _id: $routeParams.id };
        }
        $scope.users = Users.query(condition, function (data) {
            $scope.users.forEach(function (value, index) {
                $scope.users[index].statusCode = $scope.users[index].status;
                _dicts.translateOne($scope.users[index], 'status', 'userStatus');
            });
        });
    }
}])

app.factory('AssetSheets', ['$resource', function ($resource) {
    return $resource('/api/assetSheets/:id', null, {
        'update': { method: 'PUT' }
    });
}])

app.controller('assetSheetManageController', ['$scope', 'Users', 'AssetSheets', function ($scope, Users, AssetSheets) {
    $scope.assetSheets = AssetSheets.query(null, function (data) {
        for (i = 0; i < $scope.assetSheets.length; ++i) {
            var uid = $scope.assetSheets[i].createdById;
            $scope.assetSheets[i].user = Users.query({ _id: uid });
            $scope.assetSheets[i].statusCode = $scope.assetSheets[i].status;
            _dicts.translateOne($scope.assetSheets[i], 'status', 'sheetStatus');
            _dicts.translateOne($scope.assetSheets[i], 'payMethod', 'payMethod');
            _dicts.translateOne($scope.assetSheets[i], 'dealRule', 'dealRule');
        }
    });

    $scope.RejectAssetSheet = function ($aid) {
        var assetSheet = new AssetSheets({ status: 4 });
        AssetSheets.update({ id: $aid }, assetSheet);
        $scope.assetSheets = AssetSheets.query(null, function (data) {
            for (i = 0; i < $scope.assetSheets.length; ++i) {
                var uid = $scope.assetSheets[i].createdById;
                $scope.assetSheets[i].user = Users.query({ _id: uid });
                $scope.assetSheets[i].statusCode = $scope.assetSheets[i].status;
                _dicts.translateOne($scope.assetSheets[i], 'status', 'sheetStatus');
                _dicts.translateOne($scope.assetSheets[i], 'payMethod', 'payMethod');
                _dicts.translateOne($scope.assetSheets[i], 'dealRule', 'dealRule');
            }
        });
    }

    $scope.AcceptAssetSheet = function ($aid) {
        var assetSheet = new AssetSheets({ status: 3 });
        AssetSheets.update({ id: $aid }, assetSheet);
        $scope.assetSheets = AssetSheets.query(null, function (data) {
            for (i = 0; i < $scope.assetSheets.length; ++i) {
                var uid = $scope.assetSheets[i].createdById;
                $scope.assetSheets[i].user = Users.query({ _id: uid });
                $scope.assetSheets[i].statusCode = $scope.assetSheets[i].status;
                _dicts.translateOne($scope.assetSheets[i], 'status', 'sheetStatus');
                _dicts.translateOne($scope.assetSheets[i], 'payMethod', 'payMethod');
                _dicts.translateOne($scope.assetSheets[i], 'dealRule', 'dealRule');
            }
        });
    }
}])

app.controller('assetSheetDetailController', ['$scope', '$routeParams', 'AssetSheets', 'Users', '$location', function ($scope, $routeParams, AssetSheets, Users, $location) {
    $scope.assetSheet = AssetSheets.get({ id: $routeParams.id }, function (data) {
        $scope.assetSheet.assets.forEach(function (value, index) {
            _dicts.translateOne($scope.assetSheet.assets[index], 'category', 'assetCategory');
        });
        _dicts.translateOne($scope.assetSheet, 'payMethod', 'payMethod');
        _dicts.translateOne($scope.assetSheet, 'dealRule', 'dealRule');
        _dicts.translateOne($scope.assetSheet, 'payMethod', 'payMethod');
        _dicts.translateOne($scope.assetSheet, 'cleanUpMethod', 'cleanUpMethod');

        var uid = $scope.assetSheet.createdById;
        $scope.assetSheet.user = Users.query({ _id: uid });
    });
}])

app.factory('Offers', ['$resource', function ($resource) {
    return $resource('/api/offers/:id', null, {
        'update': { method: 'PUT' }
    });
}])

app.controller('offerManageController', ['$scope', 'Users', 'AssetSheets', 'Offers', function ($scope, Users, AssetSheets, Offers) {
    $scope.offers = Offers.query(null, function (data) {
        for (i = 0; i < $scope.offers.length; ++i) {
            var sid = $scope.offers[i].sheetId;
            $scope.offers[i].assetSheet = AssetSheets.query({ _id: sid }, function (assets) {
                assets.forEach(function (value, index) {
                    value.user = Users.query({ _id: value.createdById });
                })
            });
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

app.controller('offerDetailController', ['$scope', 'AssetSheets', '$routeParams', 'Offers', '$location', function ($scope, AssetSheets, $routeParams, Offers, $location) {
    $scope.offer = Offers.query({ _id: $routeParams.id }, function (data) {
        var sid = data[0].sheetId;
        $scope.offer.assetss = AssetSheets.query({ _id: sid }, function (data) {
            $scope.offer.assetss[0].assets.forEach(function (value, index) {
                _dicts.translateOne($scope.offer.assetss[0].assets[index], 'category', 'assetCategory');
            });
        });
    });
}])

app.controller('offerItemDetailController', ['$scope', '$routeParams', 'Offers', '$location', function ($scope, $routeParams, Offers, $location) {
    $scope.offers = Offers.query({ _id: $routeParams.id });
}])

app.factory('Offers', ['$resource', function ($resource) {
    return $resource('/api/offers/:id', null, {
        'update': { method: 'PUT' }
    });
}])

app.controller('orderManageController', ['$scope', 'Users', 'AssetSheets', 'Offers', function ($scope, Users, AssetSheets, Offers) {
    $scope.tickets = Offers.query({ status: 2 }, function (data) {
        $scope.sendEmail = false;
        $scope.sendEmailSuccessfull = false;
        for (i = 0; i < $scope.tickets.length; ++i) {
            var sid = $scope.tickets[i].sheetId;
            $scope.tickets[i].assetSheet = AssetSheets.query({ _id: sid }, function (assets) {
                assets.forEach(function (value, index) {
                    value.user = Users.query({ _id: value.createdById });
                    _dicts.translateOne(value, 'payMethod', 'payMethod');
                    _dicts.translateOne(value, 'dealRule', 'dealRule');
                    _dicts.translateOne(value, 'cleanUpMethod', 'cleanUpMethod');
                })
            });
            var uid = $scope.tickets[i].createdById;
            $scope.tickets[i].buyer = Users.query({ _id: uid });
            _dicts.translateOne($scope.tickets[i], 'status', 'offerStatus');
        }
    });
}]);

app.controller('orderDetailController', ['$scope', '$routeParams', 'Users', 'AssetSheets', 'Offers', function ($scope, $routeParams, Users, AssetSheets, Offers) {
    $scope.offers = Offers.query({ _id: $routeParams.id }, function (data) {
        for (i = 0; i < $scope.offers.length; ++i) {
            var sid = $scope.offers[i].sheetId;
            $scope.offers[i].assetSheet = AssetSheets.query({ _id: sid }, function (assets) {
                assets[0].assets.forEach(function (value, index) {
                    _dicts.translateOne(value, 'category', 'assetCategory');
                });

                assets.forEach(function (value, index) {
                    value.user = Users.query({ _id: value.createdById });
                    _dicts.translateOne(value, 'payMethod', 'payMethod');
                    _dicts.translateOne(value, 'dealRule', 'dealRule');
                    _dicts.translateOne(value, 'cleanUpMethod', 'cleanUpMethod');
                })
            });
            var uid = $scope.offers[i].createdById;
            $scope.offers[i].buyer = Users.query({ _id: uid });
            _dicts.translateOne($scope.offers[i], 'status', 'offerStatus');
        }
    });

    //$scope.offers = Offers.query({ _id: $routeParams.id });
}]);