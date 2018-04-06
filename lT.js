var API = window.Kano.APICommunication({worldUrl:"http://ksworldapi-dev.us-west-1.elasticbeanstalk.com",resolve:true})



API.login({
  params: {
    username: "nectarsoft",
    password: "Chupand0nectar",
  },
  populate:{
    id: "user.id",
  }
}).then(user => {
  console.log(user)  
}).catch(err => {
  console.error(err)
})

setTimeout( _ => {
  API.login({
    params: {
      username: "nectarsoft",
      password: "Chupand0nectar",
    },
    populate:{
      id: "user.id",
    }
  }).then(user => {
    console.log(user)
  }).catch(err => {
    console.error(err)
  })
}, 1000)
