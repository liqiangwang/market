app.controller('SheetsController', ['$scope', '$rootScope', 'AssetSheet', function ($scope, $rootScope, AssetSheet) {
    $scope.init = function () {
        $scope.query();
    }

    $scope.query = function () {
        var columnDefs = [
            { headerName: "名称", field: "name", cellStyle: { "text-align": "center" } },
            { headerName: "计划交割时间", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}", cellStyle: { "text-align": "center" } },
            { headerName: "计划交割地点", field: "planningDeliveryAddress", cellStyle: { "text-align": "center" } },
            { headerName: "付款方式", field: "payMethodText", cellStyle: { "text-align": "center" } },
            { headerName: "成交规则", field: "dealRuleText", cellStyle: { "text-align": "center" } },
            { headerName: "要求从业资格证书", field: "requireCertificate", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            //{ headerName: "总价格", field: "totalPrice", template: "{{data.totalPrice|currency:'￥'}}", cellStyle: { "text-align": "right" } },
            { headerName: "需要数据销毁服务", field: "needDataCleanup", template: '<span ng-show="data.needDataCleanup" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "状态", field: "statusText", cellStyle: { "text-align": "center" } },
            { headerName: "", template: "<button class='btn btn-primary' ng-show='!data.status || (data.status == 1) || (data.status == 4) ng-click='save(2)'>发布</button>", cellStyle: { "text-align": "center" }, width: 80, suppressSizeToFit: true },
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
            {
                createdById: $rootScope.user._id,
                status: { $in: [null, 1, 4] }
            },
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

    $scope.save = function (status) {
        //$scope.sheetId = $this.rowIndex;
        //$scope.sheet = $scope.gridOptions.rowData[$scope.sheetId];
        $scope.sheet = this.data;
        var sheet = $scope.sheet;
        //var sheet = angular.copy($scope.sheet);
        sheet.status = status;
        sheet.createdById = $rootScope.user._id;

        AssetSheet.update(
                { id: sheet._id },
                sheet,
                //function () {
                //    $location.url('/saved');
                //},
                function (response) { // error case
                    _helper.showHttpError(response);
                });
        $scope.query();
    }
}]);