var app = angular.module('app', ['ngRoute', 'ngResource', 'ngCookies', 'angularGrid'])

// routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/index/sheets.html',
            controller: 'sheetsController'
        })
        .when('/saved', {
            templateUrl: 'pages/index/saved.html',
            controller: 'savedController'
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

    $scope.show = function (show) {
        $scope.show = show;
    }
}]);

app.controller('sheetsController', ['$scope', '$rootScope', 'AssetSheet', function ($scope, $rootScope, AssetSheet) {
    // use this to refresh the controller
    // pubsubService http://www.theroks.com/angularjs-communication-controllers/
    //$rootScope.$watch(
    //    'user',
    //    function (newValue, oldValue) {
    //        if (oldValue == null && newValue != null) {
    //            alert(JSON.stringify(newValue))
    //        }
    //        if (oldValue != null && newValue != null && oldValue.alias != newValue.alias) {
    //            alert(JSON.stringify(oldValue) + '' + JSON.stringify(newValue))
    //        }
    //    },
    //    true);

    $scope.init = function () {
        $scope.isLogin = $rootScope.user != null;
        $scope.query();
    }

    $scope.query = function () {
        var columnDefs = [
            { headerName: "名称", field: "name" },
            { headerName: "计划交割时间", field: "planningDeliveryTime", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", field: "planningDeliveryAddress" },
            { headerName: "付款方式", field: "payMethodText" },
            { headerName: "成交规则", field: "dealRuleText" },
            { headerName: "要求从业资格证书", field: "requireCertificate", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "总价格", template: "{{data.totalPrice|currency:'￥'}}", cellStyle: { "text-align": "right" }, hide: true },
            //{ headerName: "状态", field: "statusText" },
            { headerName: "", template: "<a href='#/{{data._id}}'>详细信息</a>", cellStyle: { "text-align": "center" }, width: 90, suppressSizeToFit: true },
            { headerName: "", template: "<a href='#/{{data._id}}'>竞价</a>", cellStyle: { "text-align": "center" }, width: 50, suppressSizeToFit: true, hide: !$scope.isLogin }
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

        var condition = { status: 3 };
        //if ($scope.isLogin) {
        //    condition.createdById = { $ne: $rootScope.user._id }
        //}
        AssetSheet.query(
            condition,
            function (data) {
                $scope.hasAssetSheet = data.length > 0;
                if ($scope.hasAssetSheet) {
                    _dicts.translate(data, ['payMethod', 'dealRule'], ['payMethod', 'dealRule']);
                    $scope.gridOptions.rowData = data;
                    $scope.gridOptions.api.onNewRows();
                }
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });
    }
}]);

app.controller('sheetController', ['$scope', '$rootScope', '$routeParams', '$location', 'AssetSheet', 'Offer', function ($scope, $rootScope, $routeParams, $location, AssetSheet, Offer) {
    $scope.id = $routeParams.id;
    $scope.isLogin = $rootScope.user != null;

    function cellValueChanged(cell) {
        var row = $scope.gridOptions.rowData[cell.rowIndex];
        row.offerSubTotalprice = row.number * row.offerUnitPrice || 0;

        $scope.gridOptions.api.softRefreshView();

        total();
    }

    function total() {
        var result = 0;
        $scope.gridOptions.rowData.forEach(function (item) {
            if (item) {
                result += item['offerSubTotalprice'] || 0;
            }
        });
        $scope.sheet.offerTotalPrice = result;

        if (!$scope.$$phase) {
            $scope.$apply();    // http://www.jeffryhouser.com/index.cfm/2014/6/2/How-do-I-run-code-when-a-variable-changes-with-AngularJS
        }
    }

    $scope.init = function () {
        var columnDefs = [
            { headerName: "类别", field: "categoryText" },
            { headerName: "品牌", field: "brand" },
            { headerName: "型号", field: "serial" },
            { headerName: "CPU", field: "cpu" },
            { headerName: "内存", field: "memory" },
            { headerName: "硬盘", field: "harddisk" },
            { headerName: "其他配件", field: "other" },
            { headerName: "状态", field: "working" },
            { headerName: "数量", field: "number" },
            { headerName: "单价", field: "unitPrice", hide: true },
            { headerName: "小计", field: "subTotalprice", hide: true },
            { headerName: "报价", field: "offerUnitPrice", editable: true, cellStyle: { "background-color": "yellow" }, cellValueChanged: cellValueChanged, hide: !$scope.isLogin },
            { headerName: "小计", field: "offerSubTotalprice", volatile: true, hide: !$scope.isLogin }
        ];

        function cellValueChangedFunction() {
            // after a value changes, get the volatile cells to update
            $scope.gridOptions.api.softRefreshView();
        }

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            angularCompileRows: true,
            //cellValueChanged: cellValueChangedFunction,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };

        if ($scope.id) {
            AssetSheet.get(
                { id: $scope.id },
                function (data) {
                    _dicts.translate(data.assets, 'category', 'assetCategory');

                    for (var i = data.assets.length - 1; i >= 0; i--) {
                        if (data.assets[i] == null) {
                            data.assets.splice(i, 1);
                        }
                    }

                    $scope.sheet = data;
                    $scope.gridOptions.rowData = data.assets;

                    if ($scope.isLogin) {
                        Offer.query(
                            { sheetId: $scope.sheet._id, createdById: $rootScope.user._id },
                            function (data) {
                                if (data.length > 0) {
                                    var offer = data[0];    // show latest
                                    for (var i = 0; i < $scope.sheet.assets.length && i < offer.assets.length; i++) {
                                        $scope.sheet.assets[i].offerUnitPrice = offer.assets[i].price;
                                        $scope.sheet.assets[i].offerSubTotalprice = $scope.sheet.assets[i].number * $scope.sheet.assets[i].offerUnitPrice || 0;
                                    }
                                }
                                $scope.gridOptions.api.onNewRows();
                                total();
                            },
                            function (response) { // error case
                                _helper.showHttpError(response);
                            });
                    }
                    else {
                        $scope.gridOptions.api.onNewRows();
                    }
                },
                function (response) { // error case
                    _helper.showHttpError(response);
                });
        }
    };

    $scope.save = function () {
        var offer = new Offer({ sheetId: $scope.sheet._id, price: $scope.sheet.offerTotalPrice, assets: [], createdById: $rootScope.user._id });
        $scope.sheet.assets.forEach(function (value, index) {
            if (value) {
                offer.assets.push({ _id: value._id, price: value.offerUnitPrice });
            }
        });

        if ($scope.offer) {
            Offer.update(
                { id: $scope.offer.id },
                $scope.sheet,
                function () {
                    $location.url('/saved');
                },
                function (response) { // error case
                    _helper.showHttpError(response);
                });
        }
        else {
            offer.$save(
                  function () {
                      $location.url('/saved');
                  },
                  function (response) { // error case
                      _helper.showHttpError(response);
                  });
        }
    };
}]);

app.controller('savedController', function ($scope) {

});

app.controller('notFoundController', function ($scope, $location) {
    $scope.message = 'There seems to be a problem finding the page you wanted';
    $scope.attemptedPath = $location.path();
});
