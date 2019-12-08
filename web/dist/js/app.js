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

        .when('/forecast', {
            templateUrl: 'web/pages/forecast.html',
            controller: 'forecastController',
        });
});

// Services for App "State"?
weatherApp.service('stateService', [
    'geolocationSvc',
    function(geolocationSvc) {
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
        // this.currentLocation = geolocationSvc.getCurrentPosition();
    },
]);

weatherApp.service('geolocationSvc', [
    '$q',
    '$window',
    '$log',
    function($q, $window, $log) {
        // this.mymap = L.map('map').setView([51.505, -0.09], 13);
        // this.getCurrentPosition = function() {
        //     function success(position) {
        //         const { latitude } = position.coords;
        //         const { longitude } = position.coords;
        //         const coords = { latitude, longitude };
        //         return coords;
        //     }
        //     function error() {
        //         $log.error('Unable to retrieve your location');
        //     }
        //     if (!navigator.geolocation) {
        //         $log.error('Geolocation is not supported by your browser');
        //     } else {
        //         $log.log('Locating…');
        //         navigator.geolocation.getCurrentPosition(success, error);
        //     }
        // };
    },
]);

// Custom Directives

weatherApp.directive('navbar', function() {
    return {
        replace: 'E',
        templateUrl: 'web/directives/navbar.html',
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
    'stateService',
    'geolocationSvc',
    function($scope, $log, stateService, geolocationSvc) {
        $scope.applyMapCoords = function(args) {
            $scope.currentCoords = stateService.currentCoords;
            stateService.city = {
                isCoordinate: true,
                name: `${$scope.currentCoords.lat},${$scope.currentCoords.lng}`,
            };
            // $log.log($scope.city, 'home/scope');
            $log.log(stateService.currentCoords, 'home/state');
        };

        $scope.$watch('city', function() {
            stateService.city = {
                isCoordinate: false,
                name: $scope.city,
            };
        });
    },
]);

weatherApp.controller('forecastController', [
    '$scope',
    '$log',
    '$resource',
    'stateService',
    function($scope, $log, $resource, stateService) {
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

        $scope.city = stateService.city || { name: 'Seattle' };

        $scope.currentDay = stateService.currentDay;

        $scope.getData = (function() {
            $log.log($scope, 'scope after get');
            for (const apiService in $scope.apiServices) {
                if (Object.prototype.hasOwnProperty.call($scope.apiServices, apiService)) {
                    const result = $scope.apiServices[apiService].get({
                        q: $scope.city.name || 'Seattle',
                        cnt: 7,
                        appid: '4bdd42e99d3c216e6c5b942b88dbfd15',
                    });
                    $scope.items.push(result);
                    $log.log($scope.items[0], $scope.items[1]);
                }
            }
        })();

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
