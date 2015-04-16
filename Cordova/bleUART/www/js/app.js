// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'nRF8001'])

.controller(
  'MainCtrl', // remember to set the ng-controller="MainCtrl" attribute in your HTML!
 
  ['$scope', '$ionicPlatform', 'UART',
    function ($scope, ionic, UART) {
      console.log("Running the controller");
      $scope.UART; // Our BLE UART object.
       
      $scope.timerTimeout = 3; // Scan for X seconds
      $scope.history = []; // A history log of data sent/received
      $scope.userInput = ''; // A variable to bind our input form element.
      $scope.currentDevice;
      
      // A simple method to send data! (We bind this to a button)
      $scope.sendData = function (device, data) {

        // ...Keep track of incomming and outgoing messages!
        $scope.history.push( 'Write (Tx): ' + data );

        /**
         * Our Arduino sketch doesn't expect any special formatting, it's just 
         * going to output whatever we send.
         * 
         * However, we must transmit our data as integers that represent the 
         * ASCII values of each character in our data string.
         */
        var len = data.length;
        var asciiArray = [];
        for(var i = 0; i < len; i++) {
          asciiArray.push( data.charCodeAt(i) );
        }

        // The Arduino sketch we are using runs on an 8-bit microcontroller, so we
        // have to take some special conditions into consideration. 
        // 
        // We must send our data as an array of 8-bit integers representing each 
        // character's ASCII value. The integer values are converted back to 
        // characters in our Arduino sketch.
        var sendData = new Uint8Array(asciiArray);


        // Write our integer array back to our Arduino powered device!
        device.write(sendData);

      };
      
      // Stop scanning.
      $scope.stopScan = function () {
        console.log("\n\n* * * stopScan() * * *");

        $scope.UART.stopScan();
        $scope.UART.closeAll();
        
        //$scope.UART.scannedDevices = {};
      };

      // Start scanning.
      $scope.startScan = function () {
        console.log("\n\n\n\n* * * startScan() * * *\n\n\n\n");
        
        if ($scope.UART.isScanning === true) {
          $scope.stopScan(); // Stop any ongoing scans
        }
        
        $scope.UART.startScan($scope.timerTimeout); // Start BLE scanning of advertised BLE slaves.
      };



      // Clear out our history
      $scope.clearAll = function () {

        $scope.history = [];

      };


      $scope.connect = function (device) {
        if ($scope.UART.isScanning) {
          $scope.stopScan(true);
        }
        currentDevice = device;
        
        currentDevice.connect();
        
        $scope.$apply();
      };

      $scope.disconnect = function (device) {
        if ($scope.UART.isScanning) {
          $scope.stopScan(true);
        }
        currentDevice = device;
        
        currentDevice.disconnect();
        
        $scope.$apply();
      }
      // This method is called when the ionic framework has loaded.
      // This is the safest way to bind the UART callbacks, so that we
      // can rest assured the needed Cordova plugins are available before 
      // attempting to call methods (such as the internal Bluetooth LE stuff)
      ionic.ready(function() {

        // Start the UART service.
        $scope.UART = UART;
        $scope.UART.initialize($scope);

        console.log("\n\n\t\t * * * Ionic READY callback!\n\n");

        // Get notified when data comes in! (20 chars max at a time)
        // We must bind this method only once our Cordova plugins are available, 
        // otherwise, we will get 'undefined' and 'null' errors all over the
        // place.
        $scope.UART.readCallback = function (data) {
          /**
           * @todo We can do something with the data
           * For now, we can add it to our history list
           */
          
          $scope.history = [ 'Read (Rx): ' + data ];

          $scope.$digest(); // Manually get the AngularJS bindings to update
        };

        // Get notified when a device is detected!
        $scope.UART.onDeviceFoundCallback = function(device) {
          /**
           * @todo Do something with the UART.scannedDevices array if you want.
           * We are simply using the ng-repeat directive in our HTML to 
           * list each device. This callback is fired after the device has been 
           * added to the UART.
           */
          console.log("\n\n\n\n*** DEVICE FOUND ***\n\n\n\n");
          console.log(device);
          
          $scope.stopScan(false); // We are going to use the first device detected.
          //$scope.$digest(); // Manually get the AngularJS bindings to update
        };
        // Get notified when scanning stops.
        $scope.UART.stopScanCallback = function () {
          /**
           * @todo stopScan() has been called. Add any logic here if you need to 
           * do something else when scannig stops.
           */
        };
         
       });
    
    }
  ]
)
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
