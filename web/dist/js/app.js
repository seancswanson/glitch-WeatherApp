// 4bdd42e99d3c216e6c5b942b88dbfd15
// http://api.openweathermap.org/data/2.5/forecast/daily?APPID=

// MODULE
// Declare what dependencies/services will be used.

const weatherApp = angular.module('weatherApp', ['ngRoute', 'ngResource', 'leaflet-directive']);

weatherApp.config(function($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'web/pages/home.html',
            controller: 'homeController',
        })

        .when('/explore', {
            templateUrl: 'web/pages/home.html',
            controller: 'homeController',
        })

        .when('/forecast', {
            templateUrl: 'web/pages/forecast.html',
            controller: 'forecastController',
        })

        .when('/contact', {
            templateUrl: 'web/pages/contact.html',
            controller: 'contactController',
        });
});

// Service for App "State"
weatherApp.service('stateService', [
    function() {
        this.user = {
            username: 'Sean',
        };

        this.currentDay = Date.now();

        this.currentCoords = {
            lat: 47.60917214635615,
            lng: -122.25311279296876,
            zoom: 12,
            // autoDiscover: true,
        };
    },
]);

// Custom Directives

weatherApp.directive('navbar', function() {
    return {
        replace: 'E',
        templateUrl: 'web/directives/navbar.html',
        scope: true,
        controller: function($scope, $element) { // eslint-disable-line
            // Why can't the above line work with the shorthand syntax for declaring a function as a property?
            // Eslint needed to be disable to keep functionality.
            $scope.toggleMenu = function() {
                const menu = document.querySelector('.navbar-mobile');
                menu.classList.toggle('shown');
            };
        },
    };
});

weatherApp.directive('myFooter', function() {
    return {
        replace: true,
        templateUrl: 'web/directives/footer.html',
    };
});

// CONTROLLERS

weatherApp.controller('homeController', [
    '$scope',
    '$log',
    '$resource',
    'stateService',
    function($scope, $log, $resource, stateService) {
        $scope.items = [];

        $scope.endpoints = ['http://api.openweathermap.org/data/2.5/weather'];

        $scope.apiServices = {
            coordResult: $resource(
                $scope.endpoints[0],
                {
                    callback: 'JSON_CALLBACK',
                },
                {
                    get: {
                        method: 'JSONP',
                    },
                }
            ),
        };

        $scope.locationInput = document.querySelector('.location-input');
        $scope.locationInput.addEventListener('keydown', function(event) {
            if (event.which === 13 && $scope.city !== '') {
                $scope.setCity();
            }
        });

        $scope.applyMapCoords = function() {
            $log.log(stateService.currentCoords, 'applyMapCoords');
            $scope.currentCoords = stateService.currentCoords;

            $scope.apiServices.coordResult
                .get({
                    lat: $scope.currentCoords.lat,
                    lon: $scope.currentCoords.lng,
                    cnt: 0,
                    appid: '4bdd42e99d3c216e6c5b942b88dbfd15',
                })
                .$promise.then(function(args) {
                    $scope.items.push(args.name);
                    $log.log($scope.items);
                    $scope.city = $scope.items[$scope.items.length - 1];
                });
        };

        $scope.setCity = function() {
            if (!$scope.city) {
                const errorMessage = document.querySelector('.error-message');
                errorMessage.addEventListener('click', function() {
                    errorMessage.classList.toggle('shown');
                });
                errorMessage.classList.toggle('shown');
                setTimeout(function() {
                    errorMessage.classList.remove('shown');
                }, 5000);
                return;
            }
            window.location.href = '#/forecast';
        };

        $scope.$watch('city', function() {
            stateService.city = {
                name: $scope.city,
            };
        });
    },
]);

// weatherApp.directive('submitInput', function() {
//     return function(scope, element, attrs) {
//         console.log(element);
//     };
// });

weatherApp.controller('forecastController', [
    '$scope',
    '$log',
    '$resource',
    '$filter',
    'stateService',
    function($scope, $log, $resource, $filter, stateService) {
        $scope.items = [];

        $scope.endpoints = [
            'http://api.openweathermap.org/data/2.5/weather',
            'http://api.openweathermap.org/data/2.5/forecast',
        ];

        $scope.apiServices = {
            weatherResult: $resource(
                $scope.endpoints[0],
                {
                    callback: 'JSON_CALLBACK',
                },
                {
                    get: {
                        method: 'JSONP',
                    },
                }
            ),
            forecastResult: $resource(
                $scope.endpoints[1],
                {
                    callback: 'JSON_CALLBACK',
                },
                {
                    get: {
                        method: 'JSONP',
                    },
                }
            ),
        };

        $scope.city = stateService.city || {
            name: 'Seattle',
        };

        $scope.currentDay = stateService.currentDay;

        $scope.getData = (function() {
            for (const apiService in $scope.apiServices) {
                if (Object.prototype.hasOwnProperty.call($scope.apiServices, apiService)) {
                    const result = $scope.apiServices[apiService].get({
                        q: $scope.city.name,
                        cnt: 7,
                        appid: '4bdd42e99d3c216e6c5b942b88dbfd15',
                    });
                    $scope.items.push(result);
                }
            }
        })();

        $scope.applyGridView = function() {
            const tableViewButton = document.querySelector('.table-view');
            const gridViewButton = document.querySelector('.grid-view');
            const forecastResultsContainer = document.querySelector('.trihoral-results-container');
            $log.log('clicked', forecastResultsContainer);
            if (forecastResultsContainer.classList.contains('results-grid-view')) {
                return;
            }

            forecastResultsContainer.classList.toggle('results-grid-view');
            forecastResultsContainer.classList.toggle('results-table-view');
            tableViewButton.classList.remove('selected');
            gridViewButton.classList.add('selected');
        };

        $scope.applyTableView = function() {
            const tableViewButton = document.querySelector('.table-view');
            const gridViewButton = document.querySelector('.grid-view');
            const forecastResultsContainer = document.querySelector('.trihoral-results-container');

            if (forecastResultsContainer.classList.contains('results-table-view')) {
                return;
            }
            forecastResultsContainer.classList.toggle('results-grid-view');
            forecastResultsContainer.classList.toggle('results-table-view');
            gridViewButton.classList.remove('selected');
            tableViewButton.classList.add('selected');
        };

        $log.log('Full payload', $scope.items[0], $scope.items[1]);

        $scope.convertToFahrenheit = function(degK) {
            return Math.round(1.8 * (degK - 273) + 32);
        };

        $scope.makeIconUrl = function(iconId) {
            return `http://openweathermap.org/img/w/${iconId}.png`;
        };

        $scope.convertToDate = function(dt) {
            return new Date(dt * 1000);
        };

        $scope.isDarkOut = function(dt) {
            const time = $filter('date')($scope.convertToDate(dt), 'h');
            const isPm = $filter('date')(time, 'a') === 'PM';
            return time > 8 && isPm && time === 12 && isPm && time < 4 && !isPm;
        };
    },
]);

weatherApp.controller('mapController', [
    '$scope',
    'stateService',
    '$log',
    function($scope, stateService, $log) {
        $scope.center = {
            lat: 47.60917214635615,
            lng: -122.25311279296876,
            zoom: 12,
        };

        $scope.defaults = {
            scrollWheelZoom: false,
        };

        $scope.updateCoords = function(args) {
            $scope.center = {
                lat: args.lat,
                lng: args.lng,
                zoom: args.zoom,
            };

            stateService.currentCoords = {
                lat: $scope.center.lat,
                lng: $scope.center.lng,
                zoom: $scope.center.zoom,
            };

            $log.log('Moved map', stateService.currentCoords);
        };
    },
]);

weatherApp.controller('contactController', ['$scope', function($scope) {}]);
