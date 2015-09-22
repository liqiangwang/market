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
            { headerName: "名称", field: "name" },
            { headerName: "计划交割时间", field: "planningDeliveryTime", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", field: "planningDeliveryAddress" },
            { headerName: "付款方式", field: "payMethodText" },
            { headerName: "成交规则", field: "dealRuleText" },
            { headerName: "要求从业资格证书", field: "requireCertificate", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: {"text-align": "center"} },
            { headerName: "总价格", field: "totalPrice", cellStyle: {"text-align": "right"} },
            { headerName: "状态", field: "statusText" },
            { headerName: "", template: "<a href='#/sheet/{{data._id}}'>修改</a>", width:50, cellStyle: {"text-align": "center"}, suppressSizeToFit: true }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };

        AssetSheet.query(
            { createdbyid: $rootScope.user._id },
            function (data) {   // TODO error handling of query()

                $scope.hasAssetSheet = data.length > 0;
                if ($scope.hasAssetSheet) {
                    _dicts.translate(data, ['payMethod', 'dealRule', 'status'], ['payMethod', 'dealRule', 'sheetStatus']);
                    $scope.gridOptions.rowData = data;
                    $scope.gridOptions.api.onNewRows();
                }
            },
            function (response) { // error case
                alert(response.data.errors);
            });
    }
}]);

app.controller('sheetController', ['$scope', '$rootScope', '$location', '$routeParams', 'Asset', 'AssetSheet', function ($scope, $rootScope, $location, $routeParams, Asset, AssetSheet) {
    $scope.sheet = { assets: [{}] };
    $scope.id = $routeParams.id;
    $scope.payMethods = _dicts.payMethod;
    $scope.dealRules = _dicts.dealRule;
    $scope.assetCategory = _dicts.assetCategory

    function cellValueChanged(cell) {
        var row = $scope.gridOptions.rowData[cell.rowIndex];
        row.subTotalprice = row.number * row.unitPrice;

        $scope.gridOptions.api.softRefreshView();

        total();
    }

    function total() {
        var result = 0;
        $scope.gridOptions.rowData.forEach(function (item) {
            if (item) {
                result += item['subTotalprice'] || 0;
            }
        });
        $scope.sheet.totalPrice = result;

        if (!$scope.$$phase) {
            $scope.$apply();    // http://www.jeffryhouser.com/index.cfm/2014/6/2/How-do-I-run-code-when-a-variable-changes-with-AngularJS
        }
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
            dontUseScrolls: false,
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
                    $scope.sheet.planningDeliveryTime && ($scope.sheet.planningDeliveryTime = new Date($scope.sheet.planningDeliveryTime));
                    for (var i = 0; i < data.assets.length; i++) {
                        if (!data.assets[i]) {
                            data.assets[i] = {};
                        }
                    }
                    $scope.gridOptions.rowData = data.assets;
                    $scope.gridOptions.api.onNewRows();
                    total();
                },
                function (response) { // error case
                    alert(response.data.errors);
                });
        }
    }

    $scope.save = function (status) {
        $scope.sheet.status = status;
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