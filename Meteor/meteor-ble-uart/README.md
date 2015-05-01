Meteor BLE UART server
======================
Put together using various technologies. This example project was written by A. Albino (zrecommerce) for Femto.io

If you encounter bugs, please consider creating an Issue request at https://github.com/femtoduino/imuduino-btle

This project should set up your machine to serve a web page on localhost:3000, where you can scan and connect to IMUduino boards wirelessly over Bluetooth Low Energy.

Tested on Mac OSX with Bluetooth 4.0, and Ubuntu using Adafruit's Bluetooth 4.0 dongle (and a few additional libraries).

Please load the IMUduino_Bluetooth_UART_YawPitchRoll example sketch on to your board to see the Meteor app display IMU Yaw, Pitch, and Roll values.

(Uses Node 0.10.x)

# Setup

## Mac OSX setup
Install XCode. Then, install nvm.

Run `nvm install node` to get node installed on your Mac without sudo.

You should now install Meteor:
```
curl https://install.meteor.com/ | sh
```

On mac, you may need the xpc-connection npm package as well.  Add it to packages.json:
```
{
  "noble": "0.3.14",
  "xpc-connection": "0.1.3"
}
```

## Ubuntu Setup

Install nvm, then run `nvm install node` to get node installed on your Ubuntu machine without sudo.

You should now install Meteor:
```
curl https://install.meteor.com/ | sh
```

See the Noble setup info. You will need hcitools, hciconfig, libbluetooth-dev, and bluez packages.
https://github.com/sandeepmistry/noble#running-on-linux
```
sudo apt-get install bluetooth bluez-utils libbluetooth-dev
```

You will need a compatible Bluetooth 4.0 Dongle. 

We strongly urge you to buy Adafruit's Bluetooth 4.0 dongle, as it works right out of the box with GNU/Linux. http://www.adafruit.com/products/1327


# How to run

Open up a terminal window, navigate to the `imuduino-btle/Meteor/meteor-ble-uart` directory, and run the following command:

```
meteor run
```

This will automatically download needed dependencies (including the Noble npm package), and start hosting at `http://localhost:3000`

# Issues
This project is still working out some minor issues with async callbacks under the hood.
Try hitting CTRL+C to stop the meteor server (from your terminal where you started meteor), and starting it again: `meteor run`. Refresh your web page (`http://localhost:3000`)


# New project setup notes, just as a reference


Create the new meteor application.
From within the new meteor application folder,
Install the meteorhacks:npm and fourseven:scss meteor package
```
# See https://github.com/meteorhacks/npm
meteor add meteorhacks:npm

# See https://github.com/fourseven/meteor-scss
meteor add fourseven:scss
```

Then, try to run the meteor app, and follow any instructions. This should initialize the npm packaging setup.
```
meteor run
```

Now, update packages.json to have the following:

```
{
  "noble": "0.3.14"
}
```

To make things pretty, we can also include Bourbon, Neat, and bitters.

```
gem install bourbon neat bitters
```

...Now, from within the meteor application directory:
```
bourbon install
neat install
bitters install
```

...Then, inside of your SCSS file, add the following to the top.
```
@import "bourbon/bourbon";
@import "neat/neat";
@import "base/base";

body {
  -webkit-font-smoothing: antialiased;
}
```

...If you need specific components, you can copy and paste code from the official Thoughtbots 'refills' examples. See http://refills.bourbon.io/



Inside your JS file, in the Meteor.isServer section, you can get the Noble npm package with the following line of code:

```
var noble = Meteor.npmRequire('noble');
```

## Other notes
Remove the meteor 'autopublish' package to use the Meteor.publish() method within the isServer section, and Meteor.subscribe() method within the isClient section.
