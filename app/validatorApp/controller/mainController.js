(function(angular) {
    "use strict";

    var app = angular.module('MainModule', ['ngSchemaValidator']);

    app.controller('MainCtrl', [
        '$scope', 'SchemaValidator',
        function($scope, SchemaValidator) {
            $scope.formData = {};

            $scope.saveForm = function(){
                console.log($scope.formData);

                SchemaValidator.validateData($scope.formData, 'app/validatorApp/schema/user.json');
            };
        }
    ]);

})(angular);