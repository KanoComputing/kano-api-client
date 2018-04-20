Install as a Bower component then import clients from a client API
```
import client from './kano-api-client.js';
```
Assign the API to a variable including the settings. The settings options are our worldUrl,resolve and log

worldUrl: The URL of the API you are querying.

resolve: If result is true all populated Returns will be their values otherwise they will be returned as individual promises.

log: if you can't work out what's going on set this.
```
const API = window.Kano.apiClient({
  worldUrl:"http://ksworldapi-dev.us-west-1.elasticbeanstalk.com",
  resolve:true,
  log:true,
})
```

The functions `create` `read` `update` `delete` and `login` are exposed by clientApi take 1 arguments that an object containing a params and a populate object. And return the populated object. 
here's an example with `login`.


```
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
logout which doesn't take any arguments
```
API.logout()

### expose value

```API.isLoggedIn```
