app.controller('SheetController', ['$scope', '$rootScope', '$location', '$routeParams', 'AssetSheet', function ($scope, $rootScope, $location, $routeParams, AssetSheet) {
    $scope.id = $routeParams.id;
    $scope.payMethods = _dicts.payMethod;
    $scope.cleanUpMethods = _dicts.cleanUpMethod;
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
            { headerName: "类别", field: "category", width: 100, template: '<select ng-options="key as value for (key, value) in assetCategory" ng-model="data.category" style="width:100%;"></select>' },
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
                    for (var i = 0; i < 10; i++) {
                        $scope.sheet.assets.push({});
                    }
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

                    for (var i = data.assets.length; i < 10; i++) {
                        data.assets.push({});
                    }

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
                if (value && value.category) { sheet.assets.push(value); }
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