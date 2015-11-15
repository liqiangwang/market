/// <reference path="../../pages/my/auctionsConfirm.html" />
app.controller('AuctionsController', ['$scope', '$rootScope', 'AssetSheet', 'Offer', 'User', 'ngDialog', '$location', function ($scope, $rootScope, AssetSheet, Offer, User, ngDialog, $location) {
    $scope.init = function () {
        $scope.query();
    }

    $scope.query = function () {
        showAssetSheets();
        createAssetTable();
        createOfferTable();
    }

    function showAssetSheets() {
        var columnDefs = [
            { headerName: "名称", field: "name", cellStyle: { "text-align": "center"} },
            { headerName: "计划交割时间", template: "{{data.planningDeliveryTime | date: 'yyyy-MM-dd'}}", cellStyle: { "text-align": "center"}},
            { headerName: "计划交割地点", field: "planningDeliveryAddress", cellStyle: { "text-align": "center"} },
            { headerName: "付款方式", field: "payMethodText", cellStyle: { "text-align": "center"}},
            { headerName: "成交规则", field: "dealRuleText", cellStyle: { "text-align": "center"} },
            { headerName: "要求从业资格证书", field: "requireCertificate", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            //{ headerName: "总价格", field: "totalPrice", template: "{{data.totalPrice|currency:'￥'}}", cellStyle: { "text-align": "right" } },
            { headerName: "需要数据销毁服务", field: "needDataCleanup", template: '<span ng-show="data.needDataCleanup" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "状态", field: "statusText", cellStyle: { "text-align": "center"} }
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
                var data = row.node.data;
                if (data.assets) {
                    for (var i = data.assets.length - 1; i >= 0; i--) {
                        if (data.assets[i] == null) {
                            data.assets.splice(i, 1);
                        }
                    }
                }
                $scope.hasAsset = data && data.assets && data.assets.length > 0;
                if ($scope.hasAsset) {
                    _dicts.translate(data.assets, 'category', 'assetCategory');
                    $scope.assertGridOptions.api.setRows(data.assets);
                    $scope.assertGridOptions.api.sizeColumnsToFit();
                }
                showOffers(data._id);
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

    function createAssetTable() {
        var columnDefs = [
            { headerName: "类别", field: "categoryText", cellStyle: { "text-align": "center"} },
            { headerName: "品牌", field: "brand", cellStyle: { "text-align": "center"} },
            { headerName: "型号", field: "serial", cellStyle: { "text-align": "center"} },
            { headerName: "CPU", field: "cpu", cellStyle: { "text-align": "center"} },
            { headerName: "内存", field: "memory", cellStyle: { "text-align": "center"} },
            { headerName: "硬盘", field: "harddisk", cellStyle: { "text-align": "center"} },
            { headerName: "其他配件", field: "other", cellStyle: { "text-align": "center"} },
            { headerName: "状态", field: "working", cellStyle: { "text-align": "center"} },
            { headerName: "数量", field: "number", cellStyle: { "text-align": "center"} },
            //{ headerName: "单价", field: "price", cellStyle: { "text-align": "center"}  }
        ];

        $scope.assertGridOptions = {
            columnDefs: columnDefs,
            rowData: null,
            dontUseScrolls: false,
            enableColResize: true,
            angularCompileRows: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };
    }

    $scope.accept = function (id) {
        ngDialog.openConfirm({
            template: 'pages/my/auctionsConfirm.html',
            className: 'ngdialog-theme-default',
            scope: $scope
        }).then(function (value) {//确认
            acceptConfirmed();
        }, function (reason) {// 取消

        });
    }

    function acceptConfirmed() {
        var offer = $scope.offerGridOptions.api.getSelectedNodes()[0].data;
        offer.status = 2;   // 成交
        Offer.update(
            { id: offer._id },
            offer,
            function () {
                $location.url('/auctionsSaved');
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });
    }

    function createOfferTable() {
        var columnDefs = [
            { headerName: "报价人", template: "{{data.user[0].alias}}", cellStyle: { "text-align": "center"}},
            //{ headerName: "单价", template: "{{data.offerUnitPrice|currency:'￥'}}" },
            { headerName: "总价格", template: "{{data.price|currency:'￥'}}", cellStyle: { "text-align": "center" } },
            { headerName: "报价时间", template: "{{data.updatedAt | date: 'yyyy-MM-dd HH:mm'}}", cellStyle: { "text-align": "center" }},
            { headerName: "状态", field: "statusText", cellStyle: { "text-align": "center" } }
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
                $scope.offerId = row.node.data._id
                $scope.offerSelected = true;                
            },
            //enableFilter: true,
            ready: function (event) {
                event.api.sizeColumnsToFit();
            }
        };
    }

    function showOffers(sheetId) {
        $scope.offerSelected = false;
        Offer.query(
            { sheetId: sheetId },
            function (data) {
                $scope.hasOffer = data.length > 0;
                if ($scope.hasOffer) {
                    _dicts.translate(data, ['status'], ['offerStatus']);

                    for (i = 0; i < data.length; ++i) {
                        var uid = data[i].createdById;
                        data[i].user = User.query({ _id: uid });
                    }

                    $scope.offerGridOptions.rowData = data;
                    $scope.offerGridOptions.api.onNewRows();
                }
            },
            function (response) { // error case
                _helper.showHttpError(response);
            });

    }
}]);