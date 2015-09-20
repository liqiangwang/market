var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies', 'angularGrid']);

// routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/sheets', {
            templateUrl: 'pages/my/sheets.html',
            controller: 'sheetsController'
        })
        .when('/sheet', {
            templateUrl: 'pages/my/sheet.html',
            controller: 'sheetController'
        })
        .when('/sheet/:id', {
            templateUrl: 'pages/my/sheet.html',
            controller: 'sheetController'
        })
        .when('/offer', {
            templateUrl: 'pages/my/offer.html',
            controller: 'offerController'
        })
        .when('/activeOrder', {
            templateUrl: 'pages/my/activeOrder.html',
            controller: 'activeOrderController'
        })
        .when('/completedOrder', {
            templateUrl: 'pages/my/completedOrder.html',
            controller: 'completedOrderController'
        })
        .when('/profile', {
            templateUrl: 'pages/my/profile.html',
            controller: 'profileController'
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

// controllers
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
            { headerName: "要求从业资格证书", field: "price" },
            { headerName: "总价格", field: "price", width: 100 },
            { headerName: "", template: "<a href='#/sheet/{{data._id}}'>修改</a>", width: 40 }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: true,
            enableColResize: true
        };

        AssetSheet.query(
            { createdbyid: $rootScope.user._id },
            function (data) {   // TODO error handling of query()
                $scope.hasAssetSheet = data.length > 0;
                if ($scope.hasAssetSheet) {
                    $scope.gridOptions.rowData = data;
                    $scope.gridOptions.api.onNewRows();
                }
            });
    }
}]);

app.controller('sheetController', ['$scope', '$rootScope', '$location', '$routeParams', 'Asset', 'AssetSheet', function ($scope, $rootScope, $location, $routeParams, Asset, AssetSheet) {
    $scope.sheet = { assets: [{}] };
    $scope.id = $routeParams.id;
    $scope.payMethods = _dicts.payMethod;
    $scope.assetCategory = _dicts.assetCategory

    function cellValueChanged(cell) {
        var row = $scope.gridOptions.rowData[cell.rowIndex];
        row.subTotalprice = row.number * row.unitPrice;

        $scope.gridOptions.api.softRefreshView();

        var result = 0;
        $scope.gridOptions.rowData.forEach(function (item) {
            if (item) {
                result += item['subTotalprice'] || 0;
            }
        });
        document.getElementById('calculatedTotalPrice').innerText = result;
        return $scope.sheet.calculatedTotalPrice = result;
    }

    $scope.init = function () {
        var columnDefs = [
            { headerName: "类别", field: "category", width: 100, template: '<select ng-options="key as value for (key, value) in assetCategory" ng-model="data.category"></select>' },
            { headerName: "品牌", field: "brand", width: 100, editable: true },
            { headerName: "型号", field: "serial", width: 100, editable: true },
            { headerName: "CPU", field: "cpu", width: 80, editable: true },
            { headerName: "内存", field: "memory", width: 80, editable: true },
            { headerName: "硬盘", field: "harddisk", width: 80, editable: true },
            { headerName: "其他配件", field: "other", width: 100, editable: true },
            { headerName: "状态", field: "working", width: 100, editable: true },
            { headerName: "数量", field: "number", width: 100, editable: true, cellValueChanged: cellValueChanged },
            { headerName: "单价", field: "unitPrice", width: 100, editable: true, cellValueChanged: cellValueChanged },
            { headerName: "小计", field: "subTotalprice", width: 100, volatile: true }
        ];

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: $scope.id ? null : $scope.sheet.assets,
            dontUseScrolls: true,
            enableColResize: true,
            angularCompileRows: true,
            cellFocused: function (params) {
                //console.log('Callback cellFocused: ' + params.rowIndex + " - " + params.colIndex);
                if (params.rowIndex == $scope.gridOptions.rowData.length - 1) {
                    $scope.gridOptions.rowData.push({});
                    $scope.gridOptions.api.onNewRows();
                }
            },
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };

        if ($scope.id) {
            AssetSheet.get(
                { id: $scope.id },
                function (data) {
                    $scope.sheet = data;
                    for (var i = 0; i < data.assets.length; i++) {
                        if (!data.assets[i]) {
                            data.assets[i] = {};
                        }
                    }
                    $scope.gridOptions.rowData = data.assets;
                    $scope.gridOptions.api.onNewRows();
                },
                function (response) { // error case
                    alert(response.data.errors);
                });
        }
    }

    $scope.save = function () {
        if ($scope.id) {
            AssetSheet.update(
                { id: $scope.id },
                $scope.sheet,
                function () {
                    $location.url('/saved');
                },
                function (response) { // error case
                    alert(response.data.errors);
                });
        }
        else {
            var assetSheet = new AssetSheet($scope.sheet);
            assetSheet.$save(
                  function () {
                      $location.url('/saved');
                  },
                  function (response) { // error case
                      alert(response.data.errors);
                  });
        }
    }
}]);

app.controller('offerController', function ($scope) {

});

app.controller('activeOrderController', function ($scope) {

});

app.controller('completedOrderController', function ($scope) {

});

app.controller('profileController', function ($scope) {

});

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