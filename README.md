Install as a Bower component then import clients from a client API
```js
import client from '/bower_components/kano-api-client/kano-api-client.js';
```
or
```html
<link rel="import" href="/bower_components/kano-api-client/kano-api-client.html">
<!-- will expose `window.Kano.apiClient` -->
```

Assign the API to a variable including the settings. The settings options are our worldUrl,resolve and log

worldUrl: The URL of the API you are querying.

resolve: If result is true all populated Returns will be their values otherwise they will be returned as individual promises.

log: if you can't work out what's going on set this.
```js
const API = window.Kano.apiClient({
  worldUrl:"http://ksworldapi-dev.us-west-1.elasticbeanstalk.com",
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
    username: "nectarsoft",
    password: "Chupand0nectar",
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
