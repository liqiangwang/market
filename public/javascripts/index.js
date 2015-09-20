var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies', 'angularGrid'])

// routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/index/sheets.html',
            controller: 'sheetsController'
        })

        .when('/:id', {
            templateUrl: 'pages/index/sheet.html',
            controller: 'sheetController'
        })
        .otherwise({
            // when all else fails
            templateUrl: 'pages/routeNotFound.html',
            controller: 'notFoundController'
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

app.factory('Asset', ['$resource', function ($resource) {
    return $resource('/api/assets/:id', null, {
        'update': { method: 'PUT' }
    });
}]);

app.factory('AssetSheet', ['$resource', function ($resource) {
    return $resource('/api/assetSheets/:id', null, {
        'update': { method: 'PUT' }
    });
}]);


// Controllers
app.controller('UserController', ['$scope', 'Users', '$cookieStore', '$rootScope', function ($scope, Users, $cookieStore, $rootScope) {

    $scope.init = function () {
        var user = $cookieStore.get("user");
        if (user) {
            $scope.user = user;
            $rootScope.user = user;
        }
    }

    $scope.register = function () {
        if (!$scope.alias || !$scope.password) return;
        var user = new Users({ alias: $scope.alias, password: $scope.password });

        user.$save(function () {
            $scope.user = user;
            $rootScope.user = user;
            $cookieStore.put("user", user);
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
                     $rootScope.user = $scope.user;
                 }
             }
             , function (error) {
                 alert(error.statusText + '(' + error.status + ')\r\n\r\n' + error.data);
             }
             );
    }

    $scope.show = function (show) {
        $scope.show = show;
    }
}]);

app.controller('sheetsController', ['$scope', '$rootScope', 'Asset', 'AssetSheet', function ($scope, $rootScope, Asset, AssetSheet) {

    $scope.init = function () {
        $scope.query();
    }

    $scope.query = function () {
        var columnDefs = [
            { headerName: "名称", field: "name", width: 100 },
            { headerName: "计划交割时间", field: "planningDeliveryTime", width: 100, template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", field: "planningDeliveryAddress", width: 100 },
            { headerName: "付款方式", field: "make", width: 100 },
            { headerName: "成交规则", field: "model", width: 100 },
            { headerName: "要求从业资格证书", field: "price", width: 100 },
            { headerName: "总价格", field: "price", width: 100 },
            { headerName: "", template: "<a href='#/{{data._id}}'>详细信息</a>", width: 80 },
            { headerName: "", template: "<a href=''>竞价</a>", width: 80 }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: true,
            enableColResize: true
            //rowClicked: function (params) {
            //}
        };

        AssetSheet.query(
            {},
            function (data) {   // TODO error handling of query()
                $scope.hasAssetSheet = data.length > 0;
                if ($scope.hasAssetSheet) {
                    $scope.gridOptions.rowData = data;
                    $scope.gridOptions.api.onNewRows();
                }
            });
    }
}]);

app.controller('sheetController', ['$scope', '$rootScope', '$routeParams', 'Asset', 'AssetSheet', function ($scope, $rootScope, $routeParams, Asset, AssetSheet) {
    $scope.id = $routeParams.id;

    $scope.init = function () {
        var columnDefs = [
            { headerName: "类别", field: "categoryText", width: 100 },
            { headerName: "品牌", field: "brand", width: 100 },
            { headerName: "型号", field: "serial", width: 100},
            { headerName: "CPU", field: "cpu", width: 80 },
            { headerName: "内存", field: "memory", width: 80},
            { headerName: "硬盘", field: "harddisk", width: 80 },
            { headerName: "其他配件", field: "other", width: 100},
            { headerName: "状态", field: "working", width: 100 },
            { headerName: "数量", field: "number", width: 100 },
            { headerName: "单价", field: "unitPrice", width: 100},
            { headerName: "小计", field: "subTotalprice", width: 100 }
        ];

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: true,
            enableColResize: true
        };

        if ($scope.id) {
            AssetSheet.get(
                { id: $scope.id },
                function (data) {
                    _dicts.translate(data.assets, 'category', 'assetCategory');
                    $scope.sheet = data;
                    $scope.gridOptions.rowData = data.assets;
                    $scope.gridOptions.api.onNewRows();
                },
                function (response) { // error case
                    alert(response.data.errors);
                });
        }
    };

    $scope.save = function () {

    };
}]);

app.controller('notFoundController', function ($scope, $location) {
    $scope.message = 'There seems to be a problem finding the page you wanted';
    $scope.attemptedPath = $location.path();
});
