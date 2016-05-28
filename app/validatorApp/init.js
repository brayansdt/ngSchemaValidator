(function(angular) {
    "use strict";

    var app = angular.module('validatorExampleApp', ['ngRoute', 'MainModule']);

    app.config(['$routeProvider', function($routeProvider) {

        $routeProvider.when('/', {
            controller: 'MainCtrl',
            templateUrl: 'app/validatorApp/template/main.html'
        });

    }]);

})(angular);
