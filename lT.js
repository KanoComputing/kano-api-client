var API = window.Kano.APICommunication({worldUrl:"172.168.86.10:8888",resolve:true})
API.login({
  params: {
    username: "nectarsoft",
	  password: "Chupand0nectar",
  },
  populate:{
    id: "user.id",
  }
).then(user => {
  console.log(user)  
}).catch(err => {
  console.error(err)
})

API.read({populate:{Name:"user.username"}}).then(console.log)
