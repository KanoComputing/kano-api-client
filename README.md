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
