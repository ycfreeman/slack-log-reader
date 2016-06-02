// yea, yea, i just hacked up this whole thing in a few hours, it's not pretty
// and i just picked angular 1 because its quick for what i want to do

angular
    .module('app',[])
    .controller('page', function($scope, $http){
        $scope.data = {
            log: -1,
            user: "",
            channel: "all"
        };

        $scope.logContents = [];
        let apiRoot = "/api/";
        $http.get(apiRoot)
            .then(function(response){
                $scope.logs = response.data;
            });

        $scope.$watch("data.log", function(logNumber){

            if (logNumber > -1) {
                $http.get(apiRoot + '/' + logNumber).then(function (response) {
                    $scope.channels = ["all"].concat(response.data.channels);
                    $scope.users =
                        angular.merge({ "_": "everyone" }, response.data.users);
                    $scope.data.user = "everyone";
                });
            }
        });

        $scope.$watch("data.channel+data.user", function(){
            let data = $scope.data;
            let logNumber = data.log;
            let user = data.user;
            let channel = data.channel;
            if (user && channel){

                let url = apiRoot + '/' + logNumber + '/' + channel;
                if (user != "everyone"){
                    url += '/' + user
                }
                $http.get(url)
                    .then(function (response) {
                        console.log(response.data);
                    $scope.logContents = response.data
                        .filter(function(log){
                            return log.subtype != "channel_join" &&
                                log.text.length;
                        });
                });
            }
        });
    });
