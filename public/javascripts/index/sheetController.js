app.controller('SheetController', ['$scope', '$rootScope', '$routeParams', '$location', 'AssetSheet', 'Offer', 'Message', function ($scope, $rootScope, $routeParams, $location, AssetSheet, Offer, Message) {
    $scope.id = $routeParams.id;
    $scope.isLogin = $rootScope.user != null;

    $scope.hasDuplicate = false;
    $scope.fillData = false;
    $scope.sendEmail = false;
    $scope.sendEmailSuccessfull = false;

    function cellValueChanged(cell) {
        $scope.fillData = true;
        var row = $scope.gridOptions.rowData[cell.rowIndex];
        row.offerSubTotalprice = row.number * row.offerUnitPrice || 0;

        $scope.gridOptions.api.softRefreshView();

        total();

        //check if there is a same offer for this assetSheet already
        $scope.offers = Offer.query({ sheetId: $scope.sheet._id, createdById: $rootScope.user._id }, function (data) {
            for (i = 0; i < data.length; ++i) {
                $exist = true;
                for (j = 0; j < data[i].assets.length; ++j) {
                    if (data[i].assets[j].price != $scope.sheet.assets[j].offerUnitPrice) {
                        $exist = false;
                        break;
                    }
                }
                if ($exist == true) {
                    $scope.hasDuplicate = true;
                    break;
                }
            }
        });
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
            { headerName: "小计", field: "offerSubTotalprice", volatile: true, hide: !$scope.isLogin },
            { headerName: "备注", field: "description", editable: true}
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
                    _dicts.translate(data, ['payMethod', 'cleanUpMethod', 'dealRule', 'status'], ['payMethod', 'cleanUpMethod', 'dealRule', 'sheetStatus']);

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
                                        if ($scope.sheet.assets[i] && offer.assets[i]) {
                                            $scope.sheet.assets[i].offerUnitPrice = offer.assets[i].price;
                                            $scope.sheet.assets[i].description = offer.assets[i].description;
                                            $scope.sheet.assets[i].offerSubTotalprice = $scope.sheet.assets[i].number * $scope.sheet.assets[i].offerUnitPrice || 0;
                                        }
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
                offer.assets.push({ _id: value._id, price: value.offerUnitPrice, description: value.description });
            }
        });
 
        if($scope.offer) {
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

    $scope.email = function () {
        $scope.sendEmail = true;
    };

    $scope.send = function (toId) {
        var message = new Message({ senderId: $rootScope.user._id, receiverId: toId, topic: $scope.topic, content: $scope.content, status: 1 });
        message.$save(function () {
            $scope.sendEmailSuccessfull = true;
        },
        function (response) { // error case
            _helper.showHttpError(response);
        });
    };
}]);