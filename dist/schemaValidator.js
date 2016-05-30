(function(angular) {
    "use strict";

    if (typeof SCHEMA_PATH == 'undefined') {
        var SCHEMA_PATH = '';
    }

    function ValidationException(message) {
        this.message = message;
        this.name = "ValidationException";
    }

    var validatorModule = angular.module("ngSchemaValidator", []);

    validatorModule.service("SchemaValidator", [
        '$http', '$q',
        function($http, $q) {

            function isEmpty(obj) {

                // null and undefined are "empty"
                if (obj == null) return true;

                // Assume if it has a length property with a non-zero value
                // that that property is correct.
                if (obj.length > 0)    return false;
                if (obj.length === 0)  return true;

                // Otherwise, does it have any properties of its own?
                // Note that this doesn't handle
                // toString and valueOf enumeration bugs in IE < 9
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
                }

                return true;
            }

            /**
             * Função utilizada para limpar objetos recursivamente
             *
             * @param innerObj
             * @returns {*}
             */
            function cleanInnerObject(innerObj) {

                var cleanedInnerEntity;

                if (angular.isArray(innerObj)) {
                    cleanedInnerEntity = [];
                } else {
                    cleanedInnerEntity = {};
                }

                angular.forEach(innerObj, function(val, key) {

                    //recursividade
                    if ((angular.isObject(val) || angular.isArray(val)) && !angular.isDate(val)) {
                        val = cleanInnerObject(val);
                    }

                    if (angular.isString(val)) {
                        val = val.trim();
                    }

                    if (val || val === false || val === 0) {
                        console.log(val);
                        debugger;
                        if (parseFloat(val) == val) {
                            val = parseFloat(val);
                        }
                        if (angular.isArray(cleanedInnerEntity)) {
                            cleanedInnerEntity.push(val);
                        } else {
                            cleanedInnerEntity[key] = val;
                        }
                    }
                });

                if (isEmpty(cleanedInnerEntity)) {
                    return null;
                }
                return cleanedInnerEntity;
            }

            /**
             * Função responsável por limpar chaves que possuem valores vazios
             * @param obj
             * @returns {{}}
             */
            function cleanObject(obj) {
                var cleanedObj = {};
                angular.forEach(obj, function(val, key) {
                    if ((angular.isObject(val) || angular.isArray(val)) && !angular.isDate(val)) {
                        val = cleanInnerObject(val);
                    }

                    if (angular.isString(val)) {
                        val = val.trim();
                    }

                    if (val || val === false || val === 0) {
                        if (parseFloat(val) == val) {
                            val = parseFloat(val);
                        }
                        cleanedObj[key] = val;
                    }
                });
                return cleanedObj;
            }

            /**
             * Função responsável por pegar o json schema
             * @param schemaName
             * @returns {deferred.promise|{then}}
             */
            function fetchSchema(schemaName) {
                var deferred = $q.defer();
                if(schemaName.search(/.json/) !== (schemaName.length - 5)) {
                    schemaName += '.json';
                }
                $http.get(schemaName, {cache: true}).then(
                    function(result) {
                        deferred.resolve(result);
                    },
                    function(error) {
                        deferred.reject(error);
                    }
                );
                return deferred.promise;
            }

            function treatErrors(hideErrors, validationResult) {
                if (!hideErrors && !validationResult.valid) {
                    angular.forEach(validationResult.errors, function(error) {
                        console.error('error ', error.message);
                        //Modal.growl(error.message, 'error');

                    });

                    /**
                     * @todo finalizar esta parte, para que o projeto nao seja dependente do lodash
                     */
                    debugger;
                    var errorMessages = _(angular.pluck(validationResult.errors, 'message')).toString();

                    throw new ValidationException(errorMessages);
                }
            }

            /**
             * Função responsável por validar os dados passados de acordo com o json schema
             * @param data
             * @param schemaName
             * @param hideErrors
             * @param extraValidationFunction
             * @returns {*}
             */
            function validateData(data, schemaName, hideErrors, extraValidationFunction) {

                var schemaPromise = fetchSchema(schemaName);

                return schemaPromise.then(
                    function(schema) {
                        data = cleanObject(data);
                        var validationResult = tv4.validateMultiple(data, schema.data);

                        /**
                         * Validações extras
                         */
                        if (extraValidationFunction && angular.isFunction(extraValidationFunction)) {
                            var extraValidationErrors = extraValidationFunction(validationResult);
                            if (extraValidationErrors && extraValidationErrors.length) {
                                validationResult.errors = validationResult.errors.concat(extraValidationErrors);
                                validationResult.valid = false;
                            }
                        }
                        treatErrors(hideErrors, validationResult);

                        return validationResult;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
            }

            /**
             * @todo implementar chamda recursiva para multiplas validações
             */
            //function validateMultipleData(schemaToDataObj, hideErrors, extraValidationFunction) {
            //    var promises = [];
            //    angular.forEach(schemaToDataObj, function(obj, key) {
            //        promises.push(validateData(obj, key, hideErrors));
            //    });
            //    if (promises.length) {
            //        var highestPromise;
            //        angular.forEach(promises, function(obj, key) {
            //            if (key == 0) {
            //                highestPromise = obj;
            //            }
            //            obj.then(promises[key + 1]);
            //        });
            //        return highestPromise;
            //    }
            //    return promises;
            //}

            return {
                validateData: validateData
            };

        }]);

})(angular);
