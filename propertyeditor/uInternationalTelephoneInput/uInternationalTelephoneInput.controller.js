angular.module("umbraco")
    .controller("tooorangey.uInternationalTelephoneInputController",
    function ($scope, assetsService) {
        //options from config
        $scope.options = {
            preferredCountries: ["gb", "dk", "us"]
        };
 
        if (typeof $scope.model.config.options != "undefined") {

                $scope.options = angular.fromJson($scope.model.config.options);
        }

        //set some scope properties to track status of telephone entry
        $scope.loaded = false;
        $scope.TelephoneNumberToValidate = '';
        $scope.HasTelephoneNumber = false;
        $scope.IsValidTelephone = false;
        $scope.ShowValidMessage = false;
        $scope.ShowInValidMessage = false;

       

        // load javascript libraries for intlTelInput plugin and google telephone validation
            assetsService.load([
             "/App_Plugins/uInternationalTelephoneInput/lib/js/intlTelInput.min.js",
             "/App_Plugins/uInternationalTelephoneInput/lib/js/isValidNumber.js"
      
         ])
         .then(function () {
             //this function will execute when all dependencies have loaded
             //the directive was trying to bind the telephone plugin before the javascript was loaded
             //could have applied the plugin via css class here, but wrote a directive because they are the answer to everything...
             // instead watching this property and when it changes to true, binding the plugin to the input
             $scope.loaded = true;
           
         });

        //load css seperately to avoid blocking js
        assetsService.loadCss("/App_Plugins/uInternationalTelephoneInput/lib/css/intlTelInput.css");
        // function to validate input
        // you need the country code in order to know if it's a valid telephone number
        // funkily the plugin stores this on a css class, on a div which is the child of another div, which is a child of the nextSibling of the input box,
        $scope.validateTelephoneInput = function (telephoneNumber, event) {
           // console.log(event);   
           
            var countryCode = event.target.nextSibling.children[0].children[0].className.split(" ")[1];
            $scope.validateTelephoneNumber(telephoneNumber, countryCode);
         
      
        };
        // when someone starts to edit the number, clear the validation message to avoid confusion
        $scope.clearValidation = function () {
   
            $scope.ShowValidMessage = false;
            $scope.ShowInValidMessage = false;


        };
        // validating the telephone number with the country code via the google telephone validation library isValidNumber()
        $scope.validateTelephoneNumber = function (telephoneNumber, countryCode) {
            $scope.TelephoneNumberToValidate = telephoneNumber;
            $scope.HasTelephoneNumber = (telephoneNumber != '');
            var val = $.trim(telephoneNumber), countryCode = countryCode;
            $scope.IsValidTelephone = window.isValidNumber(val, countryCode);
            $scope.ShowValidMessage = $scope.HasTelephoneNumber && $scope.IsValidTelephone;
            $scope.ShowInValidMessage = $scope.HasTelephoneNumber && !$scope.IsValidTelephone;

        }

    });
//later versions of angular have ng-blur and ng-focus, wired up, but the version in umbraco doesn't
// so these are the directives to make these work
// using ngc to avoid future clashes
app.directive('ngcFocus', ['$parse', function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr['ngcFocus']);
        element.bind('focus', function (event) {
            scope.$apply(function () {
                fn(scope, { $event: event });
            });
        });
    }
}]);
//blur
app.directive('ngcBlur', ['$parse', function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr['ngcBlur']);
        element.bind('blur', function (event) {
            scope.$apply(function () {
                fn(scope, { $event: event });
            });
        });
    }
}]);
// keydown keypress, don't use this in the end
app.directive('ngcKeydown', ['$parse', function ($parse) {
    return function (scope, element, attr) {
        var fn = $parse(attr['ngcKeydown']);
        element.bind('keydown keypress', function (event) {
            scope.$apply(function () {
                fn(scope, { $event: event });
            });
        });
    }
}]);
// directive to apply the international telephone number plugin
// using a directive means it is binding to the element that has the directive
// and you can use more than one control on the page
// but using a watch to make sure jquery plugin has loaded
app.directive('intTelNumber', function() {
    return {
        // Restrict it to being an attribute
        restrict: 'A',
        // responsible for registering DOM listeners as well as updating the DOM
        link: function (scope, element, attrs) {

            scope.$watch('loaded', function () {
                if (scope.loaded == true) {
                 
                    // apply plugin
                    element.intlTelInput(scope.options);
                    //validate loaded number
                    var countryCode = element[0].nextSibling.children[0].children[0].className.split(" ")[1];
                    scope.validateTelephoneNumber(element[0].value, countryCode);
                   
                }

            });
            }
    }
       
   
});




     