app.controller('SheetsController', ['$scope', '$rootScope', 'AssetSheet', function ($scope, $rootScope, AssetSheet) {
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