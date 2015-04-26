Peripherals = new Mongo.Collection('Peripherals');

if (Meteor.isClient) {
  Meteor.subscribe('Peripherals');

  Template.body.events({
    'click #btnStartScanning': function () {
      Meteor.call('ble:startScanning', function () {});
    },
    'click #btnStopScanning': function () {
      Meteor.call('ble:stopScanning', function () {});
    },
    'click #btnPurge': function () {
      Meteor.call('ble:purge', function () {});
    }
  });

  Template.body.helpers({
    peripherals: function () {
      var results = Peripherals.find();
      
      return results;
    }
  });

  Template.body.events({
    'change input[name="connect"]': function () {
    }
  });
}

if (Meteor.isServer) {
  var Future = Npm.require('fibers/future');
  // Get the Noble npm package
  var noble = Meteor.npmRequire('noble');
  var peripheralObjects = {};

  var peripheralToJson = function (peripheral) {
    return {
      "state": peripheral.state,
      "uuid": peripheral.uuid,
      "address": peripheral.address,
      "advertisement": peripheral.advertisement,
      "rssi": peripheral.rssi,
      "services": peripheral.services
    };
  };

  // @TODO Let's keep track of the ble adapter state.
  noble.on('stateChange', function (state) {
    console.log('noble:stateChange', state);
  });


  // Start up.
  Meteor.startup(function () {
    // Clean out old records.
    Peripherals.remove({});
  });

  // Meteor.publish('Peripherals', function () {
  //   // Return all peripherals found.
  //   return Peripherals.find();
  // });


  var fut = new Future();
  var bleDiscover = function (peripheral) {
    
    console.log('on ble:discover', peripheral);
    peripheralObjects[peripheral.uuid] = peripheral;
    peripheralJSON = peripheralToJson(peripheral);
    Meteor.call('ble:discover', peripheralJSON);

    fut.return(true);
  };

  var bleDiscoverBound = Meteor.bindEnvironment(bleDiscover);

  Meteor.methods({
    'ble:startScanning': function () {
      
      noble.startScanning();
      console.log('on ble:stopScanning');
    },

    'ble:stopScanning': function () {
      noble.stopScanning();
      console.log('on ble:stopScanning');
    },

    'ble:purge': function () {
      Peripherals.remove({});
      console.log('ble:purge, collection of peripherals is empty');
    },

    'ble:discover': function (peripheral) {
      check(peripheral.uuid, String);

      Peripherals.insert(peripheral);
      console.log('ble:discover, peripheral inserted to collection', peripheral);
    },

    'ble:connect': function (peripheral) {
      var Peripheral = peripheralObjects[peripheral.uuid];
      var docPeripheral = Peripherals.findOne({uuid: peripheral.uuid});

      Peripheral.connect(function (err) {
        Peripherals.update(docPeripheral._id, peripheralToJson(Peripheral));
      });
    },

    'ble:disconnect': function (peripheral) {
      var Peripheral = peripheralObjects[peripheral.uuid];
      var docPeripheral = Peripherals.findOne({uuid: peripheral.uuid});

      Peripheral.disconnect(function (err) {
        Peripherals.update(docPeripheral._id, peripheralToJson(Peripheral));
      });
    }

  });

  
  noble.on('discover', bleDiscoverBound);
}
