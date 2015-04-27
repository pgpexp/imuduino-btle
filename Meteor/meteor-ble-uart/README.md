
# Mac OSX setup
Install XCode
Install nvm
Run `nvm install node`


Install meteor: `curl https://install.meteor.com/ | sh`


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
