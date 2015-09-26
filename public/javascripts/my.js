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
        .when('/offers', {
            templateUrl: 'pages/my/offers.html',
            controller: 'offersController'
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


// controllers
app.controller('sheetsController', ['$scope', '$rootScope', 'AssetSheet', function ($scope, $rootScope, AssetSheet) {
    $scope.init = function () {
        $scope.query();
    }

    $scope.query = function () {
        var columnDefs = [
            { headerName: "名称", field: "name" },
            { headerName: "计划交割时间", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", field: "planningDeliveryAddress" },
            { headerName: "付款方式", field: "payMethodText" },
            { headerName: "成交规则", field: "dealRuleText" },
            { headerName: "要求从业资格证书", field: "requireCertificate", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            //{ headerName: "总价格", field: "totalPrice", template: "{{data.totalPrice|currency:'￥'}}", cellStyle: { "text-align": "right" } },
            { headerName: "需要数据销毁服务", field: "needDataCleanup", template: '<span ng-show="data.needDataCleanup" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "状态", field: "statusText" },
            { headerName: "", template: "<a href='#/sheet/{{data._id}}' ng-show='!data.status || (data.status == 1) || (data.status == 4)'>修改</a>", cellStyle: { "text-align": "center" }, width: 50, suppressSizeToFit: true }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            //enableFilter: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };

        AssetSheet.query(
            { createdById: $rootScope.user._id },
            function (data) {   // TODO error handling of query()

                $scope.hasAssetSheet = data.length > 0;
                if ($scope.hasAssetSheet) {
                    _dicts.translate(data, ['payMethod', 'dealRule', 'status'], ['payMethod', 'dealRule', 'sheetStatus']);
                    $scope.gridOptions.rowData = data;
                    $scope.gridOptions.api.onNewRows();
                }
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });
    }
}]);

app.controller('sheetController', ['$scope', '$rootScope', '$location', '$routeParams', 'AssetSheet', function ($scope, $rootScope, $location, $routeParams, AssetSheet) {
    $scope.id = $routeParams.id;
    $scope.payMethods = _dicts.payMethod;
    $scope.dealRules = _dicts.dealRule;
    $scope.assetCategory = _dicts.assetCategory
    $scope.sheet = { assets: [] };

    // Add 10 empty rows
    if (!$scope.id) {
        for (var i = 0; i < 10; i++) {
            $scope.sheet.assets.push({});
        }
    }

    function cellValueChanged(cell) {
        var row = $scope.gridOptions.rowData[cell.rowIndex];
        row.subTotalprice = row.number * row.unitPrice || 0;

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
            { headerName: "数量", field: "number", width: 100, editable: true }  // , cellValueChanged: cellValueChanged
            //{ headerName: "单价", field: "unitPrice", width: 100, editable: true, cellValueChanged: cellValueChanged },
            //{ headerName: "小计", field: "subTotalprice", width: 100, volatile: true }
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

                    for (var i = data.assets.length - 1; i >= 0; i--) {
                        if (data.assets[i] == null) {
                            data.assets.splice(i, 1);
                        }
                    }

                    data.assets.push({});
                    //for (var i = 0; i < data.assets.length; i++) {
                    //    if (!data.assets[i]) {
                    //        data.assets[i] = {};
                    //    }
                    //}
                    $scope.gridOptions.rowData = data.assets;
                    $scope.gridOptions.api.onNewRows();
                    total();
                },
                function (response) { // error case
                    _helper.showHttpError(response);
                });
        }
    }

    $scope.save = function (status) {
        var sheet = angular.copy($scope.sheet);
        sheet.status = status;
        sheet.createdById = $rootScope.user._id;
        sheet.assets = [];
        $scope.sheet.assets.forEach(
            function (value, index) {
                if (value) { sheet.assets.push(value); }
            })

        if ($scope.id) {
            AssetSheet.update(
                { id: $scope.id },
                sheet,
                function () {
                    $location.url('/saved');
                },
                function (response) { // error case
                    _helper.showHttpError(response);
                });
        }
        else {
            var assetSheet = new AssetSheet(sheet);
            assetSheet.$save(
                  function () {
                      $location.url('/saved');
                  },
                  function (response) { // error case
                      _helper.showHttpError(response);
                  });
        }
    }

}]);

app.controller('offersController', ['$scope', '$rootScope', '$routeParams', '$location', 'AssetSheet', 'Offer', function ($scope, $rootScope, $routeParams, $location, AssetSheet, Offer) {
    $scope.init = function () {
        $scope.query();
    }

    function getAssetSheets(sheedIds) {
        AssetSheet.query(
            {
                _id: { $in: sheedIds }
                // Add suport for nested params https://github.com/angular/angular.js/pull/1640
                // http://stackoverflow.com/questions/18588604/nested-parameters-in-angular-query
            },
            function (data) {
                _dicts.translate(data, ['payMethod', 'dealRule', 'status'], ['payMethod', 'dealRule', 'sheetStatus']);
                $scope.offers.forEach(
                    function (value, index) {
                        var matched = $.grep(data, function (value2, index2) { return value2._id == value.sheetId; })[0];
                        if (matched) {
                            value.sheet = matched;
                        }
                    });
                $scope.gridOptions.rowData = $scope.offers;
                $scope.gridOptions.api.onNewRows();
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });
    }

    $scope.query = function () {
        var columnDefs = [
            { headerName: "名称", template: "{{data.sheet.name}}" },
            { headerName: "计划交割时间", template: "{{data.sheet.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", template: "{{data.sheet.planningDeliveryAddress}}" },
            { headerName: "付款方式", template: "{{data.sheet.payMethodText}}" },
            { headerName: "成交规则", template: "{{sheet.dealRuleText}}" },
            { headerName: "要求从业资格证书", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "总价格", template: "{{data.price|currency:'￥'}}", cellStyle: { "text-align": "right" } },
            { headerName: "状态", template: "{{data.sheet.statusText}}" },
            { headerName: "报价时间", field: "updatedAt" }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            //enableFilter: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };

        Offer.query(
            { createdById: $rootScope.user._id },
            function (data) {
                $scope.hasOffer = data.length > 0;
                if ($scope.hasOffer) {
                    $scope.offers = data;
                    var sheedIds = [];
                    data.forEach(function (value, index) {
                        if (value && value.sheetId && sheedIds.indexOf(value.sheetId) < 0) {
                            sheedIds.push(value.sheetId);
                        }
                    });
                    getAssetSheets(sheedIds)
                }
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });


    }
}]);

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