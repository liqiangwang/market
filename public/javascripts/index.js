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
            { headerName: "名称", field: "name" },
            { headerName: "计划交割时间", field: "planningDeliveryTime", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", field: "planningDeliveryAddress" },
            { headerName: "付款方式", field: "make" },
            { headerName: "成交规则", field: "model" },
            { headerName: "要求从业资格证书", field: "price" },
            { headerName: "总价格", field: "price" },
            { headerName: "", template: "<a href='#/{{data._id}}'>详细信息</a>" },
            { headerName: "", template: "<a href=''>竞价</a>" }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            //suppressHorizontalScroll: true,
            enableColResize: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
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
            { headerName: "类别", field: "categoryText" },
            { headerName: "品牌", field: "brand"},
            { headerName: "型号", field: "serial" },
            { headerName: "CPU", field: "cpu" },
            { headerName: "内存", field: "memory" },
            { headerName: "硬盘", field: "harddisk" },
            { headerName: "其他配件", field: "other" },
            { headerName: "状态", field: "working"},
            { headerName: "数量", field: "number"},
            { headerName: "单价", field: "unitPrice" },
            { headerName: "小计", field: "subTotalprice"},
            { headerName: "报价", field: "offer", template:"<input type='text'>" }
        ];

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
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
