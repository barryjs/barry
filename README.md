# Barry.js - Keep your models up-to-date

Barry, the old gossip, is a simple JavaScript/Node.js library that keeps your client-side models synchronized with your server-side state.

Barry really loves Angular.js <= Socket.IO => Node.js, but all the actual integration with those tools consists of just a few lines of JavaScript, so you can easily write the glue to hook it into pretty much anything you want.

On the server-side you first define an endpoint. This is where you specify how clients will connect and how they'll be able to talk to Barry. Here is how you set up a Socket.IO endpoint:

``` js

var barry = require('barry-io').listen(80);

```

Your endpoint will provide a number of **services**. Let's say we want a service where we can get the current number of connected clients. Barry provides a number of pre-made types of services, one of which is a ScalarService, which is a service where people simply subscribe to a single value, like a string or, in our case, a number.

``` js
var barry = require('barry-io').listen(80);
var clientCount = barry.service('client/count', new barry.ScalarService);

clientCount.value = 0;
barry.on('connection', function (socket) {
  clientCount.value++;
  socket.on('disconnect', function () {
    clientCount.value--;
  });
});

```

That's it! Our server is ready to use. Let's see how an Angular.js-based client would use our brand-new service:

``` js
function MyCtrl($scope, $barry) {
  $barry.consumer('client/count').toScope($scope, 'numClients');
}
```

And now we can add a binding to our template:

``` html
<div ng-controller="MyCtrl">
  <p>We currently have <span ng-bind="numClients">???</span> connected clients.</p>
</div>
```

Pretty easy, right? Now Angular and Barry are going to completely take care of keeping this value updated for us. Even better: Barry takes care of loading the initial value when the controller is instantiated and unsubscribing when the user navigates away from the page.

But let's look at a more interesting example. This time we have a dictionary of values, a key/value store basically, and we want clients to be able to subscribe to some prefix of keys.

``` js
var barry = require('barry-socketio').listen(80);
var phonebook = barry.service('phonebook/:key', new barry.DictionaryService);

phonebook.load({
  "Anaya, Ione": '701-525-8821',
  "Ball, Alisha": '901-347-4799',
  "Bergeron, Delmar": '229-947-3619',
  "Brown, Phoebe": '831-702-6710',
  "Bryan, Jacob": '516-368-8216',
  "Close, Hugo": '314-290-5402',
  "Cyr, Russell": '609-643-8337',
  "Falk, Neline": '870-233-9360',
  "Houle, Sacripant": '217-896-6097',
  "Jensen, Michelle": '920-588-0342',
  "Jespersen, Lasse": '270-915-4595',
  "Joly, Manon": '972-409-3909',
  "Marjanovic, Janja": '530-480-3481',
  "Menclová, Marie": '253-245-3448',
  "Mitnick, Kevin": '555-123-9191',
  "Nekstad, Nellie": '612-321-5684',
  "Otterstad, Viljo": '818-408-5299',
  "Rauhala, Manu": '225-694-7010',
  "Saraste, Mauri": '918-347-5593',
  "Symanska, Adelajda": '810-626-5265',
  "Sønsterud, Helje": '347-246-2299',
  "Tomaszewska, Danuta": '617-369-6861',
  "Tomaszewski, Aron": '907-888-3780',
  "Viitala, Arttu": '281-310-7368',
  "Winkel, Lucas": '912-215-5446',
  "Zawadzki, Czcibor": '631-468-2299',
  "Zielinski, Ludwik": '417-442-7650'
});
```

// Kevin Mitnick is a badass hacker, so his phone number magically changes
// every two seconds! Ok, maybe not, but it's still good for our demo.
setInterval(function () {
  var value = phonebook.dict["Mitnick, Kevin"];
  value = value.slice(0, 8) + ((+value.slice(8) + 3943) % 9000 + 1000);
  phonebook.dict["Mitnick, Kevin"] = value;
}, 2000);
```

As for the client, let's code the UI first this time:

``` html
<div ng-controller="PhonebookCtrl">
  <p>Start typing a last name and matching entries will be automatically displayed:</p>
  <p><input type="text" ng-model="prefix"></p>
  <ul id="suggestions" ng-show="suggestions.$b.loaded">
    <li ng-repeat="name, no in suggestions">
      <strong>{{name}}:</strong> {{no}}
    </li>
  </ul>
  <p ng-hide="suggestions.$b.loaded">Loading suggestions...</p>
</div>
```

So we want to show a list of suggestions like an autocomplete of what the user entered. The interesting part is that this autocomplete will be self-updating!

You'll notice also that we're using a special value called $b. This contains a bunch of meta-information like what the state of the model is - is it initialized, is it live-updating, etc. In this case we're using `$b.loaded` to find out if it is initialized.

``` js
function PhonebookCtrl($scope, $barry) {
  var consumer = $barry.consumer(null).toScope($scope, 'suggestions');
  
  $scope.$watch('prefix', function (prefix) {
    consumer.setUrl('phonebook/'+prefix+'*');
  });
}
```

Another new trick: You can switch out services on the fly. So we start with a null service (which will tell Barry to just set the model to null) and once the user enters a prefix it will move to the correct service, subscribing and unsubscribing as required.


barry.service('clients', {
  init: function (req, model) {
    
  },
  apply: function (change);
  
  
  
  
# Meta-information (`$b`)

`$b.loaded` (Boolean)
True, if the model contains data, false if it doesn't.

`$b.updated` (Integer)
Timestamp of the last update to the model (client time).

`$b.updatedServer` (Integer)
Timestamp of the last update to the model (server time).