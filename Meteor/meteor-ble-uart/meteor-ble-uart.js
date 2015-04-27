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

  Template.peripheral.helpers({
    checkIf: function (status) {
      return status == 'connected' ? 'checked="checked"' : '';
    }
  });

  Template.peripheral.events({
    'change input.peripheral-status': function (ev, template) {
      var uuid = ev.target.dataset.uuid;
      var is_checked = ev.target.checked;
      
      if (is_checked) {
        Meteor.call('ble:connect', uuid);
        console.log('ischecked true, peripheral ble:connect', uuid, ', is checked? ', is_checked)
      } else {
        Meteor.call('ble:disconnect', uuid);
        console.log('ischecked false, peripheral ble:disconnect', uuid, ', is checked? ', is_checked);
      }
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
    //Peripherals.remove({});
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

  var bleConnect = function (uuid, peripheral) {
    
    var docPeripheral = Peripherals.findOne({uuid: uuid});
    Peripherals.update(docPeripheral._id, peripheralToJson(peripheral));

    console.log('ble:connect peripheral?', peripheral);
  };

  var bleDisconnect = function (uuid, peripheral) {
    
    var docPeripheral = Peripherals.findOne({uuid: uuid});
    Peripherals.update(docPeripheral._id, peripheralToJson(peripheral));

    console.log('ble:disconnect peripheral?', peripheral);
  };

  var findPeripheralByUUID = function (uuid, cb) {
    var Peripheral = peripheralObjects[uuid];
    
    if (!Peripheral) {
      // Try and find it again.
      console.log('attempting to find ' + uuid);
      noble.startScanning();

    } else {
      cb( Peripheral );
    }
  };

  var bleDiscoverBound = Meteor.bindEnvironment(bleDiscover);
  var bleConnectBound = Meteor.bindEnvironment(bleConnect);
  var bleDisconnectBound = Meteor.bindEnvironment(bleDisconnect);

  Meteor.methods({
    'ble:startScanning': function () {
      Meteor.call('ble:purge');

      noble.startScanning();
      console.log('on ble:startScanning');
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
      var existingRecord = Peripherals.findOne({uuid: peripheral.uuid});

      if (existingRecord) {
        Peripherals.update(existingRecord._id, peripheral);
        console.log('ble:discover, peripheral updated in collection', peripheral);
      } else {
        Peripherals.insert(peripheral);
        console.log('ble:discover, peripheral inserted to collection', peripheral);
      }
      
    },

    'ble:connect': function (uuid) {
      var Peripheral = findPeripheralByUUID(uuid, function (peripheral) {
        peripheral.connect(function () {
          bleConnectBound(uuid, peripheral);
        });
      });

      // if (!Peripheral) {
      //   // Try and find it again.
      //   console.log('attempting to find ' + uuid);
      //   noble.startScanning([uuid], false);
      // }

      
    },

    'ble:disconnect': function (uuid) {
      var Peripheral = findPeripheralByUUID(uuid, function (peripheral) {
        console.log('disconnect ', uuid);
        peripheral.disconnect(function () {
          bleDisconnectBound(uuid, peripheral);
        });
      });

      
    }

  });

  
  noble.on('discover', bleDiscoverBound);
}
