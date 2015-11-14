app.controller('MessageController', ['$scope', '$rootScope', 'Message', 'User', 'ngDialog', '$location', function ($scope, $rootScope, Message, User, ngDialog, $location) {
    
    $scope.sendEmail = false;
    $scope.sendEmailSuccessfull = false;

    $scope.users = User.query();
    $scope.messageIns = Message.query({ receiverId: $rootScope.user._id }, function (data) {
        data.forEach(function (value, index) {
            value.user = User.query({ _id: value.senderId });
            $scope.messageIns[index].statusCode = $scope.messageIns[index].status;
        })
        _dicts.translate(data, 'status', 'emailStatus');
    });

    $scope.messageOuts = Message.query({ senderId: $rootScope.user._id }, function (data) {
        data.forEach(function (value, index) {
            value.user = User.query({ _id: value.receiverId });
            $scope.messageIns[index].statusCode = $scope.messageIns[index].status;
        })
        _dicts.translate(data, 'status', 'emailStatus');
    });

    $scope.MarkAsRead = function (mid) {
        var message = new Message({ status: 2 });
        Message.update({ id: mid }, message);
        $scope.messageIns = Message.query({ receiverId: $rootScope.user._id }, function (data) {
            data.forEach(function (value, index) {
                value.user = User.query({ _id: value.senderId });
                $scope.messageIns[index].statusCode = $scope.messageIns[index].status;
            });
            _dicts.translate(data, 'status', 'emailStatus');
        });
    };

    $scope.Reply = function (mid, toId) {
        $scope.sendEmail = true;
        $scope.sendMyEmail = false;
        $scope.toId = toId;
        $scope.MarkAsRead(mid);

        $scope.messageOuts = Message.query({ senderId: $rootScope.user._id }, function (data) {
            data.forEach(function (value, index) {
                value.user = User.query({ _id: value.receiverId });
                $scope.messageIns[index].statusCode = $scope.messageIns[index].status;
            })
            _dicts.translate(data, 'status', 'emailStatus');
        });
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

    $scope.sendMail = function(){
        $scope.sendEmail = true;
        $scope.sendMyEmail = true;
        if($scope.users)
        {
            for(var i = $scope.users.length - 1; i >= 0; i--)
            {
                if($scope.users[i].isAdmin == 1)
                {
                    $scope.admin = $scope.users[i]; 
                }
            }
        }
        $scope.toId = $scope.admin._id;
        //$scope.toId = "5631847a1a6227380bcca3b7";
    }

    $scope.cancelMail = function(){
        $scope.sendEmail = false;
        $scope.sendMyEmail = false;
        $scope.sendEmailSuccessfull = false;
    }
}]);