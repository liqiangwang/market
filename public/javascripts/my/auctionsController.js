app.controller('AuctionsController', ['$scope', '$rootScope', 'AssetSheet', 'Offer', function ($scope, $rootScope, AssetSheet, Offer) {
    $scope.init = function () {
        $scope.query();
    }

    $scope.query = function () {
        showAssetSheets();
        createOfferTable();
    }

    function showAssetSheets() {
        var columnDefs = [
            { headerName: "名称", field: "name" },
            { headerName: "计划交割时间", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}" },
            { headerName: "计划交割地点", field: "planningDeliveryAddress" },
            { headerName: "付款方式", field: "payMethodText" },
            { headerName: "成交规则", field: "dealRuleText" },
            { headerName: "要求从业资格证书", field: "requireCertificate", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            //{ headerName: "总价格", field: "totalPrice", template: "{{data.totalPrice|currency:'￥'}}", cellStyle: { "text-align": "right" } },
            { headerName: "需要数据销毁服务", field: "needDataCleanup", template: '<span ng-show="data.needDataCleanup" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "状态", field: "statusText" }
            //{ headerName: "", template: "<a href='#/sheet/{{data._id}}' ng-show='!data.status || (data.status == 1) || (data.status == 4)'>修改</a>", cellStyle: { "text-align": "center" }, width: 50, suppressSizeToFit: true }
        ];

        $scope.gridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            rowSelection: 'single',
            rowSelected: function rowSelectedFunc(row) {
                showOffers(row.node.data._id);
                $scope.assetSelected = true;
            },
            //enableFilter: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };

        AssetSheet.query(
            {
                createdById: $rootScope.user._id,
                status: { $in: [3] }
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
    
    $scope.accept = function (id) {
        alert(id);
    }

    function createOfferTable() {
        var columnDefs = [
            { headerName: "报价编号", field: "_id" },
            { headerName: "总价格", template: "{{data.price|currency:'￥'}}", cellStyle: { "text-align": "right" } },
            { headerName: "报价时间", field: "updatedAt" },
            //{ headerName: "", template: "<a data=\"{{data._id}}\" ng-click=\"var id='{{data._id}}';accept(id);\" >接受报价</a>", cellStyle: { "text-align": "center" }, width: 100, suppressSizeToFit: true }
        ];

        $scope.offerGridOptions = {
            angularCompileRows: true,
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            rowSelection: 'single',
            rowSelected: function rowSelectedFunc(row) {
                $scope.offerSelected = true;
            },
            //enableFilter: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };
    }

    function showOffers(sheetId) {
        $scope.offerSelected = true;
        Offer.query(
            { sheetId: sheetId },
            function (data) {
                $scope.hasOffer = data.length > 0;
                if ($scope.hasOffer) {
                    _dicts.translate(data, ['status'], ['offerStatus']);
                    $scope.offerGridOptions.rowData = data;
                    $scope.offerGridOptions.api.onNewRows();
                }
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });

    }
}]);