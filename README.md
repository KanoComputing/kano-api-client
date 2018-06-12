# Kano API client

Provides a js API for browsers to communicate with our set of microservices.

## Usage

 - Import the client for the service you require
 - Instanciate with options
 - Call its methods
```js
import { AccountClient } from '@kano/api-client/index.js';

const account = new AccountClient({
    // Where to find the API
    url: 'https://my-api.stuff.me',
    // Default headers will be sent with all requests. Has default for json
    defaultHeaders: {
        'X-Special': 'Value',
    },
});

account.login('me', 'my-password').then(session => console.log(session));
```

You can share options across clients by giving another client to the contructor:

```js
import { AccountClient, UserClient } from '@kano/api-client/index.js';

const account = new AccountClient({
    // Where to find the API
    url: 'https://my-api.stuff.me',
});

// Same options here
const user = new UserClient(account);

```

## Clients

Implemented clients:

 - `AccountClient`:
    - login(username, password)
    - register({ username, password, email, marketing })
    - checkUsernameAvailability(username)
 - `UserClient`:
    - getById(id)
    - getByUsername(username)

More to come

## Plugins

You can add plugin to a client. A plugin is a set of methods called during the lifecycle of
a request.

Example:

```js
account.addPlugin({
    // Will be called before fetch. The endpoint about to be called will be provided
    // You can change any of its values. Adding a response property will cancel the call
    // to fetch and return the response right away
    beforeFetch(endpoint) {
        // Hi-jack the login endpoint and return static content
        // You can use this to provide offline features
        if (endpoint.name === 'login') {
            endpoint.response = {
                data: {
                    user: {
                        id: 'Hello',
                    },
                },
            };
        }
        // Alwasy return a Promise
        return Promise.resolve(endpoint);
    },
    // Will be called after the data was received bu before it is resolved to the client user
    // Use this to reformat the data, or for logging
    afterData(name, data) {
        if (name === 'login') {
            console.log(data);
        }
        return Promise.resolve(data);
    },
});
```

# kano-api-client.js

Install as a Bower component then import clients from a client API
```js
import client from '/bower_components/kano-api-client/kano-api-client.js';
```
or
```html
<link rel="import" href="/bower_components/kano-api-client/kano-api-client.html">
<!-- will expose `window.Kano.apiClient` -->
```

Assign the API to a variable including the settings. The settings options are our defaultUrl,resolve and log

defaultUrl: The URL of the API you are querying.

resolve: If result is true all populated Returns will be their values otherwise they will be returned as individual promises.

log: if you can't work out what's going on set this.
```js
const API = window.Kano.apiClient({
  defaultUrl:"http://ksworldapi-dev.us-west-1.elasticbeanstalk.com/",
  resolve:true,
  log:true,
})
```

The functions `create` `read` `update` `delete` and `login` are exposed by clientApi take 1 arguments that an object containing a params and a populate object. And return the populated object. 
here's an example with `login`.


```js
API.create({
 params:{
  user:{ 
    username:"bananabanana2", 
    password:".x&6,-U7ZG&`}c?h",
    email:"bb@kano.me"
  },
  populate:{
    id:"user.id"
  }
}) // == {id:"123456789aoeuidhtn"}
```
or
```js
API.login({
  params: {
    user: {
      username: "nectarsoft",
      password: "Chupand0nectar",
    },
  },
  populate:{
    id: "user.id",
    ui: {
      followers: {
        list: "user.followers"
      },
      following: {
        list: "user.following"
      },
    }
  },
}).then(user => {
  console.log(user)  
}).catch(err => {
  console.error(err)
})
```
Functions which doesn't take any arguments
```js
API.logout()
API.isLoggedIn() // returns false or username (if logged in)
```
