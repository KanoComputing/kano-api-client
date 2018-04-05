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

API.read({populate:{fo:"user",Name:"user.username"}}).then(console.log)
API.logout()

localStorage.getItem("KSqYgOe5Y4YpWj3cBbZSFHEYh6uod84miQySwFnEKo0=")
