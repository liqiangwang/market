app.controller('OffersController', ['$scope', '$rootScope', '$routeParams', '$location', 'AssetSheet', 'Offer', 'User', function ($scope, $rootScope, $routeParams, $location, AssetSheet, Offer, User) {
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

    function createOfferDetailTable() {
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
            { headerName: "报价", field: "price", cellStyle: { "color": "red" ; "text-align": "center" } },
            { headerName: "备注", field: "description", cellStyle: { "text-align": "center"} }
        ];

        $scope.offerGridOptions = {
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

    function showOffers(sheetId, assets) {
        AssetSheet.query({ _id: sheetId }, function (data) {
            _dicts.translate(data[0].assets, 'category', 'assetCategory');
            for (var i = 0; i < data[0].assets.length; i++) {
                data[0].assets[i].price = assets[i].price;
                data[0].assets[i].description = assets[i].description;
            }
            $scope.offerGridOptions.api.setRows(data[0].assets);
            $scope.offerGridOptions.api.sizeColumnsToFit();
     },
     function (response) { // error case
         _helper.showHttpError(response);
     });

    }

    $scope.query = function () {
        var columnDefs = [
            { headerName: "名称", template: "{{data.sheet.name}}", cellStyle: { "text-align": "center"} },
            { headerName: "计划交割时间", template: "{{data.sheet.planningDeliveryTime | date: 'yyyy-MM-dd'}}", cellStyle: { "text-align": "center"} },
            { headerName: "计划交割地点", template: "{{data.sheet.planningDeliveryAddress}}", cellStyle: { "text-align": "center"} },
            { headerName: "付款方式", template: "{{data.sheet.payMethodText}}", cellStyle: { "text-align": "center"} },
            { headerName: "成交规则", template: "{{sheet.dealRuleText}}", cellStyle: { "text-align": "center"} },
            { headerName: "要求从业资格证书", template: '<span ng-show="data.requireCertificate" class="glyphicon glyphicon-ok" aria-hidden="true"></span>', cellStyle: { "text-align": "center" } },
            { headerName: "总价格", template: "{{data.price|currency:'￥'}}", cellStyle: { "text-align": "center" } },
            { headerName: "报价时间", template: "{{data.updatedAt | date: 'yyyy-MM-dd HH:mm'}}", cellStyle: { "text-align": "center"}},
            { headerName: "状态", template: "{{data.statusText}}", cellStyle: { "text-align": "center"} },
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
                    $scope.offerGridOptions.api.setRows(data.assets);
                    $scope.offerGridOptions.api.sizeColumnsToFit();
                }
                showOffers(data.sheetId, data.assets);
                $scope.offerSelected = true;
            },
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
                    _dicts.translate(data, ['status'], ['offerStatus']);
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

        createOfferDetailTable();
    }
}]);