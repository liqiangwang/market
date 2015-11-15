app.controller('ProfileController', ['$scope', '$rootScope', '$routeParams', '$location', 'AssetSheet', 'Offer', function ($scope, $rootScope, $routeParams, $location, AssetSheet, Offer) {
    $scope.init = function () {
        $scope.getUser();
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

    $scope.getUser = function (){
        $scope.alias = $rootScope.user.alias;
        $scope.pass = $rootScope.user.password;
        $scope.phone = $rootScope.user.phone;
        $scope.mail = $rootScope.user.email;
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
            { headerName: "状态", template: "{{data.sheet.statusText}}", cellStyle: { "text-align": "center"} },
            { headerName: "报价时间", template: "{{data.updatedAt | date: 'yyyy-MM-dd HH:mm'}}", cellStyle: { "text-align": "center"} }
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