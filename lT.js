var API = window.Kano.APICommunication({
  worldUrl:"http://ksworldapi-dev.us-west-1.elasticbeanstalk.com",
  resolve:true,
  log:true,
})

API.login({
  params: {
    username: "nectarsoft",
    password: "Chupand0nectar",
  },
  populate:{
    id: "user.id",
  },
}).then(user => {
  console.log(user)  
}).catch(err => {
  console.error(err)
})

setTimeout( _ => console.log("logging out in "), 1000)
setTimeout( _ => console.log(3), 2000)
setTimeout( _ => console.log(2), 3000)
setTimeout( _ => console.log(1), 4000)
setTimeout( _ => {API.logout()}, 5000)
setTimeout( _ => console.log("logging in in "), 6000)
setTimeout( _ => console.log(3), 7000)
setTimeout( _ => console.log(2), 8000)
setTimeout( _ => console.log(1), 9000)
setTimeout( _ => {
  API.login({
    params: {
      username: "nectarsoft",
      password: "Chupand0nectar",
    },
    populate:{
      id: "user.id",
    },
  }).then(user => {
    console.log(user)
  }).catch(err => {
    console.error(err)
  })
}, 1000)
